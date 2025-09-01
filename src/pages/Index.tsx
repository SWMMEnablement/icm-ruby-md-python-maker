import React, { useState } from 'react';
import { FileUploadZone } from '@/components/FileUploadZone';
import { SummaryDisplay } from '@/components/SummaryDisplay';
import { generateFileSummary } from '@/utils/fileSummary';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Github, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      const content = await file.text();
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
          <div className="container mx-auto px-4 py-20 text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm animate-float">
                <Github className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-glow">
              GitHub File Summarizer
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transform your code files into beautiful, comprehensive Markdown summaries instantly
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
                Drag and drop any code file to generate a comprehensive summary with structure analysis, 
                purpose detection, and detailed statistics.
              </p>
            </div>
            
            <FileUploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="text-center p-6 shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Analysis</h3>
                  <p className="text-muted-foreground">
                    Automatically detects file type, purpose, and structure with intelligent code analysis.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">Beautiful Formatting</h3>
                  <p className="text-muted-foreground">
                    Generates clean, well-structured Markdown with syntax highlighting and proper formatting.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary-glow/10 rounded-lg flex items-center justify-center mx-auto">
                    <Github className="w-6 h-6 text-primary-glow" />
                  </div>
                  <h3 className="text-xl font-semibold">Multiple Languages</h3>
                  <p className="text-muted-foreground">
                    Supports 20+ programming languages including JavaScript, Python, Java, Go, and more.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <SummaryDisplay 
            summary={summary} 
            fileName={selectedFile?.name || ''} 
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
