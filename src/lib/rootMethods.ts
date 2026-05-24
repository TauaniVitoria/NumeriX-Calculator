import { evaluateFunction, evaluateDerivative } from './mathParser';

export interface Iteration {
  n: number;
  [key: string]: number | string;
}

export interface RootResult {
  root: number;
  iterations: Iteration[];
  converged: boolean;
  method: string;
}

export function bisection(expr: string, a: number, b: number, tol: number, maxIter: number): RootResult {
  if (isNaN(a) || !Number.isFinite(a) || isNaN(b) || !Number.isFinite(b)) {
    throw new Error('Os limites do intervalo a e b devem ser números válidos.');
  }
  if (isNaN(tol) || tol <= 0) {
    throw new Error('A tolerância deve ser um número positivo.');
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
  }

  if (a > b) {
    [a, b] = [b, a];
  }

  const fa = evaluateFunction(expr, a);
  const fb = evaluateFunction(expr, b);

  if (isNaN(fa) || !Number.isFinite(fa) || isNaN(fb) || !Number.isFinite(fb)) {
    throw new Error('A função não pôde ser avaliada com valores reais válidos nos limites a ou b.');
  }

  if (Math.abs(fa) < 1e-15) {
    return { root: a, iterations: [{ n: 1, a, b, mid: a, 'f(mid)': 0, erro: 0 }], converged: true, method: 'Bisseção' };
  }
  if (Math.abs(fb) < 1e-15) {
    return { root: b, iterations: [{ n: 1, a, b, mid: b, 'f(mid)': 0, erro: 0 }], converged: true, method: 'Bisseção' };
  }

  if (fa * fb > 0) {
    throw new Error('f(a) e f(b) devem ter sinais opostos.');
  }

  const iterations: Iteration[] = [];
  let currentA = a;
  let currentB = b;
  let currentFa = fa;
  let mid = currentA;

  for (let i = 1; i <= maxIter; i++) {
    mid = (currentA + currentB) / 2;
    const fmid = evaluateFunction(expr, mid);
    
    if (isNaN(fmid) || !Number.isFinite(fmid)) {
      throw new Error('O método divergiu. A função avaliou para um valor inválido.');
    }

    const error = (currentB - currentA) / 2;
    iterations.push({
      n: i,
      a: +currentA.toFixed(10),
      b: +currentB.toFixed(10),
      mid: +mid.toFixed(10),
      'f(mid)': +fmid.toFixed(10),
      erro: +error.toFixed(10)
    });

    if (Math.abs(fmid) < tol || error < tol) {
      return { root: mid, iterations, converged: true, method: 'Bisseção' };
    }

    if (Math.sign(currentFa) !== Math.sign(fmid)) {
      currentB = mid;
    } else {
      currentA = mid;
      currentFa = fmid;
    }
  }
  return { root: mid, iterations, converged: false, method: 'Bisseção' };
}

export function fixedPoint(gExpr: string, x0: number, tol: number, maxIter: number): RootResult {
  if (isNaN(x0) || !Number.isFinite(x0)) {
    throw new Error('A aproximação inicial x0 deve ser um número válido.');
  }
  if (isNaN(tol) || tol <= 0) {
    throw new Error('A tolerância deve ser um número positivo.');
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
  }

  const iterations: Iteration[] = [];
  let x = x0;

  for (let i = 1; i <= maxIter; i++) {
    const xNew = evaluateFunction(gExpr, x);
    if (isNaN(xNew) || !Number.isFinite(xNew)) {
      throw new Error('O método divergiu. O valor excedeu o limite numérico ou resultou em NaN.');
    }
    const error = Math.abs(xNew - x);
    iterations.push({ n: i, x: +x.toFixed(10), 'g(x)': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Ponto Fixo' };
    }
    x = xNew;
  }
  return { root: x, iterations, converged: false, method: 'Ponto Fixo' };
}

export function newtonRaphson(expr: string, x0: number, tol: number, maxIter: number): RootResult {
  if (isNaN(x0) || !Number.isFinite(x0)) {
    throw new Error('A aproximação inicial x0 deve ser um número válido.');
  }
  if (isNaN(tol) || tol <= 0) {
    throw new Error('A tolerância deve ser um número positivo.');
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
  }

  const iterations: Iteration[] = [];
  let x = x0;

  for (let i = 1; i <= maxIter; i++) {
    const fx = evaluateFunction(expr, x);
    const fpx = evaluateDerivative(expr, x);

    if (isNaN(fx) || !Number.isFinite(fx) || isNaN(fpx) || !Number.isFinite(fpx)) {
      throw new Error('Erro na avaliação da função ou de sua derivada. O método não pôde prosseguir.');
    }

    if (Math.abs(fpx) < 1e-14) {
      throw new Error('Derivada muito próxima de zero. O método divergiu.');
    }

    const xNew = x - fx / fpx;
    if (isNaN(xNew) || !Number.isFinite(xNew)) {
      throw new Error('O método divergiu. O valor excedeu o limite numérico.');
    }
    const error = Math.abs(xNew - x);
    iterations.push({ n: i, x: +x.toFixed(10), 'f(x)': +fx.toFixed(10), "f'(x)": +fpx.toFixed(10), 'x_novo': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Newton-Raphson' };
    }
    x = xNew;
  }
  return { root: x, iterations, converged: false, method: 'Newton-Raphson' };
}

export function secant(expr: string, x0: number, x1: number, tol: number, maxIter: number): RootResult {
  if (isNaN(x0) || !Number.isFinite(x0) || isNaN(x1) || !Number.isFinite(x1)) {
    throw new Error('As aproximações iniciais x0 e x1 devem ser números válidos.');
  }
  if (isNaN(tol) || tol <= 0) {
    throw new Error('A tolerância deve ser um número positivo.');
  }
  if (isNaN(maxIter) || maxIter <= 0) {
    throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
  }

  let fPrev = evaluateFunction(expr, x0);
  if (isNaN(fPrev) || !Number.isFinite(fPrev)) {
    throw new Error('A função não pôde ser avaliada no ponto inicial x0.');
  }

  const iterations: Iteration[] = [];
  let xPrev = x0;
  let xCurr = x1;

  for (let i = 1; i <= maxIter; i++) {
    const fCurr = evaluateFunction(expr, xCurr);
    if (isNaN(fCurr) || !Number.isFinite(fCurr)) {
      throw new Error('A função não pôde ser avaliada no ponto iterativo.');
    }

    if (Math.abs(fCurr - fPrev) < 1e-14) {
      throw new Error('Divisão por zero no método das secantes (f(x_n) ≈ f(x_{n-1})).');
    }

    const xNew = xCurr - fCurr * (xCurr - xPrev) / (fCurr - fPrev);
    if (isNaN(xNew) || !Number.isFinite(xNew)) {
      throw new Error('O método divergiu. O valor excedeu o limite numérico.');
    }
    const error = Math.abs(xNew - xCurr);
    iterations.push({ n: i, 'x_(n-1)': +xPrev.toFixed(10), 'x_n': +xCurr.toFixed(10), 'f(x_n)': +fCurr.toFixed(10), 'x_(n+1)': +xNew.toFixed(10), erro: +error.toFixed(10) });

    if (error < tol) {
      return { root: xNew, iterations, converged: true, method: 'Secantes' };
    }
    xPrev = xCurr;
    fPrev = fCurr;
    xCurr = xNew;
  }
  return { root: xCurr, iterations, converged: false, method: 'Secantes' };
}
