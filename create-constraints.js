export function createConstraints(pos, Nx, Ny) {
  const constraints = [];

  function addConstraint(i, j) {
    constraints.push({
      i,
      j,
      rest: pos[i].distanceTo(pos[j]),
    });
  }

  for (let j = 0; j < Ny; j++) {
    for (let i = 0; i < Nx; i++) {
      const id = j * Nx + i;

      if (i < Nx - 1) addConstraint(id, id + 1);

      if (j < Ny - 1) addConstraint(id, id + Nx);

      if (i < Nx - 1 && j < Ny - 1) addConstraint(id, id + Nx + 1);

      if (i > 0 && j < Ny - 1) addConstraint(id, id + Nx - 1);
    }
  }

  return constraints;
}
