import { describe, it, expect } from "vitest";
import { linearRegression, leastSquares } from "../lib/curveFitting";

describe("Linear Regression (Curve Fitting)", () => {
  const points1 = [
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 5 }
  ];

  it("should calculate correct coefficients and equation", () => {
    const res = linearRegression(points1);
    expect(res.coefficients.a).toBeCloseTo(1.5, 5);
    expect(res.coefficients.b).toBeCloseTo(2/3, 5);
    expect(res.rSquared).toBeCloseTo(0.964286, 5);
    expect(res.equation).toContain("y = 1.500000x + 0.666667");
  });

  it("should handle negative intercept representation", () => {
    const points = [
      { x: 0, y: -3 },
      { x: 1, y: -5 },
      { x: 2, y: -7 }
    ];
    const res = linearRegression(points);
    expect(res.coefficients.a).toBeCloseTo(-2, 5);
    expect(res.coefficients.b).toBeCloseTo(-3, 5);
    expect(res.rSquared).toBeCloseTo(1.0, 5);
    expect(res.equation).toContain("y = -2.000000x - 3.000000");
  });

  it("should throw error when less than 2 points are provided", () => {
    expect(() => linearRegression([])).toThrow("São necessários pelo menos 2 pontos.");
    expect(() => linearRegression([{ x: 1, y: 2 }])).toThrow("São necessários pelo menos 2 pontos.");
  });

  it("should throw error for vertical lines (same x coordinate)", () => {
    const verticalPoints = [
      { x: 1, y: 2 },
      { x: 1, y: 5 }
    ];
    expect(() => linearRegression(verticalPoints)).toThrow("Todos os pontos possuem a mesma coordenada x. A reta de regressão seria vertical, o que inviabiliza o cálculo.");
  });
});

describe("Method of Least Squares", () => {
  // Test case from user request:
  // X = [1, 2, 3, 4, 5]
  // Y = [2, 4, 5, 4, 5]
  // Expected: a ≈ 0.6, b ≈ 2.2
  const X1 = [1, 2, 3, 4, 5];
  const Y1 = [2, 4, 5, 4, 5];

  it("should solve the user's sample case correctly", () => {
    const res = leastSquares(X1, Y1);
    expect(res.coefficients.a).toBeCloseTo(0.6, 5);
    expect(res.coefficients.b).toBeCloseTo(2.2, 5);
    expect(res.equation).toContain("y = 0.600000x + 2.200000");
    expect(res.error).toBeDefined();
    expect(res.error).toBeCloseTo(2.4, 5); // ssRes = sum (y_i - (0.6 * x_i + 2.2))^2
  });

  it("should throw error when X and Y have different lengths", () => {
    expect(() => leastSquares([1, 2], [1])).toThrow("Os vetores X e Y devem ter o mesmo tamanho (atualmente X tem 2 elementos e Y tem 1 elementos).");
  });

  it("should throw error when less than 2 elements are provided", () => {
    expect(() => leastSquares([1], [2])).toThrow("São necessários pelo menos 2 pontos para realizar o cálculo.");
  });

  it("should throw error for vertical lines (all X elements are equal)", () => {
    expect(() => leastSquares([2, 2, 2], [1, 2, 3])).toThrow("Divisão por zero: todos os pontos do vetor X possuem o mesmo valor (reta vertical).");
  });

  it("should throw error if X or Y contains invalid coordinates", () => {
    expect(() => leastSquares([1, NaN], [2, 3])).toThrow("Os vetores X e Y contêm valores inválidos.");
  });
});
