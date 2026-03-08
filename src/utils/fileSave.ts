import { downloadFile } from '@/utils/fileSummary';

interface SaveFileOptions {
  content: string;
  suggestedName: string;
  description: string;
  accept: Record<string, string[]>;
}

export async function saveFile(
  options: SaveFileOptions,
  toast: (opts: { title: string; description: string; variant?: string }) => void
): Promise<void> {
  try {
    if ('showSaveFilePicker' in window) {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: options.suggestedName,
        types: [{ description: options.description, accept: options.accept }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(options.content);
      await writable.close();
      toast({ title: 'File saved successfully', description: 'File saved to your chosen location.' });
    } else {
      downloadFile(options.content, options.suggestedName);
      toast({ title: 'Download started', description: `${options.suggestedName} is being downloaded.` });
    }
  } catch (error) {
    if ((error as any).name !== 'AbortError') {
      toast({ title: 'Save failed', description: 'Unable to save file.', variant: 'destructive' });
    }
  }
}
