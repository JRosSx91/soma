import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Bounds } from '@react-three/drei';
import { Suspense } from 'react';
import { BodyModel } from './BodyModel.js';
import type { BodyDiagram3DProps } from '../types.js';

export function BodyDiagram3D({
  organStates,
  onOrganHover,
  onOrganClick,
  highlightedOrganId,
}: BodyDiagram3DProps) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <Canvas
        camera={{ fov: 70 }}
        style={{ background: 'transparent' }}
        gl={{ toneMappingExposure: 1.0,
          toneMapping: THREE.NoToneMapping,
         }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 3, -5]} intensity={0.8} />

        <Environment preset="apartment" />

        <Suspense fallback={null}>
          <Bounds fit clip margin={0.65}>
            <BodyModel
              organStates={organStates}
              onOrganHover={onOrganHover}
              onOrganClick={onOrganClick}
              highlightedOrganId={highlightedOrganId}
            />
          </Bounds>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={10}
          makeDefault
        />
      </Canvas>
    </div>
  );
}