import { useGLTF } from '@react-three/drei';

const BODY_MALE_PATH = '/models/body_male.glb';

/**
 * Loads the male body glTF model. Cached by drei across components.
 *
 * Vite serves anything under `apps/web/public/` at the root path,
 * so `/models/body_male.glb` resolves to
 * `apps/web/public/models/body_male.glb`.
 */
export function useBodyModel() {
  const gltf = useGLTF(BODY_MALE_PATH);
  return gltf;
}

// Preload at module load so the model starts downloading before
// any component mounts. Cuts perceived loading time.
useGLTF.preload(BODY_MALE_PATH);