'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const EnergyCoreMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#00f2ff'),
    uIntensity: 2.0,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  // Simple noise function
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }

  void main() {
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    float dist = length(vPosition);
    
    // Fresnel effect for edge glow
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    
    // Animated noise patterns
    float n = noise(vPosition + uTime * 0.1);
    
    vec3 finalColor = uColor * (uIntensity + pulse + fresnel * 2.0);
    float alpha = clamp(fresnel + 0.2, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
  `
);

extend({ EnergyCoreMaterial });

export default EnergyCoreMaterial;
