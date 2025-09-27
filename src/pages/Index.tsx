import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { generateFileSummary } from '@/utils/fileSummary';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Github, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
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
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const lines = content.split('\n');
      
      const generatedSummary = generateFileSummary({
        content,
        fileName: file.name,
        fileExtension,
        lines
      });
      
      // Simulate processing delay for better UX
      setTimeout(() => {
        setSummary(generatedSummary);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Error processing file:', error);
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative bg-gradient-hero">
          <div className="container mx-auto px-4 py-12 text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm animate-float">
                <Github className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-glow">
              GitHub File Summarizer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transform code files into detailed Markdown summaries and convert Ruby to Python instantly
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Instant Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Beautiful Output</span>
              </div>
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span>20+ Languages</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {!summary ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Upload Your File</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Drag and drop any code file to generate comprehensive summaries with structure analysis, 
                purpose detection, and detailed statistics. Ruby files get automatic Python conversion!
              </p>
            </div>
            
            <FileUploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="text-center p-6 shadow-soft hover:shadow-colorful transition-all duration-300 border border-primary/20">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto shadow-colorful">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">Smart Analysis</h3>
                  <p className="text-muted-foreground">
                    Automatically detects file type, purpose, and structure with intelligent code analysis.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 shadow-soft hover:shadow-colorful transition-all duration-300 border border-accent/20">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center mx-auto shadow-colorful">
                    <Sparkles className="w-6 h-6 text-warning-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-warning bg-clip-text text-transparent">Beautiful Formatting</h3>
                  <p className="text-muted-foreground">
                    Generates clean, well-structured Markdown with syntax highlighting and proper formatting.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 shadow-soft hover:shadow-colorful transition-all duration-300 border border-success/20">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mx-auto shadow-colorful">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold bg-gradient-success bg-clip-text text-transparent">Ruby to Python</h3>
                  <p className="text-muted-foreground">
                    Automatically converts Ruby code to Python with detailed conversion reports and manual review guidance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <SummaryDisplay 
            summary={summary} 
            fileName={selectedFile?.name || ''} 
            fileContent={fileContent}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
