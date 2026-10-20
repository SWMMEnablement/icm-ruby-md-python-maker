interface ConversionResult {
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

    
    // End statements
    {
      pattern: /\bend\b/g,
      replacement: '',
      note: 'Removed Ruby "end" keywords (Python uses indentation)'
    },
    
    // String interpolation
    {
      pattern: /#\{([^}]+)\}/g,
      replacement: '{$1}',
      note: 'Converted Ruby string interpolation to Python f-string format'
    },
    
    // Puts/print statements (capture the whole expression and close the paren)
    {
      pattern: /puts\s+(.+)/g,
      replacement: 'print($1)',
      note: 'Converted "puts" to "print()"'
    },

    // .each do |x| blocks → Python for loops
    {
      pattern: /(\w+)\.each\s+do\s*\|([^|]+)\|/g,
      replacement: 'for $2 in $1:',
      note: 'Converted .each do blocks to Python for loops'
    },

    // Class definitions (including inheritance: class Foo < Bar → class Foo(Bar):)
    {
      pattern: /class\s+(\w+)\s*<\s*(\w+)/g,
      replacement: 'class $1($2):',
      note: 'Converted class inheritance to Python syntax'
    },
    {
      pattern: /class\s+(\w+)\s*$/gm,
      replacement: 'class $1:',
      note: 'Converted class definitions to Python syntax'
    },

    // Class variables (must run BEFORE instance variables so @@var isn't mangled)
    {
      pattern: /@@(\w+)/g,
      replacement: '$1',
      note: 'Class variables (@@var) converted - verify Python class variable semantics'
    },

    // Instance variables
    {
      pattern: /@(\w+)/g,
      replacement: 'self.$1',
      note: 'Converted Ruby instance variables (@var) to Python (self.var)'
    },
    
    // Boolean values
    {
      pattern: /\btrue\b/g,
      replacement: 'True',
      note: 'Converted boolean "true" to "True"'
    },
    {
      pattern: /\bfalse\b/g,
      replacement: 'False',
      note: 'Converted boolean "false" to "False"'
    },
    {
      pattern: /\bnil\b/g,
      replacement: 'None',
      note: 'Converted "nil" to "None"'
    },
    
    // Array/Hash operations: x.length / x.size → len(x)
    {
      pattern: /(\w+)\.length\b/g,
      replacement: 'len($1)',
      note: 'Converted .length to len() function'
    },
    {
      pattern: /(\w+)\.size\b/g,
      replacement: 'len($1)',
      note: 'Converted .size to len() function'
    },
    
    // Conditional statements
    {
      pattern: /\bunless\s+/g,
      replacement: 'if not ',
      note: 'Converted "unless" to "if not"'
    },
    
    // String methods
    {
      pattern: /(\w+)\.gsub\(\/([^/]+)\/,\s*([^)]+)\)/g,
      replacement: 're.sub(r"$2", $3, $1)',
      note: 'Converted .gsub to re.sub() - requires "import re"'
    },
    
    // Range syntax
    {
      pattern: /(\d+)\.\.(\d+)/g,
      replacement: 'range($1, $2 + 1)',
      note: 'Converted Ruby inclusive range to Python range'
    },
    {
      pattern: /(\d+)\.\.\.(\d+)/g,
      replacement: 'range($1, $2)',
      note: 'Converted Ruby exclusive range to Python range'
    }
  ];

  convertedCode = preConvert(convertedCode, conversionNotes);

  // Apply conversions
  conversions.forEach(conv => {
    if (conv.pattern.test(convertedCode)) {
      convertedCode = convertedCode.replace(conv.pattern, conv.replacement);
      conversionNotes.push(conv.note);
    }
  });

  // Advanced pattern detection
  const advancedPatterns = [
    {
      pattern: /\.each_with_index/,
      note: 'Ruby .each_with_index detected - use enumerate() in Python',
      impact: 'medium'
    },
    {
      pattern: /yield/,
      note: 'Ruby yield detected - consider using Python generators or callbacks',
      impact: 'medium'
    },
    {
      pattern: /attr_accessor|attr_reader|attr_writer/,
      note: 'Ruby attr_* detected - use Python @property decorator for getters/setters',
      impact: 'medium'
    },
    {
      pattern: /module\s+\w+/,
      note: 'Ruby module detected - convert to Python class or separate file',
      impact: 'medium'
    },
    {
      pattern: /include\s+\w+/,
      note: 'Ruby include detected - use Python inheritance or composition',
      impact: 'medium'
    },
    {
      pattern: /require\s+/,
      note: 'Ruby require detected - use Python import statements',
      impact: 'low'
    }
  ];

  // Check for advanced patterns
  advancedPatterns.forEach(pattern => {
    if (pattern.pattern.test(rubyCode)) {
      conversionNotes.push(pattern.note);
      if (pattern.impact === 'medium' && confidence === 'high') {
        confidence = 'medium';
      } else if (pattern.impact === 'high') {
        confidence = 'low';
      }
    }
  });

  convertedCode = addBlockColons(convertedCode);

  // Clean up extra whitespace and format
  convertedCode = convertedCode
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
    .replace(/^[\s]*$/gm, '') // Remove empty lines with only whitespace
    .trim();

  // Add Python-specific improvements
  convertedCode = addPythonImports(convertedCode, conversionNotes);
  convertedCode = fixIndentation(convertedCode);

  return {
    convertedCode,
    conversionNotes: [...new Set(conversionNotes)], // Remove duplicates
    confidence
  };
}

function addPythonImports(code: string, notes: string[]): string {
  const imports = [];
  
  // Check if we need common imports
  if (code.includes('range(')) {
    // range is built-in, no import needed
  }
  
  if (code.includes('re.')) {
    imports.push('import re');
  }
  
  if (code.includes('json.')) {
    imports.push('import json');
  }
  
  if (code.includes('datetime.')) {
    imports.push('import datetime');
  }

  if (imports.length > 0) {
    notes.push('Added necessary Python imports');
    return imports.join('\n') + '\n\n' + code;
  }
  
  return code;
}

function fixIndentation(code: string): string {
  // Ruby source is already indented; re-scale its indent unit to Python's 4 spaces.
  const lines = code.split('\n');
  const widths = lines
    .filter((l) => l.trim() !== '')
    .map((l) => l.replace(/\t/g, '  ').match(/^ */)![0].length)
    .filter((w) => w > 0);
  const unit = widths.length ? Math.min(...widths) : 2;
  return lines
    .map((l) => {
      if (l.trim() === '') return '';
      const w = l.replace(/\t/g, '  ').match(/^ */)![0].length;
      return '    '.repeat(Math.round(w / unit)) + l.trim();
    })
    .join('\n');
}

/** Structural rewrites that must run before the simple token replacements. */
function preConvert(code: string, notes: string[]): string {
  const hasClass = /^\s*class\s+\w+/m.test(code);
  let out = code;

  // Method definitions: initialize → __init__, add self/cls, strip ?/! suffixes, add colon.
  out = out.replace(
    /^([ \t]*)def\s+(self\.)?(\w+)([?!])?(?:\s*\((.*?)\))?[ \t]*$/gm,
    (_m, indent: string, isSelf: string | undefined, name: string, suffix: string | undefined, params: string | undefined) => {
      const pyName = name === 'initialize' ? '__init__' : suffix === '?' ? `is_${name}` : name;
      const args = (params ?? '').trim();
      if (isSelf) return `${indent}@classmethod\n${indent}def ${pyName}(cls${args ? ', ' + args : ''}):`;
      if (hasClass && indent.length > 0) return `${indent}def ${pyName}(self${args ? ', ' + args : ''}):`;
      return `${indent}def ${pyName}(${args}):`;
    },
  );
  if (/def __init__/.test(out)) notes.push('Converted initialize to __init__ constructor');

  // Range loops: (1..10).each do |i| → for i in range(1, 11):
  out = out.replace(/\((\w+)\.\.\.(\w+)\)\.each\s+do\s*\|(\w+)\|/g, 'for $3 in range($1, $2):');
  out = out.replace(/\((\w+)\.\.(\w+)\)\.each\s+do\s*\|(\w+)\|/g, 'for $3 in range($1, $2 + 1):');
  // n.times do |i| → for i in range(n):
  out = out.replace(/(\w+)\.times\s+do\s*\|(\w+)\|/g, 'for $2 in range($1):');
  out = out.replace(/(\w+)\.times\s+do\b/g, 'for _ in range($1):');
  // each_with_index do |x, i| → for i, x in enumerate(...):
  out = out.replace(/(\w+)\.each_with_index\s+do\s*\|\s*(\w+)\s*,\s*(\w+)\s*\|/g, 'for $3, $2 in enumerate($1):');
  // while/until
  out = out.replace(/\buntil\s+/g, 'while not ');
  out = out.replace(/\belsif\b/g, 'elif');

  // Regex match: x =~ /re/ → re.search(r"re", x)
  out = out.replace(/(\w+)\s*=~\s*\/((?:\\\/|[^/])+)\/(\w*)/g, (_m, v: string, re: string, flags: string) =>
    `re.search(r"${re}", ${v}${flags.includes('i') ? ', re.IGNORECASE' : ''})`);
  // .match(/re/) and .scan(/re/)
  out = out.replace(/(\w+)\.match\(\/((?:\\\/|[^/])+)\/\)/g, 're.search(r"$2", $1)');
  out = out.replace(/(\w+)\.scan\(\/((?:\\\/|[^/])+)\/\)/g, 're.findall(r"$2", $1)');
  // .sub(/re/, x) (gsub is handled later)
  out = out.replace(/(\w+)\.sub\(\/((?:\\\/|[^/])+)\/,\s*([^)]+)\)/g, 're.sub(r"$2", $3, $1, count=1)');

  // String methods
  const strMethods: [RegExp, string][] = [
    [/\.upcase\b(?!\()/g, '.upper()'],
    [/\.downcase\b(?!\()/g, '.lower()'],
    [/\.capitalize\b(?!\()/g, '.capitalize()'],
    [/\.strip\b(?!\()/g, '.strip()'],
    [/\.reverse\b(?!\()/g, '[::-1]'],
    [/\.to_s\b/g, '.__str__()'],
    [/\.to_i\b/g, '.__int__()'],
    [/\.include\?\(([^)]+)\)/g, '.__contains__($1)'],
    [/\.start_with\?\(/g, '.startswith('],
    [/\.end_with\?\(/g, '.endswith('],
    [/\.split\(\s*\)/g, '.split()'],
  ];
  strMethods.forEach(([re, rep]) => { out = out.replace(re, rep); });

  // Double-quoted strings with interpolation become f-strings
  out = out.replace(/(^|[^\w"])"((?:[^"\\]|\\.)*#\{(?:[^"\\]|\\.)*)"/gm, '$1f"$2"');

  return out;
}

/** Ensure Python block headers end with a colon. */
function addBlockColons(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (/^(if|elif|while|for)\b/.test(t) && !t.endsWith(':')) return line.replace(/\s*$/, ':');
      if (t === 'else') return line.replace(/else\s*$/, 'else:');
      return line;
    })
    .join('\n');
}

export function generateConversionReport(result: ConversionResult, originalFileName: string): string {
  const currentDate = new Date().toLocaleString();
  const newFileName = originalFileName.replace('.rb', '.py');
  
  return `# Ruby to Python Conversion Report

**🕒 Generated on**: ${currentDate}  
**📄 Original File**: ${originalFileName}  
**📄 Converted File**: ${newFileName}  
**🎯 Conversion Confidence**: ${result.confidence.toUpperCase()}

---

## 🔄 Conversion Summary

This report details the automatic conversion of Ruby code to Python. The conversion process handles common syntax differences and provides notes for manual adjustments needed.

**Confidence Level**: ${result.confidence === 'high' ? '✅ High - Most syntax converted successfully' : 
  result.confidence === 'medium' ? '⚠️ Medium - Some manual adjustments required' : 
  '❌ Low - Significant manual review needed'}

---

## 📝 Conversion Notes

The following transformations were applied:

${result.conversionNotes.map(note => `- ${note}`).join('\n')}

---

## 💻 Converted Python Code

\`\`\`python
${result.convertedCode}
\`\`\`

---

## 🚨 Important Manual Review Items

### High Priority:
- **Indentation**: Verify all code blocks are properly indented
- **Method signatures**: Check parameter handling and default values
- **Exception handling**: Convert Ruby rescue blocks to Python try/except
- **String interpolation**: Convert to f-strings where appropriate

### Medium Priority:
- **List/Dict comprehensions**: Ruby blocks may convert better as comprehensions
- **Iterator methods**: Ruby .each, .map, .select may need list comprehensions
- **Module system**: Convert Ruby modules to Python classes or separate files

### Low Priority:
- **Code style**: Apply PEP 8 formatting guidelines
- **Type hints**: Consider adding Python type annotations
- **Documentation**: Convert Ruby-style comments to Python docstrings

---

## 🛠️ Recommended Next Steps

1. **Test the converted code** in a Python environment
2. **Fix any syntax errors** reported by the Python interpreter
3. **Review method calls** and ensure they match Python conventions
4. **Add proper imports** for any external libraries
5. **Consider using Python idioms** for better performance and readability

---

## 📚 Common Ruby to Python Patterns

| Ruby Pattern | Python Equivalent | Notes |
|--------------|------------------|-------|
| \`array.each { \\|x\\| ... }\` | \`for x in array:\` | Use for loops or comprehensions |
| \`hash.each_key\` | \`for key in dict.keys():\` | Dictionary iteration |
| \`string.gsub(pattern, replacement)\` | \`re.sub(pattern, replacement, string)\` | Requires \`import re\` |
| \`array << item\` | \`array.append(item)\` | List operations |
| \`array.length\` | \`len(array)\` | Built-in function |

---

*🤖 Generated by Ruby to Python Converter - Please review all conversions manually*`;
}