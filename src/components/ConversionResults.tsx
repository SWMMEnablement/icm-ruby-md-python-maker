import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFile } from '@/utils/fileSave';

interface ConversionResultsProps {
  convertedCode: string;
  conversionReport: string;
  fileName: string;
}

export const ConversionResults: React.FC<ConversionResultsProps> = ({
  convertedCode,
  conversionReport,
  fileName,
}) => {
  const { toast } = useToast();

  const handleDownloadPython = () => {
    const pythonFileName = fileName.replace('.rb', '.py');
    saveFile(
      {
        content: convertedCode,
        suggestedName: pythonFileName,
        description: 'Python files',
        accept: { 'text/x-python': ['.py'] },
      },
      toast
    );
  };

  const handleDownloadReport = () => {
    const reportFileName = `${fileName.split('.')[0]}_conversion_report.md`;
    saveFile(
      {
        content: conversionReport,
        suggestedName: reportFileName,
        description: 'Markdown files',
        accept: { 'text/markdown': ['.md'] },
      },
      toast
    );
  };

  return (
    <Card className="shadow-elegant border-accent/20">
      <CardHeader className="bg-gradient-to-r from-accent to-primary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          Python Conversion Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-3 mb-6">
          <Button onClick={handleDownloadPython} variant="default" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download Python Code
          </Button>
          <Button onClick={handleDownloadReport} variant="secondary" size="lg">
            <FileText className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-3 text-accent">Converted Python Code:</h4>
            <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-80">
              <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{convertedCode}</pre>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-accent">Conversion Report:</h4>
            <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-80">
              <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{conversionReport}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
