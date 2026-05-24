import { useState } from 'react';
import { gaussElimination, luDecomposition, jacobi, gaussSeidel, LinearResult } from '@/lib/linearSystems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Info, Plus, Minus } from 'lucide-react';

const methodDescriptions: Record<string, string> = {
  gauss: 'Eliminação progressiva com pivoteamento parcial, seguida de substituição regressiva.',
  lu: 'Decompõe A = LU e resolve dois sistemas triangulares. Eficiente para múltiplos vetores b.',
  jacobi: 'Método iterativo que usa valores da iteração anterior. Requer dominância diagonal.',
  seidel: 'Similar ao Jacobi, mas usa valores já atualizados na mesma iteração. Geralmente converge mais rápido.',
};

export default function LinearSystemSolver() {
  const [method, setMethod] = useState('gauss');
  const [size, setSize] = useState(3);
  const [matrix, setMatrix] = useState<string[][]>(
    Array.from({ length: 3 }, () => Array(3).fill('0'))
  );
  const [bVec, setBVec] = useState<string[]>(Array(3).fill('0'));
  const [tol, setTol] = useState('0.0001');
  const [maxIter, setMaxIter] = useState('100');
  const [result, setResult] = useState<LinearResult | null>(null);
  const [error, setError] = useState('');

  const resize = (newSize: number) => {
    if (newSize < 2 || newSize > 10) return;
    setSize(newSize);
    setMatrix(Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => matrix[i]?.[j] ?? '0')
    ));
    setBVec(Array.from({ length: newSize }, (_, i) => bVec[i] ?? '0'));
    setResult(null);
  };

  const updateCell = (i: number, j: number, v: string) => {
    const m = matrix.map(r => [...r]);
    m[i][j] = v;
    setMatrix(m);
  };

  const updateB = (i: number, v: string) => {
    const b = [...bVec];
    b[i] = v;
    setBVec(b);
  };

  const solve = () => {
    setError('');
    setResult(null);
    try {
      const A = matrix.map((row, i) => row.map((cell, j) => {
        const cleaned = cell.trim().replace(',', '.');
        if (cleaned === '') {
          throw new Error(`A célula da matriz A na linha ${i + 1}, coluna ${j + 1} está vazia.`);
        }
        const val = Number(cleaned);
        if (isNaN(val) || !Number.isFinite(val)) {
          throw new Error(`A célula da matriz A na linha ${i + 1}, coluna ${j + 1} possui um valor inválido ("${cell}").`);
        }
        return val;
      }));

      const b = bVec.map((cell, i) => {
        const cleaned = cell.trim().replace(',', '.');
        if (cleaned === '') {
          throw new Error(`A posição ${i + 1} do vetor b está vazia.`);
        }
        const val = Number(cleaned);
        if (isNaN(val) || !Number.isFinite(val)) {
          throw new Error(`A posição ${i + 1} do vetor b possui um valor inválido ("${cell}").`);
        }
        return val;
      });

      let res: LinearResult;
      switch (method) {
        case 'gauss':
          res = gaussElimination(A, b);
          break;
        case 'lu':
          res = luDecomposition(A, b);
          break;
        case 'jacobi': {
          const parsedTol = parseFloat(tol.trim().replace(',', '.'));
          if (isNaN(parsedTol) || parsedTol <= 0) {
            throw new Error('A tolerância deve ser um número real positivo.');
          }
          const parsedMaxIter = parseInt(maxIter.trim(), 10);
          if (isNaN(parsedMaxIter) || parsedMaxIter <= 0) {
            throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
          }
          res = jacobi(A, b, parsedTol, parsedMaxIter);
          break;
        }
        case 'seidel': {
          const parsedTol = parseFloat(tol.trim().replace(',', '.'));
          if (isNaN(parsedTol) || parsedTol <= 0) {
            throw new Error('A tolerância deve ser um número real positivo.');
          }
          const parsedMaxIter = parseInt(maxIter.trim(), 10);
          if (isNaN(parsedMaxIter) || parsedMaxIter <= 0) {
            throw new Error('O número máximo de iterações deve ser um número inteiro positivo.');
          }
          res = gaussSeidel(A, b, parsedTol, parsedMaxIter);
          break;
        }
        default:
          return;
      }
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    }
  };

  const isIterative = method === 'jacobi' || method === 'seidel';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sistemas Lineares</h2>
        <p className="text-muted-foreground text-sm mt-1">Resolva sistemas Ax = b usando métodos diretos e iterativos.</p>
      </div>

      <Tabs value={method} onValueChange={setMethod}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="gauss">Gauss</TabsTrigger>
          <TabsTrigger value="lu">LU</TabsTrigger>
          <TabsTrigger value="jacobi">Jacobi</TabsTrigger>
          <TabsTrigger value="seidel">Gauss-Seidel</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 shrink-0" />
              <CardDescription className="text-sm">{methodDescriptions[method]}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Dimensão:</Label>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => resize(size - 1)}>
                <Minus size={14} />
              </Button>
              <span className="font-mono text-sm w-6 text-center">{size}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => resize(size + 1)}>
                <Plus size={14} />
              </Button>
            </div>

            <div className="overflow-auto">
              <div className="flex gap-2 items-start">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Matriz A</Label>
                  <div className="space-y-1">
                    {matrix.map((row, i) => (
                      <div key={i} className="flex gap-1">
                        {row.map((cell, j) => (
                          <Input
                            key={j}
                            value={cell}
                            onChange={e => updateCell(i, j, e.target.value)}
                            className="w-16 h-8 text-xs font-mono text-center p-1"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Vetor b</Label>
                  <div className="space-y-1">
                    {bVec.map((v, i) => (
                      <Input
                        key={i}
                        value={v}
                        onChange={e => updateB(i, e.target.value)}
                        className="w-16 h-8 text-xs font-mono text-center p-1"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {isIterative && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Tolerância</Label>
                  <Input type="number" value={tol} onChange={e => setTol(e.target.value)} className="font-mono mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Máx. Iterações</Label>
                  <Input type="number" value={maxIter} onChange={e => setMaxIter(e.target.value)} className="font-mono mt-1" />
                </div>
              </div>
            )}

            <Button onClick={solve} className="w-full sm:w-auto">Resolver Sistema</Button>

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
              <CardTitle className="text-lg">Solução — {result.method}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {result.solution.map((v, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg px-4 py-2">
                    <span className="text-xs text-muted-foreground">x{i + 1}</span>
                    <p className="font-mono font-bold text-primary">{v.toFixed(6)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.steps && result.steps.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Passo a Passo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-60 overflow-auto">
                  {result.steps.map((s, i) => (
                    <p key={i} className="text-xs font-mono text-muted-foreground">{s}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.iterations && result.iterations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Iterações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-mono text-xs">n</TableHead>
                        {result.solution.map((_, i) => (
                          <TableHead key={i} className="font-mono text-xs">x{i + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.iterations.map((it, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{it.n}</TableCell>
                          {it.x.map((v, j) => (
                            <TableCell key={j} className="font-mono text-xs">{v.toFixed(8)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
