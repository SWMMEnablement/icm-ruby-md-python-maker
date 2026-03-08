import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Copy, Check, Code2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFile } from '@/utils/fileSave';

interface DownloadActionsProps {
  summary: string;
  isRubyFile: boolean;
  isConverting: boolean;
  onConvert: () => void;
  onReset: () => void;
  markdownFileName: string;
  onMarkdownFileNameChange: (name: string) => void;
}

export const DownloadActions: React.FC<DownloadActionsProps> = ({
  summary,
  isRubyFile,
  isConverting,
  onConvert,
  onReset,
  markdownFileName,
  onMarkdownFileNameChange,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    saveFile(
      {
        content: summary,
        suggestedName: markdownFileName,
        description: 'Markdown files',
        accept: { 'text/markdown': ['.md'] },
      },
      toast
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({ title: 'Copied to clipboard', description: 'Summary has been copied to your clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to copy to clipboard.', variant: 'destructive' });
    }
  };

  return (
    <>
      <div className="mb-6">
        <Label htmlFor="markdown-filename" className="text-sm font-medium mb-2 block">
          Markdown filename:
        </Label>
        <Input
          id="markdown-filename"
          value={markdownFileName}
          onChange={(e) => onMarkdownFileNameChange(e.target.value)}
          placeholder="Enter filename..."
          className="w-full max-w-md"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={handleDownload} variant="default" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
        <Button onClick={handleCopy} variant="secondary" size="lg">
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </Button>

        {isRubyFile && (
          <Button onClick={onConvert} variant="hero" size="lg" disabled={isConverting}>
            {isConverting ? (
              <div className="animate-spin w-4 h-4 mr-2">
                <Code2 className="w-4 h-4" />
              </div>
            ) : (
              <Code2 className="w-4 h-4 mr-2" />
            )}
            {isConverting ? 'Converting...' : 'Convert to Python'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        <Button onClick={onReset} variant="outline" size="lg">
          Analyze Another
        </Button>
      </div>

      <div className="relative">
        <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{summary}</pre>
        </div>
        <div className="absolute top-2 right-2">
          <Button onClick={handleCopy} variant="ghost" size="sm" className="h-8 w-8 p-0">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </>
  );
};
