import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  ClampToEdgeWrapping,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RedFormat,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import './style.css';
import './mobile.css';
import './esgotei.css';
import './mobile.js';

const THREE = {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  ClampToEdgeWrapping,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RedFormat,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
};
const chunkCount = 11;
const loading = document.createElement('div');
loading.className = 'runtime-loading';
loading.textContent = 'LOADING THE DIRTY OCEAN…';
document.body.append(loading);

try {
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) =>
      fetch(new URL(`game/part-${index + 1}.txt`, document.baseURI)).then((response) => {
        if (!response.ok) throw new Error(`Game chunk ${index + 1} failed: ${response.status}`);
        return response.text();
      }),
    ),
  );
  Function('THREE', `'use strict';\n${chunks.join('')}`)(THREE);
  loading.remove();
} catch (error) {
  console.error(error);
  loading.textContent = 'THE OCEAN FAILED TO LOAD. REFRESH THE PAGE.';
  loading.classList.add('error');
}
