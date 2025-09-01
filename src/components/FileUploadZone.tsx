import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect, isProcessing = false }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please select a supported file type.');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB.');
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md', '.py', '.js', '.ts', '.java', '.rb', '.go', '.php', '.cpp', '.c', '.h', '.css', '.html', '.xml', '.json', '.yml', '.yaml', '.sh', '.bash'],
      'application/javascript': ['.js'],
      'text/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/x-python': ['.py'],
      'text/x-java-source': ['.java'],
      'text/x-ruby': ['.rb'],
      'text/x-go': ['.go'],
      'application/x-php': ['.php'],
      'text/x-c': ['.c', '.cpp', '.h'],
      'text/css': ['.css'],
      'text/html': ['.html'],
      'application/xml': ['.xml'],
      'application/json': ['.json'],
      'application/x-yaml': ['.yml', '.yaml'],
      'application/x-sh': ['.sh', '.bash']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative p-8 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer",
          "bg-gradient-to-br from-background to-muted/50",
          "hover:from-muted/50 hover:to-muted/70 hover:shadow-soft",
          isDragActive 
            ? "border-primary bg-primary/5 shadow-elegant" 
            : "border-border hover:border-primary/50",
          isProcessing && "pointer-events-none opacity-50",
          error && "border-destructive bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragActive ? "bg-primary/10 text-primary animate-float" : "bg-muted text-muted-foreground"
          )}>
            {isProcessing ? (
              <div className="animate-spin">
                <FileText className="w-8 h-8" />
              </div>
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isProcessing 
                ? "Processing your file..." 
                : isDragActive 
                  ? "Drop your file here" 
                  : "Drag & drop a code file here"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {!isProcessing && "or click to browse files"}
            </p>
          </div>
          
          {!isProcessing && (
            <Button variant="upload" size="lg" className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          )}
        </div>
        
        {!isProcessing && (
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            Supports: .py, .js, .ts, .java, .rb, .go, .php, .cpp, .c, .html, .css, .json, .md, .yml, .sh
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center mt-3 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};