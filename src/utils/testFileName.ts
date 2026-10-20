/** Suggest an idiomatic test filename for a source file. */
export function suggestTestFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : 'txt';
  switch (ext) {
    case 'py': return `test_${base}.py`;
    case 'rb': return `${base}_spec.rb`;
    case 'go': return `${base}_test.go`;
    case 'java': return `${base}Test.java`;
    case 'ts': case 'tsx': case 'js': case 'jsx': return `${base}.test.${ext}`;
    default: return `${base}_test.${ext}`;
  }
}
