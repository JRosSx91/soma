import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsType } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import type { OrganId } from "@soma/shared-types";
import { useCameraStore } from "../store/useCamaraStore";
import { ORGAN_TO_MESH_NAME } from "../organ-mesh-map.js";

const FOCUS_DURATION_MS = 750;
const FRAME_MARGIN = 1.6;
const SKIN_PADDING_M = 0.04;
const MIN_CAMERA_DISTANCE = 0.05;
/** Bounds animates for up to 1s. Wait that out, then a few still frames. */
const OVERVIEW_WAIT_MS = 1100;
const STABLE_FRAMES = 12;
const POSE_EPSILON = 0.004;
const MOBILE_MAX_WIDTH = 768;
/** Shifts the organ upward in frame so the bottom sheet does not cover it. */
const MOBILE_FRAME_BIAS = 0.42;

interface OverviewPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  near: number;
  far: number;
}

interface AnimState {
  active: boolean;
  restoreLimits: boolean;
  startPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  endPos: THREE.Vector3;
  endTarget: THREE.Vector3;
  startTime: number;
  durationMs: number;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function asOrbit(
  controls: unknown,
): OrbitControlsType | null {
  if (!controls || typeof controls !== "object") return null;
  if (!("target" in controls)) return null;
  return controls as OrbitControlsType;
}

function asPerspective(
  camera: THREE.Camera,
): THREE.PerspectiveCamera | null {
  return (camera as THREE.PerspectiveCamera).isPerspectiveCamera
    ? (camera as THREE.PerspectiveCamera)
    : null;
}

function modelOffsetApplied(root: THREE.Object3D): boolean {
  let ready = false;
  root.traverse((obj) => {
    if (ready || obj.name !== "skin") return;
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (Math.abs(current.position.y + 0.1) < 1e-3) {
        ready = true;
        return;
      }
      current = current.parent;
    }
  });
  return ready;
}

function findNamed(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (!found && obj.name === name) found = obj;
  });
  return found;
}

function worldBox(
  root: THREE.Object3D,
  name: string,
  cache: Map<string, THREE.Box3>,
): THREE.Box3 | null {
  const cached = cache.get(name);
  if (cached) return cached;

  const object = findNamed(root, name);
  if (!object) return null;

  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;

  cache.set(name, box);
  return box;
}

function frameDistance(
  radius: number,
  fovDeg: number,
  aspect: number,
  margin: number,
): number {
  const tanV = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2);
  const tanH = tanV * Math.max(aspect, 1e-3);
  const distV = radius / Math.max(tanV, 1e-4);
  const distH = radius / Math.max(tanH, 1e-4);
  return Math.max(distV, distH) * margin;
}

/** Distance along `direction` from an interior point to the outside of `box`. */
function exitDistance(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  box: THREE.Box3,
): number {
  if (!box.containsPoint(origin)) return 0;

  let tMax = Infinity;
  const originAxis = [origin.x, origin.y, origin.z];
  const directionAxis = [direction.x, direction.y, direction.z];
  const minAxis = [box.min.x, box.min.y, box.min.z];
  const maxAxis = [box.max.x, box.max.y, box.max.z];

  for (let axis = 0; axis < 3; axis += 1) {
    if (Math.abs(directionAxis[axis]) < 1e-8) {
      if (originAxis[axis] < minAxis[axis] || originAxis[axis] > maxAxis[axis]) {
        return 0;
      }
      continue;
    }
    let t1 = (minAxis[axis] - originAxis[axis]) / directionAxis[axis];
    let t2 = (maxAxis[axis] - originAxis[axis]) / directionAxis[axis];
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
    }
    tMax = Math.min(tMax, t2);
  }

  if (!Number.isFinite(tMax) || tMax < 0) return 0;
  return tMax;
}

function posesMatch(
  positionA: THREE.Vector3,
  positionB: THREE.Vector3,
  targetA: THREE.Vector3,
  targetB: THREE.Vector3,
): boolean {
  return (
    positionA.distanceTo(positionB) < POSE_EPSILON &&
    targetA.distanceTo(targetB) < POSE_EPSILON
  );
}

export function CameraController() {
  const gl = useThree((state) => state.gl);
  const getThree = useThree((state) => state.get);

  const overviewRef = useRef<OverviewPose | null>(null);
  const boxesRef = useRef<Map<string, THREE.Box3>>(new Map());
  const animRef = useRef<AnimState | null>(null);
  const appliedNonceRef = useRef(useCameraStore.getState().focusNonce);
  const modelReadyAtRef = useRef<number | null>(null);
  const stableFramesRef = useRef(0);
  const lastPosRef = useRef(new THREE.Vector3());
  const lastTargetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const element = gl.domElement;

    const releaseToUser = () => {
      const anim = animRef.current;
      if (!anim?.active) return;
      anim.active = false;
      const orbit = asOrbit(getThree().controls);
      if (orbit) orbit.enabled = true;
    };

    element.addEventListener("pointerdown", releaseToUser, true);
    element.addEventListener("wheel", releaseToUser, true);
    return () => {
      element.removeEventListener("pointerdown", releaseToUser, true);
      element.removeEventListener("wheel", releaseToUser, true);
      const orbit = asOrbit(getThree().controls);
      if (orbit) orbit.enabled = true;
    };
  }, [gl, getThree]);

  useFrame((state) => {
    const orbit = asOrbit(state.controls);
    const camera = asPerspective(state.camera);
    if (!orbit?.target || !camera) return;

    if (!overviewRef.current) {
      if (!modelOffsetApplied(state.scene)) return;

      if (modelReadyAtRef.current === null) {
        modelReadyAtRef.current = performance.now();
        lastPosRef.current.copy(camera.position);
        lastTargetRef.current.copy(orbit.target);
        return;
      }

      const still =
        camera.position.distanceTo(lastPosRef.current) < 0.0005 &&
        orbit.target.distanceTo(lastTargetRef.current) < 0.0005;
      lastPosRef.current.copy(camera.position);
      lastTargetRef.current.copy(orbit.target);
      stableFramesRef.current = still ? stableFramesRef.current + 1 : 0;

      const waited =
        performance.now() - modelReadyAtRef.current >= OVERVIEW_WAIT_MS;
      if (!waited || stableFramesRef.current < STABLE_FRAMES) return;

      overviewRef.current = {
        position: camera.position.clone(),
        target: orbit.target.clone(),
        minDistance: orbit.minDistance,
        maxDistance: orbit.maxDistance,
        near: camera.near,
        far: camera.far,
      };
    }

    const overview = overviewRef.current;
    const request = useCameraStore.getState();
    if (request.focusNonce !== appliedNonceRef.current) {
      appliedNonceRef.current = request.focusNonce;
      beginTransition(
        request.focusOrganId,
        camera,
        state.scene,
        orbit,
        window.innerWidth,
        overview,
        boxesRef.current,
        animRef,
      );
    }

    const anim = animRef.current;
    if (!anim?.active) return;

    const elapsed = performance.now() - anim.startTime;
    const raw =
      anim.durationMs <= 0 ? 1 : Math.min(elapsed / anim.durationMs, 1);
    const t = easeInOut(raw);

    camera.position.lerpVectors(anim.startPos, anim.endPos, t);
    orbit.target.lerpVectors(anim.startTarget, anim.endTarget, t);
    camera.lookAt(orbit.target);

    if (raw < 1) return;

    camera.position.copy(anim.endPos);
    orbit.target.copy(anim.endTarget);
    if (anim.restoreLimits) restoreLimits(camera, orbit, overview);
    anim.active = false;
    orbit.enabled = true;
    orbit.update();
  });

  return null;
}

function restoreLimits(
  camera: THREE.PerspectiveCamera,
  orbit: OrbitControlsType,
  overview: OverviewPose,
): void {
  orbit.minDistance = overview.minDistance;
  orbit.maxDistance = overview.maxDistance;
  camera.near = overview.near;
  camera.far = overview.far;
  camera.updateProjectionMatrix();
}

function beginTransition(
  organId: OrganId | null,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Object3D,
  orbit: OrbitControlsType,
  windowWidth: number,
  overview: OverviewPose,
  boxes: Map<string, THREE.Box3>,
  animRef: { current: AnimState | null },
): void {
  const startPos = camera.position.clone();
  const startTarget = orbit.target.clone();

  if (organId === null) {
    if (posesMatch(startPos, overview.position, startTarget, overview.target)) {
      restoreLimits(camera, orbit, overview);
      orbit.enabled = true;
      animRef.current = null;
      return;
    }
    queueAnimation(
      animRef,
      orbit,
      startPos,
      startTarget,
      overview.position.clone(),
      overview.target.clone(),
      true,
    );
    return;
  }

  const meshName = ORGAN_TO_MESH_NAME[organId];
  const organBox = meshName ? worldBox(scene, meshName, boxes) : null;
  if (!organBox) {
    if (animRef.current?.active) animRef.current.active = false;
    orbit.enabled = true;
    return;
  }

  const center = organBox.getCenter(new THREE.Vector3());
  const size = organBox.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() * 0.5, 0.001);

  const direction = startPos.clone().sub(startTarget);
  if (direction.lengthSq() < 1e-8) direction.set(0, 0.15, 1);
  direction.normalize();

  const skinBox = worldBox(scene, "skin", boxes);
  const clearanceBox = skinBox?.clone().expandByScalar(SKIN_PADDING_M) ?? null;
  const clearance = clearanceBox
    ? exitDistance(center, direction, clearanceBox)
    : 0;

  const overviewDistance = Math.max(
    overview.position.distanceTo(overview.target),
    MIN_CAMERA_DISTANCE,
  );
  let distance = Math.max(
    frameDistance(radius, camera.fov, camera.aspect, FRAME_MARGIN),
    clearance,
    radius * 1.35,
    MIN_CAMERA_DISTANCE,
  );
  if (clearance <= overviewDistance) {
    distance = Math.min(distance, overviewDistance);
  }

  const endTarget = center.clone();
  const endPos = center.clone().addScaledVector(direction, distance);

  if (windowWidth < MOBILE_MAX_WIDTH) {
    const shift =
      distance *
      Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
      MOBILE_FRAME_BIAS;
    const shiftVec = camera.up.clone().normalize().multiplyScalar(-shift);
    const shiftedPos = endPos.clone().add(shiftVec);
    if (!clearanceBox || !clearanceBox.containsPoint(shiftedPos)) {
      endTarget.add(shiftVec);
      endPos.add(shiftVec);
    }
  }

  orbit.minDistance = Math.min(
    overview.minDistance,
    Math.max(MIN_CAMERA_DISTANCE, radius * 1.25, distance * 0.45),
  );
  orbit.maxDistance = Math.max(overview.maxDistance, distance, overviewDistance);
  camera.near = Math.min(overview.near, Math.max(0.01, distance / 80));
  camera.far = Math.max(overview.far, distance * 20);
  camera.updateProjectionMatrix();

  if (posesMatch(startPos, endPos, startTarget, endTarget)) {
    orbit.enabled = true;
    animRef.current = null;
    return;
  }

  queueAnimation(
    animRef,
    orbit,
    startPos,
    startTarget,
    endPos,
    endTarget,
    false,
  );
}

function queueAnimation(
  animRef: { current: AnimState | null },
  orbit: OrbitControlsType,
  startPos: THREE.Vector3,
  startTarget: THREE.Vector3,
  endPos: THREE.Vector3,
  endTarget: THREE.Vector3,
  restoreLimitsOnEnd: boolean,
): void {
  const durationMs = prefersReducedMotion() ? 0 : FOCUS_DURATION_MS;
  orbit.enabled = durationMs > 0 ? false : orbit.enabled;

  animRef.current = {
    active: true,
    restoreLimits: restoreLimitsOnEnd,
    startPos,
    startTarget,
    endPos,
    endTarget,
    startTime: performance.now(),
    durationMs,
  };

  if (durationMs > 0) return;

  // The frame loop applies a zero-duration pose on this same tick.
}
