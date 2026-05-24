import { compile, derivative, parse, EvalFunction } from 'mathjs';

const exprCache = new Map<string, EvalFunction>();
const derivCache = new Map<string, EvalFunction>();

/**
 * Preprocessa a expressão matemática para normalizar variáveis (ex: X para x)
 * e mapear funções matemáticas em português (ex: sen(x) para sin(x))
 * para que o MathJS possa interpretá-las corretamente.
 */
function preprocessExpression(expr: string): string {
  if (!expr || expr.trim() === '') {
    throw new Error('A expressão não pode estar vazia.');
  }

  let processed = expr.toLowerCase();

  // Substitui funções matemáticas em português para o padrão do MathJS
  processed = processed.replace(/\barcsen\b/g, 'arcsin');
  processed = processed.replace(/\barctg\b/g, 'arctan');
  processed = processed.replace(/\bsen\b/g, 'sin');
  processed = processed.replace(/\bseno\b/g, 'sin');
  processed = processed.replace(/\btg\b/g, 'tan');
  processed = processed.replace(/\btangente\b/g, 'tan');

  return processed;
}

/**
 * Converte o valor retornado do MathJS para um número real comum,
 * lidando com objetos como Fraction ou BigNumber se necessário.
 */
function convertToRealNumber(val: unknown): number {
  let numericVal: unknown = val;
  if (val && typeof val === 'object' && 'toNumber' in val) {
    const objWithToNumber = val as { toNumber: () => unknown };
    if (typeof objWithToNumber.toNumber === 'function') {
      numericVal = objWithToNumber.toNumber();
    }
  }
  if (typeof numericVal === 'number' && numericVal === 0) {
    return 0;
  }
  return numericVal as number;
}

export function evaluateFunction(expr: string, x: number): number {
  const cleanExpr = preprocessExpression(expr);
  const cached = exprCache.get(cleanExpr);
  const compiled = cached || compile(cleanExpr);
  if (!cached) {
    exprCache.set(cleanExpr, compiled);
  }
  
  const rawVal = compiled.evaluate({ x });
  const val = convertToRealNumber(rawVal);
  
  if (typeof val !== 'number' || isNaN(val)) {
    throw new Error('A expressão não resultou em um valor numérico real.');
  }
  return val;
}

export function evaluateDerivative(expr: string, x: number): number {
  const cleanExpr = preprocessExpression(expr);
  const cached = derivCache.get(cleanExpr);
  let compiled: EvalFunction;
  if (cached) {
    compiled = cached;
  } else {
    const node = parse(cleanExpr);
    const diff = derivative(node, 'x');
    compiled = diff.compile();
    derivCache.set(cleanExpr, compiled);
  }
  
  const rawVal = compiled.evaluate({ x });
  const val = convertToRealNumber(rawVal);
  
  if (typeof val !== 'number' || isNaN(val)) {
    throw new Error('A derivada não resultou em um valor numérico real.');
  }
  return val;
}

export function getDerivativeString(expr: string): string {
  const cleanExpr = preprocessExpression(expr);
  const node = parse(cleanExpr);
  const diff = derivative(node, 'x');
  return diff.toString();
}
