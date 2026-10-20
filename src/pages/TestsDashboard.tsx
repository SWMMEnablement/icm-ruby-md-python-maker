import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/utils/deviceId';
import { saveFile } from '@/utils/fileSave';
import { useToast } from '@/hooks/use-toast';

interface Row {
  id: string; file_name: string; test_file_name: string | null; language: string;
  framework: string | null; status: string; error: string | null; tests: string | null;
  created_at: string; updated_at: string;
}

const statusVariant = (s: string) =>
  s === 'passed' ? 'default' : s === 'failed' ? 'destructive' : 'secondary';
const statusLabel: Record<string, string> = { passed: 'Generated', failed: 'Failed', stopped: 'Stopped', running: 'Running' };

export default function TestsDashboard() {
  const { toast } = useToast();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['generated-tests'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('list-generated-tests', { body: { deviceId: getDeviceId() } });
      if (error) throw error;
      return (data.items ?? []) as Row[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link></Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
        <Card className="shadow-elegant">
          <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
            <CardTitle>Generated Unit Tests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <p className="p-6 text-muted-foreground">Loading…</p>
              : error ? <p className="p-6 text-destructive">Could not load your tests.</p>
              : !data?.length ? <p className="p-6 text-muted-foreground">No tests generated yet. Upload a file on the home page to create some.</p>
              : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead><TableHead>Test file</TableHead><TableHead>Language</TableHead>
                      <TableHead>Last run</TableHead><TableHead>Status</TableHead><TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.file_name}</TableCell>
                        <TableCell className="font-mono text-sm">{r.test_file_name ?? '—'}</TableCell>
                        <TableCell>{r.language}{r.framework ? ` · ${r.framework}` : ''}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(r.updated_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status)} title={r.error ?? undefined}>{statusLabel[r.status] ?? r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.tests && (
                            <Button size="sm" variant="secondary" onClick={() => saveFile({ content: r.tests!, suggestedName: r.test_file_name || 'tests.txt', description: 'Test file', accept: { 'text/plain': ['.' + ((r.test_file_name ?? 'txt').split('.').pop())] } }, toast)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
