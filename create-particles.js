import * as THREE from "three";

export function createParticles(Nx, Ny, dx, dy) {
  const pos = [];
  const oldPos = [];
  const v = [];
  const N = Nx * Ny;
  const m = new Array(N).fill(1);

  for (let j = 0; j < Ny; j++) {
    for (let i = 0; i < Nx; i++) {
      const p = new THREE.Vector3(i * dx, j * dy, 0);

      pos.push(p.clone());
      oldPos.push(p.clone());
      v.push(new THREE.Vector3());
    }
  }

  // Fixed corners
  const cornerIDs = [0, Nx - 1, (Ny - 1) * Nx, Nx * Ny - 1];
  cornerIDs.forEach((id) => (m[id] = 0));

  // Center Point
  const centerI = Math.floor(Nx / 2);
  const centerJ = Math.floor(Ny / 2);
  const centerID = centerJ * Nx + centerI;
  m[centerID] = 0;
  const centerRestPos = pos[centerID].clone();

  return {
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
  };
}
