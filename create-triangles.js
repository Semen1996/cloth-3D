export function createTriangles(Nx, Ny) {
  const triangles = [];

  for (let j = 0; j < Ny - 1; j++) {
    for (let i = 0; i < Nx - 1; i++) {
      const v1 = j * Nx + i;
      const v2 = v1 + 1;
      const v3 = v1 + Nx;
      const v4 = v3 + 1;

      triangles.push(v1, v2, v4);
      triangles.push(v1, v4, v3);
    }
  }

  return triangles;
}
