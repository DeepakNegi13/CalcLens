/**
 * Mathematical calculations for tangent lines, secant lines, partial derivative lines, and tangent planes.
 */

/**
 * 2D Tangent Line: y = f(a) + f'(a)(x - a)
 */
export function compute2DTangentLine(a, fa, slope, xRange = [-10, 10]) {
  if (isNaN(fa) || isNaN(slope) || !isFinite(fa) || !isFinite(slope)) {
    return { x: [], y: [], equation: "" };
  }

  const [xMin, xMax] = xRange;
  const x = [xMin, xMax];
  const y = [fa + slope * (xMin - a), fa + slope * (xMax - a)];

  // y - y0 = m(x - x0) => y = m*x + (y0 - m*x0)
  const intercept = fa - slope * a;
  const sign = intercept >= 0 ? "+" : "-";
  const absIntercept = Math.abs(intercept).toFixed(2);
  const equation = `y = ${slope.toFixed(2)}x ${sign} ${absIntercept}`;

  return { x, y, equation, slope, intercept };
}

/**
 * 2D Secant Line connecting (a, f(a)) and (a + h, f(a + h))
 */
export function compute2DSecantLine(evaluateFn, a, h = 0.5, xRange = [-10, 10]) {
  const fa = evaluateFn({ x: a });
  const fah = evaluateFn({ x: a + h });

  if (isNaN(fa) || isNaN(fah) || !isFinite(fa) || !isFinite(fah)) {
    return { x: [], y: [], secantSlope: NaN, angle: NaN };
  }

  const secantSlope = (fah - fa) / h;
  const [xMin, xMax] = xRange;
  const x = [xMin, xMax];
  const y = [fa + secantSlope * (xMin - a), fa + secantSlope * (xMax - a)];
  const angle = (Math.atan(secantSlope) * 180) / Math.PI;

  return {
    x,
    y,
    secantSlope,
    angle,
    p1: { x: a, y: fa },
    p2: { x: a + h, y: fah },
  };
}

/**
 * 3D Partial Derivative lines and Tangent Plane
 */
export function compute3DTangents(a, b, fab, fx, fy, xRange = [-5, 5], yRange = [-5, 5]) {
  if (isNaN(fab) || isNaN(fx) || isNaN(fy) || !isFinite(fab) || !isFinite(fx) || !isFinite(fy)) {
    return {
      lineX: null,
      lineY: null,
      plane: null,
      normalVector: [0, 0, 1],
    };
  }

  const spanX = xRange[1] - xRange[0];
  const spanY = yRange[1] - yRange[0];
  const Lx = spanX * 0.35;
  const Ly = spanY * 0.35;

  // df/dx line (y held at b): (a + t, b, fab + fx * t)
  const lineX = {
    x: [a - Lx, a + Lx],
    y: [b, b],
    z: [fab - fx * Lx, fab + fx * Lx],
    vector: [1, 0, fx],
  };

  // df/dy line (x held at a): (a, b + t, fab + fy * t)
  const lineY = {
    x: [a, a],
    y: [b - Ly, b + Ly],
    z: [fab - fy * Ly, fab + fy * Ly],
    vector: [0, 1, fy],
  };

  // Tangent plane: z = fab + fx*(x - a) + fy*(y - b)
  // Evaluated over [a - Lx, a + Lx] x [b - Ly, b + Ly]
  const planeGridSize = 10;
  const planeX = [];
  const planeY = [];
  const planeZ = [];

  const pxStep = (2 * Lx) / (planeGridSize - 1);
  const pyStep = (2 * Ly) / (planeGridSize - 1);

  for (let i = 0; i < planeGridSize; i++) {
    planeX.push(a - Lx + i * pxStep);
  }
  for (let j = 0; j < planeGridSize; j++) {
    planeY.push(b - Ly + j * pyStep);
  }

  for (let j = 0; j < planeGridSize; j++) {
    const yVal = planeY[j];
    const row = [];
    for (let i = 0; i < planeGridSize; i++) {
      const xVal = planeX[i];
      const zVal = fab + fx * (xVal - a) + fy * (yVal - b);
      row.push(zVal);
    }
    planeZ.push(row);
  }

  // Normal vector: (-fx, -fy, 1) or (-fx, -fy, 1) normalized
  const normalVector = [-fx, -fy, 1];

  return {
    lineX,
    lineY,
    plane: {
      x: planeX,
      y: planeY,
      z: planeZ,
    },
    normalVector,
  };
}

