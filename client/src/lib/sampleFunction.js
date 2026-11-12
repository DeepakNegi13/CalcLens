/**
 * Sampling functions for 2D curves, 3D surfaces, differential equation slope fields,
 * and parameterized family of ODE integral curves y(x; C).
 */

export function sample2D(evaluateFn, xMin = -10, xMax = 10, count = 400) {
  const xVals = [];
  const yVals = [];
  const step = (xMax - xMin) / (count - 1);

  for (let i = 0; i < count; i++) {
    const x = xMin + i * step;
    xVals.push(x);

    const y = evaluateFn({ x });
    if (isNaN(y) || !isFinite(y)) {
      yVals.push(null);
    } else {
      if (Math.abs(y) > 1e6) {
        yVals.push(null);
      } else {
        yVals.push(y);
      }
    }
  }

  return { x: xVals, y: yVals };
}

export function sample3D(evaluateFn, xRange = [-5, 5], yRange = [-5, 5], gridSize = 50) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const xVals = [];
  const yVals = [];
  const zMatrix = [];

  const xStep = (xMax - xMin) / (gridSize - 1);
  const yStep = (yMax - yMin) / (gridSize - 1);

  for (let i = 0; i < gridSize; i++) {
    xVals.push(xMin + i * xStep);
  }
  for (let j = 0; j < gridSize; j++) {
    yVals.push(yMin + j * yStep);
  }

  for (let j = 0; j < gridSize; j++) {
    const y = yVals[j];
    const row = [];
    for (let i = 0; i < gridSize; i++) {
      const x = xVals[i];
      const z = evaluateFn({ x, y });
      if (isNaN(z) || !isFinite(z) || Math.abs(z) > 1e5) {
        row.push(null);
      } else {
        row.push(z);
      }
    }
    zMatrix.push(row);
  }

  return { x: xVals, y: yVals, z: zMatrix };
}

/**
 * Samples a grid of slope vectors (direction field / multiple slopes) for dy/dx = f(x, y).
 */
export function sampleSlopeField(evaluateFn, xRange = [-5, 5], yRange = [-5, 5], nx = 18, ny = 18) {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const xStep = (xMax - xMin) / (nx - 1);
  const yStep = (yMax - yMin) / (ny - 1);
  const segmentLength = Math.min(xStep, yStep) * 0.75;

  const linesX = [];
  const linesY = [];
  const gridPoints = [];

  for (let i = 0; i < nx; i++) {
    const x = xMin + i * xStep;
    for (let j = 0; j < ny; j++) {
      const y = yMin + j * yStep;
      const slope = evaluateFn({ x, y });

      if (isNaN(slope) || !isFinite(slope)) continue;

      const angle = Math.atan(slope);
      const dx = (segmentLength / 2) * Math.cos(angle);
      const dy = (segmentLength / 2) * Math.sin(angle);

      linesX.push(x - dx, x + dx, null);
      linesY.push(y - dy, y + dy, null);

      gridPoints.push({ x, y, slope });
    }
  }

  return {
    linesX,
    linesY,
    gridPoints,
  };
}

/**
 * Solves 1st order ODE dy/dx = f(x, y) using 4th-order Runge-Kutta (RK4).
 * Traces solution curve passing through (x0, y0).
 */
export function solveODE_RK4(evaluateFn, x0, y0, xRange = [-5, 5], step = 0.02) {
  const [xMin, xMax] = xRange;

  const rk4Step = (x, y, h) => {
    const k1 = evaluateFn({ x, y });
    if (isNaN(k1) || !isFinite(k1)) return NaN;
    const k2 = evaluateFn({ x: x + h / 2, y: y + (h * k1) / 2 });
    if (isNaN(k2) || !isFinite(k2)) return NaN;
    const k3 = evaluateFn({ x: x + h / 2, y: y + (h * k2) / 2 });
    if (isNaN(k3) || !isFinite(k3)) return NaN;
    const k4 = evaluateFn({ x: x + h, y: y + h * k3 });
    if (isNaN(k4) || !isFinite(k4)) return NaN;

    return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  };

  // Forward integration from x0 to xMax
  const forwardX = [x0];
  const forwardY = [y0];
  let curX = x0;
  let curY = y0;

  while (curX < xMax) {
    const nextY = rk4Step(curX, curY, step);
    curX += step;
    if (isNaN(nextY) || Math.abs(nextY) > 500) break;
    curY = nextY;
    forwardX.push(curX);
    forwardY.push(curY);
  }

  // Backward integration from x0 to xMin
  const backwardX = [];
  const backwardY = [];
  curX = x0;
  curY = y0;

  while (curX > xMin) {
    const nextY = rk4Step(curX, curY, -step);
    curX -= step;
    if (isNaN(nextY) || Math.abs(nextY) > 500) break;
    curY = nextY;
    backwardX.unshift(curX);
    backwardY.unshift(curY);
  }

  return {
    x: [...backwardX, ...forwardX],
    y: [...backwardY, ...forwardY],
  };
}

/**
 * Solves a family of integral curves y(x; C) parameterized by integration constant C (where y(0) = C).
 * Also computes the exact point (x0, y(x0)) on the active curve and its tangent slope.
 */
export function solveFamilyOfODE(evaluateFn, C_active = 1.0, x0 = 1.0, xRange = [-5, 5], showFamily = true) {
  if (!evaluateFn) {
    return {
      activeCurve: { x: [], y: [] },
      familyCurves: [],
      point: { x: x0, y: C_active },
      slope: 0,
    };
  }

  // 1. Solve active curve for C_active passing through (0, C_active)
  const activeSolution = solveODE_RK4(evaluateFn, 0, C_active, xRange, 0.02);

  // 2. Interpolate y-value at x0 on the active curve
  let yAtX0 = C_active;
  if (activeSolution.x.length > 1) {
    // Find closest segment to x0
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < activeSolution.x.length; i++) {
      const diff = Math.abs(activeSolution.x[i] - x0);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }

    if (minDiff < 0.05) {
      yAtX0 = activeSolution.y[bestIdx];
    } else {
      // Direct RK4 integration from 0 to x0 for exact precision
      const direct = solveODE_RK4(evaluateFn, 0, C_active, [Math.min(0, x0), Math.max(0, x0)], 0.02);
      if (direct.y.length > 0) {
        yAtX0 = x0 >= 0 ? direct.y[direct.y.length - 1] : direct.y[0];
      }
    }
  }

  // 3. Slope at (x0, yAtX0)
  const slopeAtX0 = evaluateFn({ x: x0, y: yAtX0 });

  // 4. Generate family curves for C offsets (e.g. C - 2, C - 1, C + 1, C + 2)
  const familyCurves = [];
  if (showFamily) {
    const offsets = [-2.5, -1.25, 1.25, 2.5];
    for (const offset of offsets) {
      const cVal = parseFloat((C_active + offset).toFixed(2));
      const sol = solveODE_RK4(evaluateFn, 0, cVal, xRange, 0.03);
      familyCurves.push({
        C: cVal,
        x: sol.x,
        y: sol.y,
      });
    }
  }

  return {
    activeCurve: activeSolution,
    familyCurves,
    point: { x: x0, y: yAtX0 },
    slope: slopeAtX0,
  };
}

/**
 * Generates multiple tangent segments along a 2D function curve (multi-slope view).
 */
export function sampleMultipleSlopes(evaluateFn, derivFn, xRange = [-5, 5], count = 7, segmentLen = 1.0) {
  const [xMin, xMax] = xRange;
  const step = (xMax - xMin) / (count + 1);

  const linesX = [];
  const linesY = [];
  const points = [];

  for (let i = 1; i <= count; i++) {
    const x = xMin + i * step;
    const y = evaluateFn({ x });
    const slope = derivFn({ x });

    if (isNaN(y) || isNaN(slope) || !isFinite(y) || !isFinite(slope)) continue;

    const angle = Math.atan(slope);
    const dx = (segmentLen / 2) * Math.cos(angle);
    const dy = (segmentLen / 2) * Math.sin(angle);

    linesX.push(x - dx, x + dx, null);
    linesY.push(y - dy, y + dy, null);
    points.push({ x, y, slope });
  }

  return { linesX, linesY, points };
}
