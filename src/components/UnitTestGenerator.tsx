import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlaskConical, Download, Copy, Loader2, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFile } from '@/utils/fileSave';
import { suggestTestFileName } from '@/utils/testFileName';
import { getDeviceId } from '@/utils/deviceId';
import { Link } from 'react-router-dom';

interface Props {
  fileName: string;
  fileContent: string;
}

export const UnitTestGenerator: React.FC<Props> = ({ fileName, fileContent }) => {
  const [tests, setTests] = useState('');
  const [loading, setLoading] = useState(false);
  const [framework, setFramework] = useState('');
  const [outName, setOutName] = useState(suggestTestFileName(fileName));
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    setTests('');
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-unit-tests`,
        {
          method: 'POST',
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileName, content: fileContent, framework: framework || undefined,
            deviceId: getDeviceId(), testFileName: outName || undefined,
          }),
        },
      );
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err.error === 'string' ? err.error : 'Could not generate tests.');
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setTests(acc.replace(/^```\w*\n?/, '').replace(/\n?```\s*$/, ''));
      }
      if (!acc.trim()) throw new Error('The AI returned no tests. Please try again.');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        toast({ title: 'Test generation failed', description: (e as Error).message, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          AI Unit Test Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="fw">Test framework (optional)</Label>
            <Input id="fw" placeholder="Auto-detect (e.g. pytest, RSpec, Vitest)" value={framework}
              maxLength={50} onChange={(e) => setFramework(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tfn">Test filename</Label>
            <Input id="tfn" value={outName} maxLength={255} onChange={(e) => setOutName(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <Button variant="outline" onClick={() => abortRef.current?.abort()}>
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          ) : (
            <Button onClick={generate}>
              <FlaskConical className="w-4 h-4 mr-2" /> Generate Unit Tests
            </Button>
          )}
          {loading && <span className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing tests…</span>}
          <Button variant="link" asChild><Link to="/tests">View all generated tests</Link></Button>
          {tests && !loading && (
            <>
              <Button variant="secondary" onClick={() => saveFile({ content: tests, suggestedName: outName || 'tests.txt', description: 'Test file', accept: { 'text/plain': ['.' + ((outName.split('.').pop()) || 'txt')] } }, toast)}>
                <Download className="w-4 h-4 mr-2" /> Download Tests
              </Button>
              <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(tests); toast({ title: 'Copied!' }); }}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </>
          )}
        </div>
        {tests && (
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[500px] whitespace-pre-wrap font-mono">{tests}</pre>
        )}
      </CardContent>
    </Card>
  );
};
