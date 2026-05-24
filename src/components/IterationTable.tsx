import { Iteration } from '@/lib/rootMethods';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface IterationTableProps {
  iterations: Iteration[];
}

export default function IterationTable({ iterations }: IterationTableProps) {
  if (!iterations.length) return null;
  const keys = Object.keys(iterations[0]);

  return (
    <div className="rounded-lg border overflow-auto max-h-80">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {keys.map(k => (
              <TableHead key={k} className="font-mono text-xs whitespace-nowrap">{k}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {iterations.map((row, i) => (
            <TableRow key={i} className="hover:bg-muted/30">
              {keys.map(k => (
                <TableCell key={k} className="font-mono text-xs whitespace-nowrap">
                  {k === 'n' ? row[k] : (typeof row[k] === 'number' ? (row[k] as number).toFixed(8) : row[k])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
