import { useState } from 'react';
import { linearRegression, leastSquares, CurveResult } from '@/lib/curveFitting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AlertCircle, Info, Plus, Trash2 } from 'lucide-react';

export default function CurveFitter() {
  const [tab, setTab] = useState('regression');
  const [points, setPoints] = useState<{ x: string; y: string }[]>([
    { x: '1', y: '2.1' },
    { x: '2', y: '3.9' },
    { x: '3', y: '6.2' },
    { x: '4', y: '7.8' },
    { x: '5', y: '10.1' },
  ]);

  const [vectorX, setVectorX] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [vectorY, setVectorY] = useState<string[]>(['2', '4', '5', '4', '5']);

  const [result, setResult] = useState<CurveResult | null>(null);
  const [error, setError] = useState('');

  const addPoint = () => setPoints([...points, { x: '', y: '' }]);
  const removePoint = (i: number) => setPoints(points.filter((_, idx) => idx !== i));
  const updatePoint = (i: number, field: 'x' | 'y', v: string) => {
    const p = [...points];
    p[i] = { ...p[i], [field]: v };
    setPoints(p);
  };

  const addX = () => setVectorX([...vectorX, '']);
  const removeX = (i: number) => setVectorX(vectorX.filter((_, idx) => idx !== i));
  const updateX = (i: number, v: string) => {
    const next = [...vectorX];
    next[i] = v;
    setVectorX(next);
  };

  const addY = () => setVectorY([...vectorY, '']);
  const removeY = (i: number) => setVectorY(vectorY.filter((_, idx) => idx !== i));
  const updateY = (i: number, v: string) => {
    const next = [...vectorY];
    next[i] = v;
    setVectorY(next);
  };

  const solve = () => {
    setError('');
    setResult(null);
    try {
      if (tab === 'regression') {
        const parsed = points.map((p, idx) => {
          const xCleaned = p.x.trim().replace(',', '.');
          const yCleaned = p.y.trim().replace(',', '.');
          if (xCleaned === '' || yCleaned === '') {
            throw new Error(`As coordenadas do ponto ${idx + 1} não podem estar vazias.`);
          }
          const x = Number(xCleaned);
          const y = Number(yCleaned);
          if (isNaN(x) || !Number.isFinite(x) || isNaN(y) || !Number.isFinite(y)) {
            throw new Error(`O ponto ${idx + 1} possui coordenadas inválidas (x: "${p.x}", y: "${p.y}").`);
          }
          return { x, y };
        });
        setResult(linearRegression(parsed));
      } else {
        const parsedX = vectorX.map((v, idx) => {
          const cleaned = v.trim().replace(',', '.');
          if (cleaned === '') {
            throw new Error(`A célula ${idx + 1} do vetor X está vazia.`);
          }
          const num = Number(cleaned);
          if (isNaN(num) || !Number.isFinite(num)) {
            throw new Error(`A célula ${idx + 1} do vetor X possui um valor inválido ("${v}").`);
          }
          return num;
        });

        const parsedY = vectorY.map((v, idx) => {
          const cleaned = v.trim().replace(',', '.');
          if (cleaned === '') {
            throw new Error(`A célula ${idx + 1} do vetor Y está vazia.`);
          }
          const num = Number(cleaned);
          if (isNaN(num) || !Number.isFinite(num)) {
            throw new Error(`A célula ${idx + 1} do vetor Y possui um valor inválido ("${v}").`);
          }
          return num;
        });

        setResult(leastSquares(parsedX, parsedY));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ajuste de Curvas</h2>
        <p className="text-muted-foreground text-sm mt-1">Encontre a melhor reta que se ajusta aos dados pelo método dos mínimos quadrados.</p>
      </div>

      <Tabs value={tab} onValueChange={value => { setTab(value); setResult(null); setError(''); }}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="regression">Regressão Linear</TabsTrigger>
          <TabsTrigger value="least_squares">Mínimos Quadrados</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-primary mt-0.5 shrink-0" />
              <CardDescription className="text-sm">
                {tab === 'regression'
                  ? 'A regressão linear minimiza a soma dos quadrados dos resíduos para encontrar a reta y = ax + b que melhor se ajusta aos dados.'
                  : 'O método dos mínimos quadrados minimiza a soma dos quadrados das diferenças entre os valores observados e previstos.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tab === 'regression' ? (
              <>
                <Label className="text-xs font-medium">Pontos (x, y)</Label>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {points.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                      <Input value={p.x} onChange={e => updatePoint(i, 'x', e.target.value)} placeholder="x" className="w-24 h-8 text-xs font-mono" />
                      <Input value={p.y} onChange={e => updatePoint(i, 'y', e.target.value)} placeholder="y" className="w-24 h-8 text-xs font-mono" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removePoint(i)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addPoint}>
                  <Plus size={14} className="mr-1" /> Adicionar Ponto
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-medium block mb-2">Vetor X</Label>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {vectorX.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                        <Input value={val} onChange={e => updateX(i, e.target.value)} placeholder="x" className="w-24 h-8 text-xs font-mono text-center p-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeX(i)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={addX}>
                    <Plus size={14} className="mr-1" /> Adicionar X
                  </Button>
                </div>
                <div>
                  <Label className="text-xs font-medium block mb-2">Vetor Y</Label>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {vectorY.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                        <Input value={val} onChange={e => updateY(i, e.target.value)} placeholder="y" className="w-24 h-8 text-xs font-mono text-center p-1" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeY(i)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={addY}>
                    <Plus size={14} className="mr-1" /> Adicionar Y
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={solve}>
                {tab === 'regression' ? 'Calcular Regressão' : 'Calcular Ajuste'}
              </Button>
            </div>

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
              <CardTitle className="text-lg">Resultado — {result.method}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Equação</p>
                  <p className="font-mono font-bold text-primary">{result.equation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coeficientes Calculados</p>
                  <p className="font-mono font-bold text-sm">
                    a = {result.coefficients.a.toFixed(6)}<br />
                    b = {result.coefficients.b.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {result.error !== undefined ? 'R² e SQ Resíduos (Erro)' : 'R²'}
                  </p>
                  <p className="font-mono font-bold text-sm">
                    R² = {result.rSquared.toFixed(6)}
                    {result.error !== undefined && (
                      <>
                        <br />
                        Erro = {result.error.toFixed(6)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
