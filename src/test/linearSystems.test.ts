import { describe, it, expect } from "vitest";
import { gaussElimination, luDecomposition, jacobi, gaussSeidel } from "../lib/linearSystems";

describe("Linear System Solvers", () => {
  // Test case 1: Standard diagonally dominant system
  // 10x + 2y + z = 7
  // x + 5y + z = -8
  // 2x + 3y + 10z = 6
  // Solution: x = 1, y = -2, z = 1
  const A1 = [
    [10, 2, 1],
    [1, 5, 1],
    [2, 3, 10]
  ];
  const b1 = [7, -8, 6];
  const sol1 = [1, -2, 1];

  // Test case 2: System requiring pivoting for stability or zero pivot avoidance
  // 0x + y = 1
  // x + y = 2
  // Solution: x = 1, y = 1
  const A2 = [
    [0, 1],
    [1, 1]
  ];
  const b2 = [1, 2];
  const sol2 = [1, 1];

  // Test case 3: Singular system
  const A3 = [
    [1, 2],
    [2, 4]
  ];
  const b3 = [3, 6];

  it("Gaussian Elimination", () => {
    // Standard system
    const res1 = gaussElimination(A1, b1);
    expect(res1.solution[0]).toBeCloseTo(sol1[0], 5);
    expect(res1.solution[1]).toBeCloseTo(sol1[1], 5);
    expect(res1.solution[2]).toBeCloseTo(sol1[2], 5);

    // Pivoting system
    const res2 = gaussElimination(A2, b2);
    expect(res2.solution[0]).toBeCloseTo(sol2[0], 5);
    expect(res2.solution[1]).toBeCloseTo(sol2[1], 5);

    // Singular system should throw
    expect(() => gaussElimination(A3, b3)).toThrow('Sistema singular ou mal condicionado.');

    // Input dimension mismatch should throw
    expect(() => gaussElimination([[1, 2]], [1])).toThrow('A matriz A deve ser quadrada.');
    expect(() => gaussElimination([[1, 2], [3, 4]], [1])).toThrow('A dimensão do vetor b deve ser igual à dimensão da matriz A.');

    // NaN input validation should throw
    expect(() => gaussElimination([[NaN, 2], [3, 4]], [1, 2])).toThrow('A matriz A contém valores inválidos.');
  });

  it("LU Decomposition", () => {
    // Standard system
    const res1 = luDecomposition(A1, b1);
    expect(res1.solution[0]).toBeCloseTo(sol1[0], 5);
    expect(res1.solution[1]).toBeCloseTo(sol1[1], 5);
    expect(res1.solution[2]).toBeCloseTo(sol1[2], 5);

    // LU without pivoting fails for A2 (zero pivot)
    expect(() => luDecomposition(A2, b2)).toThrow('Pivô zero encontrado na fatoração LU.');

    // Singular system should throw
    expect(() => luDecomposition(A3, b3)).toThrow();

    // Input validations
    expect(() => luDecomposition([[1, 2]], [1])).toThrow('A matriz A deve ser quadrada.');
    expect(() => luDecomposition([[1, 2], [3, 4]], [1])).toThrow('A dimensão do vetor b deve ser igual à dimensão da matriz A.');
    expect(() => luDecomposition([[1, 2], [3, 4]], [1, NaN])).toThrow('O vetor b contém valores inválidos.');
  });

  it("Jacobi Method", () => {
    // Standard system (should converge since it is strictly diagonally dominant)
    const res1 = jacobi(A1, b1, 1e-5, 100);
    expect(res1.solution[0]).toBeCloseTo(sol1[0], 4);
    expect(res1.solution[1]).toBeCloseTo(sol1[1], 4);
    expect(res1.solution[2]).toBeCloseTo(sol1[2], 4);
    expect(res1.steps).toBeDefined();
    expect(res1.steps?.[1]).toContain('Convergência alcançada');

    // Jacobi with zero diagonal should throw clean error
    const A_zero_diag = [
      [0, 1],
      [1, 2]
    ];
    const b_zero_diag = [1, 3];
    expect(() => jacobi(A_zero_diag, b_zero_diag, 1e-5, 100)).toThrow('O elemento da diagonal principal na linha 1 é zero ou muito próximo de zero. O método de Jacobi não pode prosseguir.');

    // Jacobi non-converging should return warning in steps
    const A_div = [
      [1, 2],
      [2, 1]
    ];
    const b_div = [3, 3];
    const res_div = jacobi(A_div, b_div, 1e-5, 5);
    expect(res_div.steps?.[res_div.steps.length - 1]).toContain('AVISO: O método atingiu o limite de 5 iterações sem alcançar a tolerância');

    // Invalid parameters validations
    expect(() => jacobi(A1, b1, -1, 100)).toThrow('A tolerância deve ser um número positivo.');
    expect(() => jacobi(A1, b1, 1e-5, 0)).toThrow('O número máximo de iterações deve ser um número inteiro positivo.');
  });

  it("Gauss-Seidel Method", () => {
    // Standard system (should converge since it is strictly diagonally dominant)
    const res1 = gaussSeidel(A1, b1, 1e-5, 100);
    expect(res1.solution[0]).toBeCloseTo(sol1[0], 4);
    expect(res1.solution[1]).toBeCloseTo(sol1[1], 4);
    expect(res1.solution[2]).toBeCloseTo(sol1[2], 4);
    expect(res1.steps).toBeDefined();
    expect(res1.steps?.[1]).toContain('Convergência alcançada');

    // Gauss-Seidel with zero diagonal should throw clean error
    const A_zero_diag = [
      [0, 1],
      [1, 2]
    ];
    const b_zero_diag = [1, 3];
    expect(() => gaussSeidel(A_zero_diag, b_zero_diag, 1e-5, 100)).toThrow('O elemento da diagonal principal na linha 1 é zero ou muito próximo de zero. O método de Gauss-Seidel não pode prosseguir.');

    // Gauss-Seidel non-converging should return warning in steps
    const A_div = [
      [1, 2],
      [2, 1]
    ];
    const b_div = [3, 3];
    const res_div = gaussSeidel(A_div, b_div, 1e-5, 5);
    expect(res_div.steps?.[res_div.steps.length - 1]).toContain('AVISO: O método atingiu o limite de 5 iterações sem alcançar a tolerância');

    // Invalid parameters validations
    expect(() => gaussSeidel(A1, b1, -1, 100)).toThrow('A tolerância deve ser um número positivo.');
    expect(() => gaussSeidel(A1, b1, 1e-5, 0)).toThrow('O número máximo de iterações deve ser um número inteiro positivo.');
  });
});
