import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Fireball from './components/Fireball';
import Sparks from './components/Sparks';
import Planets from './components/Planets';
import Controls from './components/Controls';
import { FireConfig } from './types';

// VFX CALIBRATION
// Updated based on user telemetry (Screenshot)
const DEFAULT_CONFIG: FireConfig = {
  colorCore: '#ffffff', 
  colorOuter: '#fb5151',
  speed: 1.40, 
  turbulence: 0.20, 
  scale: 1.40,
  displacementScale: 0.29, 
  noiseScale: 10.00,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<FireConfig>(DEFAULT_CONFIG);

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden">
      {/* 3D Scene */}
      <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMappingExposure: 1.0 }} shadows>
        <PerspectiveCamera makeDefault position={[0, 10, 25]} fov={40} />
        
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* The Sun */}
            <Fireball config={config} />
            
            {/* 
              Solar Illumination:
              The shader is self-illuminated, but we need a real light source 
              to light up the planets. 
            */}
            <pointLight position={[0, 0, 0]} intensity={2.5} distance={100} decay={0.5} color="#fff0dd" />

            {/* Atmospheric Haze (Sparks) - Reduced scale to match new star size */}
            <group scale={config.scale / 2.0}>
               <Sparks color={config.colorOuter} count={1000} />
            </group>

            {/* The 8 Planets */}
            <Planets />
          </group>
          
          {/* Deep Space Background */}
          <Stars 
            radius={200} 
            depth={50} 
            count={8000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={0} 
          />
        </Suspense>
        
        <OrbitControls 
          enablePan={true} 
          minDistance={3.5} 
          maxDistance={50} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />

        {/* POST PROCESSING */}
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
          />
          <Noise opacity={0.1} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none select-none z-10">
        <div className="border-l-2 border-red-500 pl-4">
          <h1 className="text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            SOLARIS
          </h1>
          <p className="text-red-400 text-xs mt-1 font-mono tracking-widest uppercase">
            System Overview
          </p>
          <div className="text-white/30 text-[10px] font-mono mt-2">
            <p>STAR TYPE: G-SEQUENCE</p>
            <p>PLANETARY BODIES: 8</p>
          </div>
        </div>
      </div>

      <Controls config={config} setConfig={setConfig} />
    </div>
  );
};

export default App;