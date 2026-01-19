import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SparkVertexShader = `
uniform float uTime;
uniform float uSpeed;

attribute float aRandom;
attribute float aSize;
attribute float aSpeedOffset;
attribute vec3 aStartPos;

varying float vLife;

// --- CURL NOISE (Simulates fluid/gas motion) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = snoise(p - dx) * vec3(1.0);
    vec3 p_x1 = snoise(p + dx) * vec3(1.0);
    vec3 p_y0 = snoise(p - dy) * vec3(1.0);
    vec3 p_y1 = snoise(p + dy) * vec3(1.0);
    vec3 p_z0 = snoise(p - dz) * vec3(1.0);
    vec3 p_z1 = snoise(p + dz) * vec3(1.0);

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    return normalize(vec3(x, y, z));
}

void main() {
  float speedMultiplier = 0.5;
  // Loop time 0-1
  float t = mod(uTime * (uSpeed * speedMultiplier) + aSpeedOffset, 1.0);
  
  // Start from surface
  vec3 pos = aStartPos;
  
  // Drift outward radially based on time
  vec3 radialDir = normalize(pos);
  pos += radialDir * (t * 4.0); 

  // Add Curl Noise for swirling atmosphere effect
  // We sample noise based on position and time
  vec3 curl = curlNoise(pos * 0.5 + vec3(0.0, uTime * 0.2, 0.0));
  pos += curl * t * 1.5; // Curl increases as it gets further out

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Perspective resizing
  gl_PointSize = aSize * (1.0 / -mvPosition.z);
  
  // Fade in at start, fade out at end
  float alpha = smoothstep(0.0, 0.1, t) * (1.0 - t); 
  
  gl_Position = projectionMatrix * mvPosition;
  vLife = alpha;
}
`;

const SparkFragmentShader = `
uniform vec3 uColor;
varying float vLife;

void main() {
  vec2 pc = gl_PointCoord - vec2(0.5);
  float dist = length(pc);
  
  // Soft glow sprite
  float strength = 0.05 / (dist * dist + 0.01);
  strength = pow(strength, 1.5);
  
  if (strength < 0.01) discard;

  gl_FragColor = vec4(uColor, strength * vLife);
}
`;

interface SparksProps {
  color: string;
  count?: number;
}

const Sparks: React.FC<SparksProps> = ({ color, count = 2000 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const particleCount = 2000; // Force high count for "Haze"
    const startPositions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const speedOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spawn on surface of sphere (radius approx 1.1)
      // Slightly larger than mesh to sit on top/outside
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 0.3; // Depth of spawn layer

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      startPositions[i * 3] = x;
      startPositions[i * 3 + 1] = y;
      startPositions[i * 3 + 2] = z;

      randoms[i] = Math.random();
      
      // Variable sizes: lots of small dust, few large flares
      if (Math.random() > 0.9) {
          sizes[i] = Math.random() * 40.0 + 20.0; // Big flare
      } else {
          sizes[i] = Math.random() * 5.0 + 2.0; // Fine dust
      }
      
      speedOffsets[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(startPositions, 3)); // Using as generic attrib container
    geo.setAttribute('aStartPos', new THREE.BufferAttribute(startPositions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSpeedOffset', new THREE.BufferAttribute(speedOffsets, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 0.2 },
    uColor: { value: new THREE.Color(color) }
  }), [color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uColor.value.lerp(new THREE.Color(color), 0.1);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={SparkVertexShader}
        fragmentShader={SparkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Sparks;