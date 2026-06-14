import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { createParticles } from "./create-particles.js";
import { createConstraints } from "./create-constraints.js";
import { createTriangles } from "./create-triangles.js";
import { handleGravityEnabled } from "./gravity-enabled.js";

let { gravityEnabled } = handleGravityEnabled();

// Parameters
const Nx = 25;
const Ny = 25;

const Lx = 1.0;
const Ly = 1.0;

const dx = Lx / (Nx - 1);
const dy = Ly / (Ny - 1);

const dt = 0.001;

const gravity = new THREE.Vector3(0, 0, -9.81);
const zeroGravity = new THREE.Vector3(0, 0, 0);

const maxIterations = 10;

const A = 0.15;
const omega = 8.0;

// Scene
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  100,
);

camera.position.set(1.8, -2.0, 1.2);

const controls = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 2));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(2, 2, 3);
scene.add(dirLight);

const {
  pos,
  oldPos,
  v,
  N,
  m,
  cornerIDs,
  centerI,
  centerJ,
  centerID,
  centerRestPos,
} = createParticles(Nx, Ny, dx, dy);

const constraints = createConstraints(pos, Nx, Ny);
const triangles = createTriangles(Nx, Ny);

const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array(N * 3);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(triangles);

const material = new THREE.MeshPhongMaterial({
  color: 0x77aaff,
  wireframe: false,
  side: THREE.DoubleSide,
});

const cloth = new THREE.Mesh(geometry, material);

scene.add(cloth);

const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(geometry),
  new THREE.LineBasicMaterial({
    color: 0x000000,
  }),
);

scene.add(wire);

function updateGeometry() {
  const arr = geometry.attributes.position.array;

  for (let i = 0; i < N; i++) {
    arr[3 * i + 0] = pos[i].x;
    arr[3 * i + 1] = pos[i].y;
    arr[3 * i + 2] = pos[i].z;
  }

  geometry.attributes.position.needsUpdate = true;

  geometry.computeVertexNormals();

  wire.geometry.dispose();
  wire.geometry = new THREE.WireframeGeometry(geometry);
}

let time = 0;

function simulate() {
  time += dt;

  for (let i = 0; i < N; i++) oldPos[i].copy(pos[i]);

  for (let i = 0; i < N; i++) {
    if (m[i] === 0) continue;
    const currentGravity = gravityEnabled ? gravity : zeroGravity;
    v[i].addScaledVector(currentGravity, dt);
    pos[i].addScaledVector(v[i], dt);
  }

  pos[centerID].copy(centerRestPos);
  pos[centerID].z += A * Math.sin(omega * time);

  for (let k = 0; k < maxIterations; k++) {
    for (const id of cornerIDs) pos[id].copy(oldPos[id]);

    pos[centerID].copy(centerRestPos);
    pos[centerID].z += A * Math.sin(omega * time);

    for (const c of constraints) {
      const p1 = pos[c.i];
      const p2 = pos[c.j];

      const d = new THREE.Vector3().subVectors(p1, p2);

      const len = d.length();

      if (len < 1e-8) continue;

      const C = len - c.rest;

      d.divideScalar(len);

      const w1 = m[c.i];
      const w2 = m[c.j];

      const wsum = w1 + w2;

      if (wsum === 0) continue;

      const corr = d.multiplyScalar(C / wsum);

      p1.addScaledVector(corr, -w1);
      p2.addScaledVector(corr, w2);
    }
  }

  for (let i = 0; i < N; i++) {
    v[i].subVectors(pos[i], oldPos[i]).divideScalar(dt);
  }
}

function animate() {
  requestAnimationFrame(animate);

  simulate();
  updateGeometry();

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
