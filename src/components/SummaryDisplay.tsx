import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Copy, Check, Code2, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
  const [showSourceCode, setShowSourceCode] = useState(false);
  const { toast } = useToast();

  const isRubyFile = fileName.toLowerCase().endsWith('.rb');

  const handleDownload = async () => {
    try {
      // Use File System Access API if available
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: markdownFileName,
          types: [{
            description: 'Markdown files',
            accept: { 'text/markdown': ['.md'] }
          }]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(summary);
        await writable.close();
        
        toast({
          title: "File saved successfully",
          description: `File saved to your chosen location.`,
        });
      } else {
        // Fallback to regular download
        downloadFile(summary, markdownFileName);
        toast({
          title: "Download started",
          description: `${markdownFileName} is being downloaded.`,
        });
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        toast({
          title: "Save failed",
          description: "Unable to save file.",
          variant: "destructive",
        });
      }
    }
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

  const handleDownloadPython = async () => {
    if (convertedCode) {
      const pythonFileName = fileName.replace('.rb', '.py');
      
      try {
        // Use File System Access API if available
        if ('showSaveFilePicker' in window) {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: pythonFileName,
            types: [{
              description: 'Python files',
              accept: { 'text/x-python': ['.py'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(convertedCode);
          await writable.close();
          
          toast({
            title: "Python file saved successfully",
            description: `File saved to your chosen location.`,
          });
        } else {
          // Fallback to regular download
          downloadFile(convertedCode, pythonFileName);
          toast({
            title: "Python file downloaded",
            description: `${pythonFileName} has been downloaded.`,
          });
        }
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          toast({
            title: "Save failed",
            description: "Unable to save Python file.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleDownloadConversionReport = async () => {
    if (conversionReport) {
      const reportFileName = `${fileName.split('.')[0]}_conversion_report.md`;
      
      try {
        // Use File System Access API if available
        if ('showSaveFilePicker' in window) {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: reportFileName,
            types: [{
              description: 'Markdown files',
              accept: { 'text/markdown': ['.md'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(conversionReport);
          await writable.close();
          
          toast({
            title: "Report saved successfully",
            description: `File saved to your chosen location.`,
          });
        } else {
          // Fallback to regular download
          downloadFile(conversionReport, reportFileName);
          toast({
            title: "Conversion report downloaded",
            description: `${reportFileName} has been downloaded.`,
          });
        }
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          toast({
            title: "Save failed",
            description: "Unable to save report file.",
            variant: "destructive",
          });
        }
      }
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
      
      {/* App Source Code Section */}
      <Card className="shadow-elegant border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            App Source Code
            <Button
              onClick={() => setShowSourceCode(!showSourceCode)}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              {showSourceCode ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Code
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Code
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        {showSourceCode && (
          <CardContent className="p-0">
            <Tabs defaultValue="converter" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="converter">Ruby Converter</TabsTrigger>
                <TabsTrigger value="summary">Summary Display</TabsTrigger>
                <TabsTrigger value="utils">File Summary</TabsTrigger>
                <TabsTrigger value="main">Main Page</TabsTrigger>
              </TabsList>
              
              <TabsContent value="converter" className="p-6">
                <h4 className="font-semibold mb-3 text-accent">Ruby to Python Converter (src/utils/rubyToPython.ts)</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
{`interface ConversionResult {
  convertedCode: string;
  conversionNotes: string[];
  confidence: 'high' | 'medium' | 'low';
}

export function convertRubyToPython(rubyCode: string): ConversionResult {
  let convertedCode = rubyCode;
  const conversionNotes: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // Basic syntax conversions
  const conversions = [
    // Method definitions
    {
      pattern: /def\\s+(\\w+)(\\(.*?\\))?/g,
      replacement: 'def $1$2:',
      note: 'Converted method definitions to Python syntax'
    },
    // End statements
    {
      pattern: /\\bend\\b/g,
      replacement: '',
      note: 'Removed Ruby "end" keywords (Python uses indentation)'
    },
    // String interpolation
    {
      pattern: /#\\{([^}]+)\\}/g,
      replacement: '{$1}',
      note: 'Converted Ruby string interpolation to Python f-string format'
    },
    // Puts/print statements
    {
      pattern: /puts\\s+/g,
      replacement: 'print(',
      note: 'Converted "puts" to "print()" - remember to add closing parentheses'
    },
    // Boolean values
    {
      pattern: /\\btrue\\b/g,
      replacement: 'True',
      note: 'Converted boolean "true" to "True"'
    },
    {
      pattern: /\\bfalse\\b/g,
      replacement: 'False',
      note: 'Converted boolean "false" to "False"'
    },
    {
      pattern: /\\bnil\\b/g,
      replacement: 'None',
      note: 'Converted "nil" to "None"'
    }
  ];

  // Apply conversions and generate report
  conversions.forEach(conv => {
    if (conv.pattern.test(convertedCode)) {
      convertedCode = convertedCode.replace(conv.pattern, conv.replacement);
      conversionNotes.push(conv.note);
    }
  });

  return { convertedCode, conversionNotes, confidence };
}`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="summary" className="p-6">
                <h4 className="font-semibold mb-3 text-accent">Summary Display Component (src/components/SummaryDisplay.tsx)</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
{`interface SummaryDisplayProps {
  summary: string;
  fileName: string;
  fileContent: string;
  onReset: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  summary, fileName, fileContent, onReset 
}) => {
  const [copied, setCopied] = useState(false);
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const isRubyFile = fileName.toLowerCase().endsWith('.rb');

  const handleRubyToPythonConversion = async () => {
    setIsConverting(true);
    try {
      const result = convertRubyToPython(fileContent);
      setConvertedCode(result.convertedCode);
      toast({
        title: "Conversion completed!",
        description: \`Ruby code converted to Python with \${result.confidence} confidence.\`,
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* UI components for displaying summary and conversion results */}
    </div>
  );
};`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="utils" className="p-6">
                <h4 className="font-semibold mb-3 text-accent">File Summary Utility (src/utils/fileSummary.ts)</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
{`export function generateFileSummary(content: string, fileName: string): string {
  const lines = content.split('\\n');
  const totalLines = lines.length;
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  
  // Analyze file type and structure
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  const isCodeFile = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'java', 'c', 'cpp'].includes(fileExtension);
  
  let summary = \`# 📊 File Analysis Report\\n\\n\`;
  summary += \`**📄 File:** \${fileName}\\n\`;
  summary += \`**📅 Generated:** \${new Date().toLocaleString()}\\n\\n\`;
  
  // Basic metrics
  summary += \`## 📈 Basic Metrics\\n\\n\`;
  summary += \`| Metric | Value |\\n\`;
  summary += \`|--------|-------|\\n\`;
  summary += \`| Total Lines | \${totalLines.toLocaleString()} |\\n\`;
  summary += \`| Non-empty Lines | \${nonEmptyLines.toLocaleString()} |\\n\`;
  
  if (isCodeFile) {
    const functions = (content.match(/function\\s+\\w+|def\\s+\\w+|class\\s+\\w+/g) || []).length;
    const comments = (content.match(/\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/|#.*/g) || []).length;
    
    summary += \`| Functions/Classes | \${functions} |\\n\`;
    summary += \`| Comments | \${comments} |\\n\`;
  }
  
  return summary;
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="main" className="p-6">
                <h4 className="font-semibold mb-3 text-accent">Main Application (src/pages/Index.tsx)</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
{`export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      const content = await file.text();
      setFileContent(content);
      
      // Generate comprehensive summary
      const fileSummary = generateFileSummary(content, file.name);
      setSummary(fileSummary);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent('');
    setSummary('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {summary ? (
        <SummaryDisplay 
          summary={summary}
          fileName={selectedFile?.name || ''}
          fileContent={fileContent}
          onReset={handleReset}
        />
      ) : (
        <div className="container mx-auto px-4 py-16">
          {/* Hero section and file upload interface */}
        </div>
      )}
    </div>
  );
}`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Analysis complete! {isRubyFile ? 'Ruby files can be converted to Python using the converter above.' : 'Upload a Ruby file (.rb) to access the Python conversion feature.'}
        </p>
      </div>
    </div>
  );
};