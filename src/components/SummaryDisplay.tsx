import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText, Copy, Check, Code2, ArrowRight } from 'lucide-react';
import { downloadFile } from '@/utils/fileSummary';
import { convertRubyToPython, generateConversionReport } from '@/utils/rubyToPython';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SummaryDisplayProps {
  summary: string;
  fileName: string;
  fileContent: string;
  onReset: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  summary, 
  fileName, 
  fileContent, 
  onReset 
}) => {
  const [copied, setCopied] = useState(false);
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [conversionReport, setConversionReport] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [markdownFileName, setMarkdownFileName] = useState(`${fileName.split('.')[0]}.md`);
  const { toast } = useToast();

  const isRubyFile = fileName.toLowerCase().endsWith('.rb');

  const handleDownload = () => {
    downloadFile(summary, markdownFileName);
    toast({
      title: "Download started",
      description: `${markdownFileName} is being downloaded.`,
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

  const handleRubyToPythonConversion = async () => {
    setIsConverting(true);
    
    try {
      const result = convertRubyToPython(fileContent);
      setConvertedCode(result.convertedCode);
      
      const report = generateConversionReport(result, fileName);
      setConversionReport(report);
      
      toast({
        title: "Conversion completed!",
        description: `Ruby code converted to Python with ${result.confidence} confidence.`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Unable to convert Ruby code to Python.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadPython = () => {
    if (convertedCode) {
      const pythonFileName = fileName.replace('.rb', '.py');
      downloadFile(convertedCode, pythonFileName);
      toast({
        title: "Python file downloaded",
        description: `${pythonFileName} has been downloaded.`,
      });
    }
  };

  const handleDownloadConversionReport = () => {
    if (conversionReport) {
      const reportFileName = `${fileName.split('.')[0]}_conversion_report.md`;
      downloadFile(conversionReport, reportFileName);
      toast({
        title: "Conversion report downloaded",
        description: `${reportFileName} has been downloaded.`,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-elegant">
        <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Analysis Complete for {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Label htmlFor="markdown-filename" className="text-sm font-medium mb-2 block">
              Markdown filename:
            </Label>
            <Input
              id="markdown-filename"
              value={markdownFileName}
              onChange={(e) => setMarkdownFileName(e.target.value)}
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
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Summary'}
            </Button>
            
            {isRubyFile && (
              <Button 
                onClick={handleRubyToPythonConversion} 
                variant="hero" 
                size="lg"
                disabled={isConverting}
              >
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

      {/* Conversion Results */}
      {convertedCode && (
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
              <Button onClick={handleDownloadConversionReport} variant="secondary" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3 text-accent">Converted Python Code:</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-80">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                    {convertedCode}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-accent">Conversion Report:</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-80">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                    {conversionReport}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Analysis complete! {isRubyFile ? 'Ruby files can be converted to Python using the converter above.' : 'Upload a Ruby file (.rb) to access the Python conversion feature.'}
        </p>
      </div>
    </div>
  );
};