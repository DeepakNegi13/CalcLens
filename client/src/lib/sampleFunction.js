/**
 * Sampling functions for 2D curves, 3D surfaces, and differential equation slope fields.
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
      // Clamp extreme values so graphs don't distort completely
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

      // Direction vector (1, slope) normalized to segmentLength
      const angle = Math.atan(slope);
      const dx = (segmentLength / 2) * Math.cos(angle);
      const dy = (segmentLength / 2) * Math.sin(angle);

      // Plotly segment with null separator
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

  // Forward integration
  const forwardX = [x0];
  const forwardY = [y0];
  let curX = x0;
  let curY = y0;

  while (curX < xMax) {
    const nextY = rk4Step(curX, curY, step);
    curX += step;
    if (isNaN(nextY) || Math.abs(nextY) > 100) break;
    curY = nextY;
    forwardX.push(curX);
    forwardY.push(curY);
  }

  // Backward integration
  const backwardX = [];
  const backwardY = [];
  curX = x0;
  curY = y0;

  while (curX > xMin) {
    const nextY = rk4Step(curX, curY, -step);
    curX -= step;
    if (isNaN(nextY) || Math.abs(nextY) > 100) break;
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

