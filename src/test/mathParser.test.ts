import { describe, it, expect } from 'vitest';
import { evaluateFunction, evaluateDerivative, getDerivativeString } from '../lib/mathParser';

describe('mathParser tests', () => {
  describe('evaluateFunction', () => {
    it('should evaluate standard mathematical expressions', () => {
      expect(evaluateFunction('x^2 - 4', 2)).toBe(0);
      expect(evaluateFunction('x^2 - 4', 3)).toBe(5);
      expect(evaluateFunction('sin(x)', Math.PI / 2)).toBeCloseTo(1, 5);
    });

    it('should support case insensitivity and uppercase variables/functions', () => {
      expect(evaluateFunction('X^2 - 4', 2)).toBe(0);
      expect(evaluateFunction('SIN(X)', Math.PI / 2)).toBeCloseTo(1, 5);
    });

    it('should support Portuguese function names', () => {
      expect(evaluateFunction('sen(x)', Math.PI / 2)).toBeCloseTo(1, 5);
      expect(evaluateFunction('tg(x)', Math.PI / 4)).toBeCloseTo(1, 5);
      expect(evaluateFunction('SEN(X)', Math.PI / 2)).toBeCloseTo(1, 5);
    });

    it('should throw error for empty or invalid expressions', () => {
      expect(() => evaluateFunction('', 2)).toThrow('A expressão não pode estar vazia.');
      expect(() => evaluateFunction('   ', 2)).toThrow('A expressão não pode estar vazia.');
      expect(() => evaluateFunction('x + y', 2)).toThrow();
    });

    it('should throw error when expression does not result in real number', () => {
      expect(() => evaluateFunction('x > 2', 3)).toThrow('A expressão não resultou em um valor numérico real.');
    });
  });

  describe('evaluateDerivative', () => {
    it('should evaluate the derivative of a function', () => {
      expect(evaluateDerivative('x^2', 3)).toBe(6);
      expect(evaluateDerivative('x^3', 2)).toBe(12);
      expect(evaluateDerivative('cos(x)', 0)).toBe(0); // derivative of cos(x) is -sin(x). At 0, it is 0.
    });

    it('should support case insensitivity and Portuguese function names for derivatives', () => {
      expect(evaluateDerivative('X^2', 3)).toBe(6);
      expect(evaluateDerivative('SEN(X)', 0)).toBe(1); // derivative of sin(x) is cos(x). At 0, it is 1.
    });

    it('should throw error for invalid derivatives', () => {
      expect(() => evaluateDerivative('', 2)).toThrow('A expressão não pode estar vazia.');
    });
  });

  describe('getDerivativeString', () => {
    it('should return string representation of derivative', () => {
      expect(getDerivativeString('x^2')).toBe('2 * x');
      expect(getDerivativeString('X^2')).toBe('2 * x');
      expect(getDerivativeString('SEN(X)')).toBe('cos(x)');
    });
  });
});
