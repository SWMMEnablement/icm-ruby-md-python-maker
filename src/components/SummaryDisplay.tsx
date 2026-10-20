import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { convertRubyToPython, generateConversionReport } from '@/utils/rubyToPython';
import { useToast } from '@/hooks/use-toast';
import { DownloadActions } from '@/components/DownloadActions';
import { ConversionResults } from '@/components/ConversionResults';
import { SourceCodeViewer } from '@/components/SourceCodeViewer';
import { UnitTestGenerator } from '@/components/UnitTestGenerator';

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
  onReset,
}) => {
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [conversionReport, setConversionReport] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [markdownFileName, setMarkdownFileName] = useState(`${fileName.split('.')[0]}.md`);
  const { toast } = useToast();

  const isRubyFile = fileName.toLowerCase().endsWith('.rb');

  const handleRubyToPythonConversion = async () => {
    setIsConverting(true);
    try {
      const result = convertRubyToPython(fileContent);
      setConvertedCode(result.convertedCode);
      const report = generateConversionReport(result, fileName);
      setConversionReport(report);
      toast({
        title: 'Conversion completed!',
        description: `Ruby code converted to Python with ${result.confidence} confidence.`,
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
      <Card className="shadow-elegant">
        <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Analysis Complete for {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DownloadActions
            summary={summary}
            isRubyFile={isRubyFile}
            isConverting={isConverting}
            onConvert={handleRubyToPythonConversion}
            onReset={onReset}
            markdownFileName={markdownFileName}
            onMarkdownFileNameChange={setMarkdownFileName}
          />
        </CardContent>
      </Card>

      {convertedCode && conversionReport && (
        <ConversionResults
          convertedCode={convertedCode}
          conversionReport={conversionReport}
          fileName={fileName}
        />
      )}

      <UnitTestGenerator fileName={fileName} fileContent={fileContent} />

      <SourceCodeViewer />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Analysis complete!{' '}
          {isRubyFile
            ? 'Ruby files can be converted to Python using the converter above.'
            : 'Upload a Ruby file (.rb) to access the Python conversion feature.'}
        </p>
      </div>
    </div>
  );
};
