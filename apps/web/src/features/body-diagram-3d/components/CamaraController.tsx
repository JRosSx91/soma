import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsType } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { useCameraStore } from "../store/useCamaraStore";
import { ORGAN_TO_MESH_NAME } from "../organ-mesh-map.js";

const FOCUS_DURATION_MS = 600;
const FOCUS_OFFSET = new THREE.Vector3(0, 0, 2.5);

interface AnimState {
  active: boolean;
  startPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  endPos: THREE.Vector3;
  endTarget: THREE.Vector3;
  startTime: number;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function CameraController() {
  const { camera, scene, controls } = useThree();
  const focusOrganId = useCameraStore((s) => s.focusOrganId);
  const animRef = useRef<AnimState | null>(null);

  useEffect(() => {
    if (!focusOrganId) return;

    const meshName = ORGAN_TO_MESH_NAME[focusOrganId];
    if (!meshName) return;

    let organGroup: THREE.Object3D | null = null;
    scene.traverse((obj) => {
      if (obj.name === meshName && !organGroup) organGroup = obj;
    });
    if (!organGroup) return;

    // Compute bounding box center of the organ
    const box = new THREE.Box3().setFromObject(organGroup as THREE.Object3D);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const startPos = camera.position.clone();
    const startTarget =
      (controls as unknown as OrbitControlsType)?.target?.clone() ??
      new THREE.Vector3();

    const endTarget = center.clone();
    const endPos = center.clone().add(FOCUS_OFFSET);

    animRef.current = {
      active: true,
      startPos,
      startTarget,
      endPos,
      endTarget,
      startTime: performance.now(),
    };
  }, [focusOrganId, camera, scene, controls]);

  useFrame(() => {
    const anim = animRef.current;
    if (!anim?.active) return;

    const elapsed = performance.now() - anim.startTime;
    const raw = Math.min(elapsed / FOCUS_DURATION_MS, 1);
    const t = easeInOut(raw);

    camera.position.lerpVectors(anim.startPos, anim.endPos, t);

    const orbitControls = controls as unknown as OrbitControlsType;
    if (orbitControls?.target) {
      orbitControls.target.lerpVectors(anim.startTarget, anim.endTarget, t);
      orbitControls.update();
    }

    if (raw >= 1) {
      animRef.current = { ...anim, active: false };
    }
  });

  return null;
}
