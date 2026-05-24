export interface LinearResult {
  solution: number[];
  steps?: string[];
  iterations?: { n: number; x: number[] }[];
  method: string;
}

function cloneMatrix(m: number[][]): number[][] {
  return m.map(r => [...r]);
}

export function gaussElimination(A: number[][], b: number[]): LinearResult {
  const n = A.length;
  
  // Validações
  if (A.some(row => row.length !== n)) throw new Error('A matriz A deve ser quadrada.');
  if (b.length !== n) throw new Error('A dimensão do vetor b deve ser igual à dimensão da matriz A.');
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isNaN(A[i][j]) || !Number.isFinite(A[i][j])) throw new Error('A matriz A contém valores inválidos.');
    }
    if (isNaN(b[i]) || !Number.isFinite(b[i])) throw new Error('O vetor b contém valores inválidos.');
  }

  const aug = A.map((row, i) => [...row, b[i]]);
  const steps: string[] = [];

  for (let k = 0; k < n; k++) {
    // Pivoteamento parcial
    let maxVal = Math.abs(aug[k][k]);
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > maxVal) {
        maxVal = Math.abs(aug[i][k]);
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      [aug[k], aug[maxRow]] = [aug[maxRow], aug[k]];
      steps.push(`Troca linha ${k + 1} ↔ linha ${maxRow + 1}`);
    }

    if (Math.abs(aug[k][k]) < 1e-12) throw new Error('Sistema singular ou mal condicionado.');

    for (let i = k + 1; i < n; i++) {
      const factor = aug[i][k] / aug[k][k];
      steps.push(`L${i + 1} = L${i + 1} - (${factor.toFixed(4)}) * L${k + 1}`);
      for (let j = k; j <= n; j++) {
        aug[i][j] -= factor * aug[k][j];
      }
      aug[i][k] = 0; // Limpeza do coeficiente eliminado para evitar resíduos numéricos
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += aug[i][j] * x[j];
    x[i] = (aug[i][n] - sum) / aug[i][i];
  }

  return { solution: x, steps, method: 'Eliminação de Gauss' };
}

export function luDecomposition(A: number[][], b: number[]): LinearResult {
  const n = A.length;

  // Validações
  if (A.some(row => row.length !== n)) throw new Error('A matriz A deve ser quadrada.');
  if (b.length !== n) throw new Error('A dimensão do vetor b deve ser igual à dimensão da matriz A.');
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isNaN(A[i][j]) || !Number.isFinite(A[i][j])) throw new Error('A matriz A contém valores inválidos.');
    }
    if (isNaN(b[i]) || !Number.isFinite(b[i])) throw new Error('O vetor b contém valores inválidos.');
  }

  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const U: number[][] = cloneMatrix(A);
  const steps: string[] = [];

  for (let i = 0; i < n; i++) L[i][i] = 1;

  for (let k = 0; k < n; k++) {
    if (Math.abs(U[k][k]) < 1e-12) throw new Error('Pivô zero encontrado na fatoração LU.');
    for (let i = k + 1; i < n; i++) {
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor;
      for (let j = k; j < n; j++) {
        U[i][j] -= factor * U[k][j];
      }
      U[i][k] = 0; // Limpeza do coeficiente eliminado para evitar resíduos numéricos
    }
  }

  steps.push('Matriz L: ' + L.map(r => '[' + r.map(v => v.toFixed(4)).join(', ') + ']').join(' | '));
  steps.push('Matriz U: ' + U.map(r => '[' + r.map(v => v.toFixed(4)).join(', ') + ']').join(' | '));

  // Ly = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
    y[i] = b[i] - sum;
  }

  // Ux = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
    x[i] = (y[i] - sum) / U[i][i];
  }

  return { solution: x, steps, method: 'Fatoração LU' };
}

export function jacobi(A: number[][], b: number[], tol: number, maxIter: number): LinearResult {
  const n = A.length;

  // Validações
  if (A.some(row => row.length !== n)) throw new Error('A matriz A deve ser quadrada.');
  if (b.length !== n) throw new Error('A dimensão do vetor b deve ser igual à dimensão da matriz A.');
  if (isNaN(tol) || tol <= 0) throw new Error('A tolerância deve ser um número positivo.');
  if (isNaN(maxIter) || maxIter <= 0) throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isNaN(A[i][j]) || !Number.isFinite(A[i][j])) throw new Error('A matriz A contém valores inválidos.');
    }
    if (isNaN(b[i]) || !Number.isFinite(b[i])) throw new Error('O vetor b contém valores inválidos.');
    if (Math.abs(A[i][i]) < 1e-12) throw new Error(`O elemento da diagonal principal na linha ${i + 1} é zero ou muito próximo de zero. O método de Jacobi não pode prosseguir.`);
  }

  let x = new Array(n).fill(0);
  const iterations: { n: number; x: number[] }[] = [];
  const steps: string[] = [];

  steps.push(`Vetor inicial: x = [${x.join(', ')}]`);

  let converged = false;
  let finalError = 0;

  for (let iter = 1; iter <= maxIter; iter++) {
    const xNew = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      xNew[i] = (b[i] - sum) / A[i][i];
    }

    iterations.push({ n: iter, x: xNew.map(v => +v.toFixed(8)) });

    if (xNew.some(v => !Number.isFinite(v))) throw new Error('O método divergiu. O valor excedeu o limite numérico.');

    const error = Math.max(...xNew.map((v, i) => Math.abs(v - x[i])));
    finalError = error;

    if (error < tol) {
      converged = true;
      steps.push(`Convergência alcançada na iteração ${iter} (Erro: ${error.toExponential(4)} < Tolerância: ${tol}).`);
      x = xNew;
      break;
    }
    x = xNew;
  }

  if (!converged) {
    steps.push(`AVISO: O método atingiu o limite de ${maxIter} iterações sem alcançar a tolerância de ${tol}. Erro final obtido: ${finalError.toExponential(4)}.`);
  }

  return { solution: x, iterations, steps, method: 'Jacobi' };
}

export function gaussSeidel(A: number[][], b: number[], tol: number, maxIter: number): LinearResult {
  const n = A.length;

  // Validações
  if (A.some(row => row.length !== n)) throw new Error('A matriz A deve ser quadrada.');
  if (b.length !== n) throw new Error('A dimensão do vetor b deve ser igual à dimensão da matriz A.');
  if (isNaN(tol) || tol <= 0) throw new Error('A tolerância deve ser um número positivo.');
  if (isNaN(maxIter) || maxIter <= 0) throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isNaN(A[i][j]) || !Number.isFinite(A[i][j])) throw new Error('A matriz A contém valores inválidos.');
    }
    if (isNaN(b[i]) || !Number.isFinite(b[i])) throw new Error('O vetor b contém valores inválidos.');
    if (Math.abs(A[i][i]) < 1e-12) throw new Error(`O elemento da diagonal principal na linha ${i + 1} é zero ou muito próximo de zero. O método de Gauss-Seidel não pode prosseguir.`);
  }

  const x = new Array(n).fill(0);
  const iterations: { n: number; x: number[] }[] = [];
  const steps: string[] = [];

  steps.push(`Vetor inicial: x = [${x.join(', ')}]`);

  let converged = false;
  let finalError = 0;

  for (let iter = 1; iter <= maxIter; iter++) {
    const xOld = [...x];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }

    iterations.push({ n: iter, x: x.map(v => +v.toFixed(8)) });

    if (x.some(v => !Number.isFinite(v))) throw new Error('O método divergiu. O valor excedeu o limite numérico.');

    const error = Math.max(...x.map((v, i) => Math.abs(v - xOld[i])));
    finalError = error;

    if (error < tol) {
      converged = true;
      steps.push(`Convergência alcançada na iteração ${iter} (Erro: ${error.toExponential(4)} < Tolerância: ${tol}).`);
      break;
    }
  }

  if (!converged) {
    steps.push(`AVISO: O método atingiu o limite de ${maxIter} iterações sem alcançar a tolerância de ${tol}. Erro final obtido: ${finalError.toExponential(4)}.`);
  }

  return { solution: [...x], iterations, steps, method: 'Gauss-Seidel' };
}
