import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Eye, EyeOff } from 'lucide-react';

const SOURCE_TABS = [
  {
    value: 'converter',
    label: 'Ruby Converter',
    title: 'Ruby to Python Converter (src/utils/rubyToPython.ts)',
    code: `interface ConversionResult {
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
    {
      pattern: /def\\s+(\\w+)(\\(.*?\\))?/g,
      replacement: 'def $1$2:',
      note: 'Converted method definitions to Python syntax'
    },
    {
      pattern: /\\bend\\b/g,
      replacement: '',
      note: 'Removed Ruby "end" keywords (Python uses indentation)'
    },
    {
      pattern: /#\\{([^}]+)\\}/g,
      replacement: '{$1}',
      note: 'Converted Ruby string interpolation to Python f-string format'
    },
    {
      pattern: /puts\\s+/g,
      replacement: 'print(',
      note: 'Converted "puts" to "print()" - remember to add closing parentheses'
    },
    {
      pattern: /\\btrue\\b/g, replacement: 'True',
      note: 'Converted boolean "true" to "True"'
    },
    {
      pattern: /\\bfalse\\b/g, replacement: 'False',
      note: 'Converted boolean "false" to "False"'
    },
    {
      pattern: /\\bnil\\b/g, replacement: 'None',
      note: 'Converted "nil" to "None"'
    }
  ];

  conversions.forEach(conv => {
    if (conv.pattern.test(convertedCode)) {
      convertedCode = convertedCode.replace(conv.pattern, conv.replacement);
      conversionNotes.push(conv.note);
    }
  });

  return { convertedCode, conversionNotes, confidence };
}`,
  },
  {
    value: 'summary',
    label: 'Summary Display',
    title: 'Summary Display Component (src/components/SummaryDisplay.tsx)',
    code: `interface SummaryDisplayProps {
  summary: string;
  fileName: string;
  fileContent: string;
  onReset: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary, fileName, fileContent, onReset,
}) => {
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [conversionReport, setConversionReport] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [markdownFileName, setMarkdownFileName] = useState(
    \`\${fileName.split('.')[0]}.md\`
  );
  const { toast } = useToast();

  const isRubyFile = fileName.toLowerCase().endsWith('.rb');

  const handleRubyToPythonConversion = async () => {
    setIsConverting(true);
    try {
      const result = convertRubyToPython(fileContent);
      setConvertedCode(result.convertedCode);
      setConversionReport(generateConversionReport(result, fileName));
      toast({
        title: 'Conversion completed!',
        description: \`Converted with \${result.confidence} confidence.\`,
      });
    } catch {
      toast({
        title: 'Conversion failed',
        description: 'Unable to convert Ruby code to Python.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <DownloadActions ... />
      </Card>
      {convertedCode && conversionReport && (
        <ConversionResults ... />
      )}
      <SourceCodeViewer />
    </div>
  );
};`,
  },
  {
    value: 'utils',
    label: 'File Summary',
    title: 'File Summary Utility (src/utils/fileSummary.ts)',
    code: `export function generateFileSummary(content: string, fileName: string): string {
  const lines = content.split('\\n');
  const totalLines = lines.length;
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  const isCodeFile = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'java', 'c', 'cpp'].includes(fileExtension);
  
  let summary = \`# 📊 File Analysis Report\\n\\n\`;
  summary += \`**📄 File:** \${fileName}\\n\`;
  summary += \`**📅 Generated:** \${new Date().toLocaleString()}\\n\\n\`;
  
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
}`,
  },
  {
    value: 'main',
    label: 'Main Page',
    title: 'Main Application (src/pages/Index.tsx)',
    code: `export default function Index() {
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
}`,
  },
];

export const SourceCodeViewer: React.FC = () => {
  const [showSourceCode, setShowSourceCode] = useState(false);

  return (
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
              {SOURCE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {SOURCE_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="p-6">
                <h4 className="font-semibold mb-3 text-accent">{tab.title}</h4>
                <div className="bg-muted rounded-lg p-4 border border-border overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
                    {tab.code}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};
