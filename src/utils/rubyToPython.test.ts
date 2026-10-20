import { describe, it, expect } from 'vitest';
import { convertRubyToPython } from './rubyToPython';
import { suggestTestFileName } from './testFileName';

const py = (ruby: string) => convertRubyToPython(ruby).convertedCode;

describe('inheritance', () => {
  it('converts class Foo < Bar to class Foo(Bar):', () => {
    expect(py('class Dog < Animal\n  def speak\n    puts "Woof"\n  end\nend')).toBe(
      'class Dog(Animal):\n    def speak(self):\n        print("Woof")',
    );
  });
  it('converts initialize to __init__ with self and params', () => {
    expect(py('class User\n  def initialize(name, age)\n    @name = name\n  end\nend')).toContain(
      'def __init__(self, name, age):\n        self.name = name',
    );
  });
  it('turns def self.x into a classmethod', () => {
    expect(py('class A\n  def self.build(x)\n  end\nend')).toContain('@classmethod\n    def build(cls, x):');
  });
});

describe('class variables', () => {
  it('converts @@var without producing self.@ or self.self', () => {
    const out = py('class Counter\n  @@count = 0\n  def initialize\n    @name = "x"\n  end\nend');
    expect(out).toContain('    count = 0');
    expect(out).toContain('self.name = "x"');
    expect(out).not.toMatch(/@|self\.self/);
  });
});

describe('loops', () => {
  it('converts .each do |x| to a for loop', () => {
    expect(py('items.each do |item|\n  puts item\nend')).toBe('for item in items:\n    print(item)');
  });
  it('converts inclusive range each', () => {
    expect(py('(1..10).each do |i|\n  puts i\nend')).toContain('for i in range(1, 10 + 1):');
  });
  it('converts exclusive range each', () => {
    expect(py('(0...5).each do |i|\nend')).toContain('for i in range(0, 5):');
  });
  it('converts n.times do |i|', () => {
    expect(py('3.times do |i|\n  puts i\nend')).toContain('for i in range(3):');
  });
  it('adds a colon to for ... in range', () => {
    expect(py('for i in 1...5\n  puts i\nend')).toContain('for i in range(1, 5):');
  });
  it('converts each_with_index to enumerate', () => {
    expect(py('list.each_with_index do |x, i|\nend')).toContain('for i, x in enumerate(list):');
  });
});

describe('string methods', () => {
  it('makes interpolated strings f-strings', () => {
    expect(py('puts "Hello #{name}"')).toBe('print(f"Hello {name}")');
  });
  it('leaves plain strings alone', () => {
    expect(py('puts "Hello"')).toBe('print("Hello")');
  });
  it('converts upcase/downcase/strip and length', () => {
    expect(py('a = s.upcase\nb = s.downcase.strip\nc = s.length')).toBe(
      'a = s.upper()\nb = s.lower().strip()\nc = len(s)',
    );
  });
  it('converts start_with? / end_with?', () => {
    expect(py('x = s.start_with?("a")')).toBe('x = s.startswith("a")');
  });
});

describe('regex literals', () => {
  it('converts gsub(/re/, x) to re.sub and imports re', () => {
    expect(py('s = text.gsub(/\\d+/, "N")')).toBe('import re\n\ns = re.sub(r"\\d+", "N", text)');
  });
  it('converts =~ /re/ to re.search with a colon', () => {
    expect(py('if text =~ /foo/\n  puts "m"\nend')).toContain('if re.search(r"foo", text):\n    print("m")');
  });
  it('passes the i flag as re.IGNORECASE', () => {
    expect(py('if s =~ /abc/i\nend')).toContain('re.search(r"abc", s, re.IGNORECASE):');
  });
  it('converts .scan(/re/) to re.findall', () => {
    expect(py('m = s.scan(/\\w+/)')).toContain('m = re.findall(r"\\w+", s)');
  });
});

describe('booleans and conditionals', () => {
  it('converts true/false/nil, unless and elsif', () => {
    expect(py('unless x == nil\n  y = true\nelsif z\n  y = false\nelse\nend')).toBe(
      'if not x == None:\n    y = True\nelif z:\n    y = False\nelse:',
    );
  });
});

describe('suggestTestFileName', () => {
  it('uses language conventions', () => {
    expect(suggestTestFileName('calc.py')).toBe('test_calc.py');
    expect(suggestTestFileName('user.rb')).toBe('user_spec.rb');
    expect(suggestTestFileName('util.ts')).toBe('util.test.ts');
    expect(suggestTestFileName('main.go')).toBe('main_test.go');
  });
});
