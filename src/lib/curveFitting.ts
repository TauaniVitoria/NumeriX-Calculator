export interface CurveResult {
  equation: string;
  coefficients: { a: number; b: number };
  rSquared: number;
  error?: number;
  method: string;
}

export function linearRegression(points: { x: number; y: number }[]): CurveResult {
  const n = points.length;
  if (n < 2) throw new Error('São necessários pelo menos 2 pontos.');

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const p of points) {
    if (isNaN(p.x) || !Number.isFinite(p.x) || isNaN(p.y) || !Number.isFinite(p.y)) {
      throw new Error('Todos os pontos devem possuir coordenadas numéricas válidas.');
    }
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    throw new Error('Todos os pontos possuem a mesma coordenada x. A reta de regressão seria vertical, o que inviabiliza o cálculo.');
  }

  let a = (n * sumXY - sumX * sumY) / denom;
  let b = (sumY - a * sumX) / n;

  // Zeramento numérico para coeficientes microscópicos
  if (Math.abs(a) < 1e-12) a = 0;
  if (Math.abs(b) < 1e-12) b = 0;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    ssTot += (p.y - yMean) ** 2;
    ssRes += (p.y - (a * p.x + b)) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  const sign = b >= 0 ? '+' : '-';
  const equation = `y = ${a.toFixed(6)}x ${sign} ${Math.abs(b).toFixed(6)}`;

  return { equation, coefficients: { a, b }, rSquared, method: 'Regressão Linear (Mínimos Quadrados)' };
}

export function leastSquares(x: number[], y: number[]): CurveResult {
  const n = x.length;
  if (n !== y.length) {
    throw new Error(`Os vetores X e Y devem ter o mesmo tamanho (atualmente X tem ${n} elementos e Y tem ${y.length} elementos).`);
  }
  if (n < 2) {
    throw new Error('São necessários pelo menos 2 pontos para realizar o cálculo.');
  }

  for (let i = 0; i < n; i++) {
    if (isNaN(x[i]) || !Number.isFinite(x[i]) || isNaN(y[i]) || !Number.isFinite(y[i])) {
      throw new Error('Os vetores X e Y contêm valores inválidos.');
    }
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    throw new Error('Divisão por zero: todos os pontos do vetor X possuem o mesmo valor (reta vertical).');
  }

  let a = (n * sumXY - sumX * sumY) / denom;
  let b = (sumY - a * sumX) / n;

  // Zeramento numérico para coeficientes microscópicos
  if (Math.abs(a) < 1e-12) a = 0;
  if (Math.abs(b) < 1e-12) b = 0;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (y[i] - yMean) ** 2;
    ssRes += (y[i] - (a * x[i] + b)) ** 2;
  }
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  const sign = b >= 0 ? '+' : '-';
  const equation = `y = ${a.toFixed(6)}x ${sign} ${Math.abs(b).toFixed(6)}`;

  return { equation, coefficients: { a, b }, rSquared, error: ssRes, method: 'Método dos Mínimos Quadrados' };
}
