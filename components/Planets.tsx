import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Planet Data (Simplified for Visuals, not 1:1 scale)
const PLANET_DATA = [
  { name: 'Mercury', color: '#A5A5A5', distance: 3.5, size: 0.1, speed: 0.8 },
  { name: 'Venus',   color: '#E3BB76', distance: 5.0, size: 0.18, speed: 0.6 },
  { name: 'Earth',   color: '#2B328C', distance: 7.0, size: 0.2, speed: 0.5 },
  { name: 'Mars',    color: '#CF512D', distance: 9.0, size: 0.15, speed: 0.4 },
  { name: 'Jupiter', color: '#C99039', distance: 13.0, size: 0.7, speed: 0.2 },
  { name: 'Saturn',  color: '#EAD6B8', distance: 18.0, size: 0.6, speed: 0.15, hasRings: true },
  { name: 'Uranus',  color: '#D1E7E7', distance: 23.0, size: 0.4, speed: 0.1 },
  { name: 'Neptune', color: '#5B5DDF', distance: 27.0, size: 0.4, speed: 0.08 },
];

const Planet = ({ planet }: { planet: typeof PLANET_DATA[0] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Line>(null);

  // Random starting angle so they aren't all aligned
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Orbit Logic
      const angle = initialAngle.current + t * planet.speed * 0.3; // Slow down global speed a bit
      groupRef.current.position.x = Math.cos(angle) * planet.distance;
      groupRef.current.position.z = Math.sin(angle) * planet.distance;
      
      // Self Rotation
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      {/* The Orbit Path (Static Line) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.05, planet.distance + 0.05, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* The Planet Body */}
      <group ref={groupRef}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial 
            color={planet.color} 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        
        {/* Saturn's Rings */}
        {planet.hasRings && (
          <mesh rotation={[-Math.PI / 3, 0, 0]}>
            <ringGeometry args={[planet.size * 1.4, planet.size * 2.2, 64]} />
            <meshStandardMaterial 
              color="#Ceb898" 
              opacity={0.7} 
              transparent 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}
      </group>
    </>
  );
};

const Planets: React.FC = () => {
  return (
    <group>
      {PLANET_DATA.map((planet) => (
        <Planet key={planet.name} planet={planet} />
      ))}
    </group>
  );
};

export default Planets;