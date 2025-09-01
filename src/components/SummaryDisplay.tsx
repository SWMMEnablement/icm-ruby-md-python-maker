import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Copy, Check } from 'lucide-react';
import { downloadFile } from '@/utils/fileSummary';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SummaryDisplayProps {
  summary: string;
  fileName: string;
  onReset: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, fileName, onReset }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    const summaryFileName = `${fileName.split('.')[0]}_summary.md`;
    downloadFile(summary, summaryFileName);
    toast({
      title: "Download started",
      description: `${summaryFileName} is being downloaded.`,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Summary has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-elegant">
        <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Summary Generated for {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3 mb-6">
            <Button onClick={handleDownload} variant="default" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Download Markdown
            </Button>
            <Button onClick={handleCopy} variant="secondary" size="lg">
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button onClick={onReset} variant="outline" size="lg">
              Generate Another
            </Button>
          </div>
          
          <div className="relative">
            <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                {summary}
              </pre>
            </div>
            <div className="absolute top-2 right-2">
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Summary generated successfully! You can download it as a Markdown file or copy it to your clipboard.
        </p>
      </div>
    </div>
  );
};