import * as THREE from 'three';

export interface FireConfig {
  colorCore: string;
  colorOuter: string;
  speed: number;
  turbulence: number;
  scale: number;
  displacementScale: number;
  noiseScale: number;
}

export interface GeneratedFireStyle {
  config: FireConfig;
  reasoning: string;
}

// GLSL Uniform Types
export interface FireUniforms {
  [uniform: string]: { value: any };
  uTime: { value: number };
  uColorCore: { value: THREE.Color };
  uColorOuter: { value: THREE.Color };
  uSpeed: { value: number };
  uTurbulence: { value: number };
  uNoiseScale: { value: number };
  uDisplacementScale: { value: number };
}