import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { OrganId } from '@soma/shared-types';
import { useBodyModel } from '../hooks/useBodyModel.js';
import { ORGAN_TO_MESH_NAME, MESH_NAME_TO_ORGAN } from '../organ-mesh-map.js';
import type { OrganStateMap } from '../types.js';
import { interpolateOrganColor } from '../anatomical-colors.js';

interface BodyModelProps {
  organStates: OrganStateMap;
  onOrganHover?: (organId: OrganId | null) => void;
  onOrganClick?: (organId: OrganId) => void;
  highlightedOrganId?: OrganId | null;
}

const ORGAN_VERTEX_SHADER = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORGAN_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uHighlight;
  varying vec3 vNormal;

  void main() {
    // Lambert-like shading from a fixed front-top light direction
    // Range: 0.55 (back face) to 1.15 (front face)
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.6));
    float lambert = max(dot(vNormal, lightDir), 0.0);
    float shading = 0.55 + 0.6 * lambert;

    vec3 base = uColor * shading;
    vec3 highlighted = mix(base, vec3(1.0, 1.0, 1.0), uHighlight * 0.4);

    gl_FragColor = vec4(highlighted, 1.0);
  }
`;

function findOrganIdFromObject(obj: THREE.Object3D): OrganId | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    const candidate = MESH_NAME_TO_ORGAN.get(current.name);
    if (candidate) return candidate;
    current = current.parent;
  }
  return null;
}

export function BodyModel({
  organStates,
  onOrganHover,
  onOrganClick,
  highlightedOrganId = null,
}: BodyModelProps) {
  const { scene } = useBodyModel();

  const organMeshes = useMemo(() => {
    const knownNames = new Set(
      Object.values(ORGAN_TO_MESH_NAME).filter((n): n is string => n !== null),
    );
    const result = new Map<string, THREE.Mesh[]>();

    scene.traverse((obj) => {
      if (!knownNames.has(obj.name)) return;

      const meshes: THREE.Mesh[] = [];
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });

      if (meshes.length > 0) {
        result.set(obj.name, meshes);
      }
    });

    return result;
  }, [scene]);

  const organMaterials = useMemo(() => {
    const map = new Map<string, THREE.ShaderMaterial>();

    organMeshes.forEach((meshes, organName) => {
      const isSkin = organName === 'skin';

      if (isSkin) {
        const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.0,
    transmission: 0.9,
    thickness: 0.1,
    ior: 1.05,
    opacity: 0.75,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  meshes.forEach((mesh) => {
    mesh.material = material;
    mesh.renderOrder = 999;
    mesh.raycast = () => null;
  });

  // Skin no se mete en el Map de organMaterials porque
  // los useEffect de coloreado y highlight no la tocan.
  return;
      }

      const material = new THREE.ShaderMaterial({
        vertexShader: ORGAN_VERTEX_SHADER,
        fragmentShader: ORGAN_FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Vector3(0.35, 0.31, 0.28) },
          uHighlight: { value: 0.0 },
        },
      });

      meshes.forEach((mesh) => {
        mesh.material = material;
      });

      map.set(organName, material);
    });

    return map;
  }, [organMeshes]);

  // Apply colors via direct scene traversal — bypasses any potential
  // material clone issue from React Three Fiber's <primitive>.
  useEffect(() => {
    // Reset all organ materials in the scene tree
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (!(obj.material instanceof THREE.ShaderMaterial)) return;
      if (obj.material.uniforms.uColor) {
        obj.material.uniforms.uColor.value = new THREE.Vector3(0.35, 0.31, 0.28);
      }
    });

    // Apply colors per organ state
    organStates.forEach((state, organId) => {
      const meshName = ORGAN_TO_MESH_NAME[organId];
      if (!meshName) return;
      if (!state.active) return;
      if (meshName === 'skin') return;

      const colorString = interpolateOrganColor(organId, state.progressFraction);
      const tempColor = new THREE.Color(colorString);
      const vec = new THREE.Vector3(tempColor.r, tempColor.g, tempColor.b);

      // Find the organ group in the scene by name
      let organGroup: THREE.Object3D | null = null;
      scene.traverse((obj) => {
        if (obj.name === meshName && !organGroup) organGroup = obj;
      });

      if (!organGroup) return;

      // Apply color to all descendant meshes
      (organGroup as THREE.Object3D).traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (!(child.material instanceof THREE.ShaderMaterial)) return;
        if (child.material.uniforms.uColor) {
          child.material.uniforms.uColor.value = vec.clone();
        }
      });
    });
  }, [organStates, scene]);

  // Apply highlight via direct uniforms manipulation
  useEffect(() => {
    organMaterials.forEach((material, meshName) => {
      const isHighlighted =
        highlightedOrganId !== null &&
        ORGAN_TO_MESH_NAME[highlightedOrganId] === meshName;
      material.uniforms.uHighlight.value = isHighlighted ? 1.0 : 0.0;
    });
  }, [highlightedOrganId, organMaterials]);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const organId = findOrganIdFromObject(event.object);
    if (organId && onOrganHover) {
      onOrganHover(organId);
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (onOrganHover) {
      onOrganHover(null);
    }
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const organId = findOrganIdFromObject(event.object);
    if (organId && onOrganClick) {
      onOrganClick(organId);
    }
  };

  return (
    <primitive
      object={scene}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  );
}