// ------------------------------------------------------------------
// HIGH-FIDELITY PLASMA SHADER (VFX STANDARD)
// ------------------------------------------------------------------

export const vertexShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uTurbulence;
uniform float uDisplacementScale;
uniform float uNoiseScale;

varying vec2 vUv;
varying float vNoise;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;

// --- ASHIMA SIMPLEX NOISE ---
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

// --- FBM (FRACTAL BROWNIAN MOTION) ---
float fbm(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 4; ++i) { // 4 Octaves
    v += a * snoise(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vUv = uv;
  vNormal = normal;
  vViewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
  
  // Coordinate system for noise
  vec3 noisePos = position * uNoiseScale;
  
  // Animate noise
  float time = uTime * uSpeed;
  vec3 animOffset = vec3(sin(time * 0.5), cos(time * 0.3), sin(time * 0.2)) * 2.0;
  
  float noise = fbm(noisePos + animOffset);
  
  // We reduce the sharpness of the valleys slightly to avoid tearing the mesh too much
  float turb = abs(noise); 
  
  float displacement = turb * uDisplacementScale * uTurbulence;
  
  vec3 newPosition = position + normal * displacement;
  
  vPosition = newPosition;
  vNoise = turb; 
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

export const fragmentShader = `
uniform vec3 uColorCore;
uniform vec3 uColorOuter;
uniform float uTime;

varying float vNoise;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDir;

void main() {
  // 1. RIM LIGHTING
  float fresnel = dot(vViewDir, normalize(vNormal));
  fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
  
  // 2. DENSITY MAPPING
  float density = vNoise; 
  
  // Relaxed contrast for a softer, gaseous look (Image 1 style)
  // Previous was 1.5, now 1.2 to keep more mid-tones
  density = pow(density, 1.2); 
  
  // 3. COLOR RAMP
  // Core is white-hot, edges are golden/red
  vec3 color;
  
  vec3 darkColor = vec3(0.05, 0.0, 0.0); 
  
  // Mix 1: Outer shell
  color = mix(darkColor, uColorOuter, smoothstep(0.0, 0.5, density));
  
  // Mix 2: Inner Core (Glow)
  color = mix(color, uColorCore, smoothstep(0.4, 0.9, density));
  
  // Mix 3: Intense Highlight
  vec3 white = vec3(1.0, 1.0, 1.0);
  color = mix(color, white, smoothstep(0.85, 1.0, density));
  
  // 4. ATMOSPHERE / RIM GLOW
  float rimIntensity = pow(fresnel, 3.0);
  color += uColorOuter * rimIntensity * 1.5;

  // 5. SOFT ALPHA (The Fix)
  // Instead of hard clipping, we simply fade out low-density areas at the edge.
  float alpha = 1.0;
  
  // Basic erosion based on noise (creates the shape)
  float noiseErosion = smoothstep(0.15, 0.4, density + 0.1);
  
  // At grazing angles (high fresnel), we rely HEAVILY on erosion to create "wisps"
  // But we never set alpha to exactly 0.0 instantly to avoid jagged lines.
  float edgeFade = mix(1.0, noiseErosion, fresnel);
  
  alpha = edgeFade;
  
  // Ensure the core is always solid
  alpha = max(alpha, 0.95 - fresnel);

  gl_FragColor = vec4(color, alpha);
}
`;