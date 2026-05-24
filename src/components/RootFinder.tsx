import { useState } from 'react';
import { bisection, newtonRaphson, secant, fixedPoint, RootResult } from '@/lib/rootMethods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import IterationTable from '@/components/IterationTable';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const methodDescriptions: Record<string, string> = {
  bisection: 'Divide o intervalo [a, b] ao meio repetidamente. Requer f(a)·f(b) < 0. Convergência garantida, porém lenta.',
  fixedPoint: 'Reescreve f(x)=0 como x=g(x) e itera x_{n+1}=g(x_n). Precisa de uma função g(x) adequada.',
  newton: 'Usa a tangente da função para convergir rapidamente. Requer f(x) e f\'(x). Convergência quadrática.',
  secant: 'Similar ao Newton, mas aproxima a derivada usando dois pontos anteriores. Não precisa da derivada explícita.',
};

export default function RootFinder() {
  const [method, setMethod] = useState('bisection');
  const [expr, setExpr] = useState('x^2 - 4');
  const [gExpr, setGExpr] = useState('(4/x + x)/2');
  const [a, setA] = useState('0');
  const [b, setB] = useState('3');
  const [x0, setX0] = useState('1');
  const [x1, setX1] = useState('3');
  const [tol, setTol] = useState('0.0001');
  const [maxIter, setMaxIter] = useState('100');
  const [result, setResult] = useState<RootResult | null>(null);
  const [error, setError] = useState('');

  const solve = () => {
    setError('');
    setResult(null);
    try {
      if (method !== 'fixedPoint' && expr.trim() === '') {
        throw new Error('A expressão da função f(x) não pode estar vazia.');
      }
      if (method === 'fixedPoint' && gExpr.trim() === '') {
        throw new Error('A expressão da função g(x) não pode estar vazia.');
      }

      const cleanNum = (val: string) => {
        const cleaned = val.trim().replace(',', '.');
        if (cleaned === '') return NaN;
        return Number(cleaned);
      };

      const t = cleanNum(tol);
      const mi = parseInt(maxIter.trim(), 10);
      let res: RootResult;
      switch (method) {
        case 'bisection':
          res = bisection(expr, cleanNum(a), cleanNum(b), t, mi);
          break;
        case 'fixedPoint':
          res = fixedPoint(gExpr, cleanNum(x0), t, mi);
          break;
        case 'newton':
          res = newtonRaphson(expr, cleanNum(x0), t, mi);
          break;
        case 'secant':
          res = secant(expr, cleanNum(x0), cleanNum(x1), t, mi);
          break;
        default:
          return;
      }
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Determinação de Raízes</h2>
        <p className="text-muted-foreground text-sm mt-1">Encontre raízes de funções usando métodos numéricos clássicos.</p>
      </div>

      <Tabs value={method} onValueChange={setMethod}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="bisection">Bisseção</TabsTrigger>
          <TabsTrigger value="fixedPoint">Ponto Fixo</TabsTrigger>
          <TabsTrigger value="newton">Newton-raphson</TabsTrigger>
          <TabsTrigger value="secant">Secantes</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 shrink-0" />
              <CardDescription className="text-sm">{methodDescriptions[method]}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {method !== 'fixedPoint' && (
                <div>
                  <Label className="text-xs font-medium">Função f(x)</Label>
                  <Input value={expr} onChange={e => setExpr(e.target.value)} placeholder="x^2 - 4" className="font-mono mt-1" />
                </div>
              )}
              {method === 'fixedPoint' && (
                <div>
                  <Label className="text-xs font-medium">Função g(x) (onde x = g(x))</Label>
                  <Input value={gExpr} onChange={e => setGExpr(e.target.value)} placeholder="(4/x + x)/2" className="font-mono mt-1" />
                </div>
              )}

              {method === 'bisection' && (
                <>
                  <div>
                    <Label className="text-xs font-medium">a (limite inferior)</Label>
                    <Input type="number" value={a} onChange={e => setA(e.target.value)} className="font-mono mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">b (limite superior)</Label>
                    <Input type="number" value={b} onChange={e => setB(e.target.value)} className="font-mono mt-1" />
                  </div>
                </>
              )}

              {(method === 'fixedPoint' || method === 'newton') && (
                <div>
                  <Label className="text-xs font-medium">x₀ (aproximação inicial)</Label>
                  <Input type="number" value={x0} onChange={e => setX0(e.target.value)} className="font-mono mt-1" />
                </div>
              )}

              {method === 'secant' && (
                <>
                  <div>
                    <Label className="text-xs font-medium">x₀</Label>
                    <Input type="number" value={x0} onChange={e => setX0(e.target.value)} className="font-mono mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">x₁</Label>
                    <Input type="number" value={x1} onChange={e => setX1(e.target.value)} className="font-mono mt-1" />
                  </div>
                </>
              )}

              <div>
                <Label className="text-xs font-medium">Tolerância</Label>
                <Input type="number" value={tol} onChange={e => setTol(e.target.value)} className="font-mono mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Máx. Iterações</Label>
                <Input type="number" value={maxIter} onChange={e => setMaxIter(e.target.value)} className="font-mono mt-1" />
              </div>
            </div>

            <Button onClick={solve} className="w-full sm:w-auto">Calcular Raiz</Button>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {result.converged ? <CheckCircle2 className="text-secondary" size={20} /> : <AlertCircle className="text-accent" size={20} />}
                Resultado — {result.method}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Raiz aproximada</p>
                  <p className="font-mono font-bold text-lg text-primary">{result.root.toFixed(8)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Iterações</p>
                  <p className="font-mono font-bold text-lg">{result.iterations.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={result.converged ? 'default' : 'destructive'}>
                    {result.converged ? 'Convergiu' : 'Não convergiu'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Histórico de Iterações</CardTitle>
            </CardHeader>
            <CardContent>
              <IterationTable iterations={result.iterations} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
