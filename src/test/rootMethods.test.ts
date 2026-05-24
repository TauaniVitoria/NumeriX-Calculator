import { describe, it, expect } from "vitest";
import { bisection, fixedPoint, newtonRaphson, secant } from "../lib/rootMethods";

describe("Root Finding Methods", () => {
  // Common equations for testing
  const eqQuadratic = "x^2 - 4"; // roots at x = 2 and x = -2
  const eqCubic = "x^3 - x - 2";  // root near x = 1.52138
  const gFixedPoint = "(4/x + x)/2"; // fixed point equation for root of x^2-4

  describe("Bisection Method", () => {
    it("should find the correct root for a valid interval", () => {
      const res = bisection(eqQuadratic, 0, 3, 1e-6, 100);
      expect(res.root).toBeCloseTo(2.0, 5);
      expect(res.converged).toBe(true);
      expect(res.iterations.length).toBeGreaterThan(0);
      expect(res.method).toBe("Bisseção");
    });

    it("should swap limits if a > b", () => {
      const res = bisection(eqQuadratic, 3, 0, 1e-6, 100);
      expect(res.root).toBeCloseTo(2.0, 5);
      expect(res.converged).toBe(true);
    });

    it("should return early if a boundary is already a root", () => {
      const resA = bisection(eqQuadratic, 2, 5, 1e-6, 100);
      expect(resA.root).toBe(2);
      expect(resA.converged).toBe(true);
      expect(resA.iterations.length).toBe(1);

      const resB = bisection(eqQuadratic, -3, 2, 1e-6, 100);
      expect(resB.root).toBe(2);
      expect(resB.converged).toBe(true);
      expect(resB.iterations.length).toBe(1);
    });

    it("should throw error if f(a) and f(b) have the same sign", () => {
      expect(() => bisection(eqQuadratic, 3, 5, 1e-6, 100)).toThrow(
        "f(a) e f(b) devem ter sinais opostos."
      );
    });

    it("should throw error for invalid bounds or tolerance/iterations", () => {
      expect(() => bisection(eqQuadratic, NaN, 3, 1e-6, 100)).toThrow(
        "Os limites do intervalo a e b devem ser números válidos."
      );
      expect(() => bisection(eqQuadratic, 0, 3, -1e-6, 100)).toThrow(
        "A tolerância deve ser um número positivo."
      );
      expect(() => bisection(eqQuadratic, 0, 3, 1e-6, 0)).toThrow(
        "O número máximo de iterações deve ser um número inteiro positivo."
      );
    });

    it("should handle syntax errors in expressions cleanly", () => {
      expect(() => bisection("x +", 0, 3, 1e-6, 100)).toThrow();
    });
  });

  describe("Fixed Point Method", () => {
    it("should converge to the correct fixed point", () => {
      const res = fixedPoint(gFixedPoint, 1.5, 1e-6, 100);
      expect(res.root).toBeCloseTo(2.0, 5);
      expect(res.converged).toBe(true);
      expect(res.method).toBe("Ponto Fixo");
    });

    it("should throw error for invalid parameters", () => {
      expect(() => fixedPoint(gFixedPoint, NaN, 1e-6, 100)).toThrow(
        "A aproximação inicial x0 deve ser um número válido."
      );
      expect(() => fixedPoint(gFixedPoint, 1.5, 0, 100)).toThrow(
        "A tolerância deve ser um número positivo."
      );
      expect(() => fixedPoint(gFixedPoint, 1.5, 1e-6, -5)).toThrow(
        "O número máximo de iterações deve ser um número inteiro positivo."
      );
    });

    it("should detect divergence when values exceed limits", () => {
      // g(x) = x^2 will diverge for x0 = 3
      expect(() => fixedPoint("x^2", 3, 1e-5, 100)).toThrow(
        "O método divergiu."
      );
    });
  });

  describe("Newton-Raphson Method", () => {
    it("should find the root quickly using derivative", () => {
      const res = newtonRaphson(eqQuadratic, 1.5, 1e-6, 100);
      expect(res.root).toBeCloseTo(2.0, 5);
      expect(res.converged).toBe(true);
      expect(res.method).toBe("Newton-Raphson");
    });

    it("should throw error when derivative is close to zero", () => {
      // f(x) = x^2 - 4 has derivative f'(x) = 2x. At x = 0, derivative is 0.
      expect(() => newtonRaphson(eqQuadratic, 0, 1e-6, 100)).toThrow(
        "Derivada muito próxima de zero. O método divergiu."
      );
    });

    it("should validate input parameters", () => {
      expect(() => newtonRaphson(eqQuadratic, NaN, 1e-6, 100)).toThrow(
        "A aproximação inicial x0 deve ser um número válido."
      );
      expect(() => newtonRaphson(eqQuadratic, 1.5, -0.01, 100)).toThrow(
        "A tolerância deve ser um número positivo."
      );
    });
  });

  describe("Secant Method", () => {
    it("should find the correct root using two starting points", () => {
      const res = secant(eqQuadratic, 1, 3, 1e-6, 100);
      expect(res.root).toBeCloseTo(2.0, 5);
      expect(res.converged).toBe(true);
      expect(res.method).toBe("Secantes");
    });

    it("should throw error on division by zero (identical function evaluations)", () => {
      // For f(x) = x^2, f(-1) = f(1) = 1.
      expect(() => secant("x^2", -1, 1, 1e-6, 100)).toThrow(
        "Divisão por zero no método das secantes"
      );
    });

    it("should validate input parameters", () => {
      expect(() => secant(eqQuadratic, 1, NaN, 1e-6, 100)).toThrow(
        "As aproximações iniciais x0 e x1 devem ser números válidos."
      );
      expect(() => secant(eqQuadratic, 1, 3, 1e-6, 0)).toThrow(
        "O número máximo de iterações deve ser um número inteiro positivo."
      );
    });
  });
});
