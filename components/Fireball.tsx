import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './FireShader';
import { FireConfig, FireUniforms } from '../types';

interface FireballProps {
  config: FireConfig;
}

const Fireball: React.FC<FireballProps> = ({ config }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Initialize Uniforms
  const uniforms = useMemo<FireUniforms>(
    () => ({
      uTime: { value: 0 },
      uColorCore: { value: new THREE.Color(config.colorCore) },
      uColorOuter: { value: new THREE.Color(config.colorOuter) },
      uSpeed: { value: config.speed },
      uTurbulence: { value: config.turbulence },
      uNoiseScale: { value: config.noiseScale },
      uDisplacementScale: { value: config.displacementScale },
    }),
    [] // Run once
  );

  // Update uniforms when config props change
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Smooth interpolation
      materialRef.current.uniforms.uColorCore.value.lerp(new THREE.Color(config.colorCore), 0.1);
      materialRef.current.uniforms.uColorOuter.value.lerp(new THREE.Color(config.colorOuter), 0.1);
      materialRef.current.uniforms.uSpeed.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uSpeed.value, config.speed, 0.1);
      materialRef.current.uniforms.uTurbulence.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uTurbulence.value, config.turbulence, 0.1);
      materialRef.current.uniforms.uNoiseScale.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uNoiseScale.value, config.noiseScale, 0.1);
      materialRef.current.uniforms.uDisplacementScale.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uDisplacementScale.value, config.displacementScale, 0.1);
    }
  });

  return (
    <group scale={config.scale}>
        {/* Main Volumetric Core */}
        <mesh ref={meshRef}>
        {/* Increased segment count from 64 to 128 for "crunchy" detail */}
        <icosahedronGeometry args={[1, 128]} /> 
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            // Additive blending can washout details. 
            // We switch to Normal Blending but handle glow in shader for better contrast control.
            blending={THREE.NormalBlending} 
            depthWrite={false}
            side={THREE.DoubleSide}
        />
        </mesh>
        
        {/* Inner intense core - slightly smaller to act as the solid mass */}
        <mesh scale={0.95}>
             <icosahedronGeometry args={[1, 32]} />
             <meshBasicMaterial color="#000000" /> 
        </mesh>
    </group>
  );
};

export default Fireball;