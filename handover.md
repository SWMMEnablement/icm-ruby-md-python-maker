# 📦 Handover Document: GitHub File Summarizer

**App Name**: GitHub File Summarizer  
**Published URL**: https://icm-ruby-md-python-maker.lovable.app  
**Date**: 2026-02-12  
**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## 📋 Table of Contents

1. [App Overview](#app-overview)
2. [Architecture & File Structure](#architecture--file-structure)
3. [Core Features](#core-features)
4. [Component Breakdown](#component-breakdown)
5. [Utility Modules](#utility-modules)
6. [Design System](#design-system)
7. [Dependencies](#dependencies)
8. [Configuration Files](#configuration-files)
9. [How to Run Locally](#how-to-run-locally)
10. [Environment Variables & Secrets](#environment-variables--secrets)
11. [Deployment Instructions](#deployment-instructions)
12. [Testing Strategies](#testing-strategies)
13. [Performance & Optimization](#performance--optimization)
14. [Browser Compatibility](#browser-compatibility)
15. [Accessibility (a11y)](#accessibility-a11y)
16. [Troubleshooting & FAQ](#troubleshooting--faq)
17. [Porting to Another Project](#porting-to-another-project)
18. [Known Limitations & TODOs](#known-limitations--todos)

---

## 📖 App Overview

**GitHub File Summarizer** is a client-side web application that:

1. **Accepts code file uploads** (drag & drop or file picker) supporting 20+ programming languages
2. **Generates comprehensive Markdown analysis reports** including code metrics, security analysis, dependency mapping, architecture detection, and recommendations
3. **Converts Ruby (.rb) files to Python (.py)** with syntax transformation, indentation fixing, and a detailed conversion report
4. **Exports results** as downloadable `.md` or `.py` files (supports both File System Access API and fallback blob downloads)

All processing is **100% client-side** — no backend, no API calls, no data leaves the browser.

---

## 🏗️ Architecture & File Structure

```
src/
├── assets/
│   └── hero-image.jpg              # Hero background image
├── components/
│   ├── ConversionResults.tsx        # Python conversion results display
│   ├── DownloadActions.tsx          # Download, copy, convert action buttons
│   ├── FileUploadZone.tsx           # Drag & drop file upload component
│   ├── SourceCodeViewer.tsx         # Collapsible tabbed source code viewer
│   ├── SummaryDisplay.tsx           # Results orchestrator (composes sub-components)
│   └── ui/                          # shadcn/ui component library (60+ components)
│       ├── button.tsx               # Custom variants: hero, upload
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── toast.tsx / toaster.tsx
│       └── ... (full shadcn/ui suite)
├── hooks/
│   ├── use-mobile.tsx               # Mobile detection hook
│   └── use-toast.ts                 # Toast notification hook
├── lib/
│   └── utils.ts                     # cn() utility (clsx + tailwind-merge)
├── pages/
│   ├── Index.tsx                    # Main page (hero + upload + results)
│   └── NotFound.tsx                 # 404 page
├── utils/
│   ├── fileSave.ts                  # Shared file save/download utility
│   ├── fileSummary.ts               # Core analysis engine (655 lines)
│   └── rubyToPython.ts              # Ruby-to-Python converter (350 lines)
├── App.tsx                          # Root component with routing
├── App.css                          # Additional styles
├── index.css                        # Design system (CSS variables, gradients, shadows)
├── main.tsx                         # Entry point
└── vite-env.d.ts                    # Vite type declarations
```

---

## ⚙️ Core Features

### 1. File Upload (`FileUploadZone.tsx`)

- **Library**: `react-dropzone` v14
- **Supported formats**: `.py`, `.js`, `.ts`, `.tsx`, `.jsx`, `.java`, `.rb`, `.go`, `.php`, `.cpp`, `.c`, `.h`, `.css`, `.html`, `.xml`, `.json`, `.yml`, `.yaml`, `.sh`, `.bash`, `.md`, `.txt`
- **Max file size**: 5MB
- **Behavior**: Single file upload, drag & drop or click-to-browse
- **Visual states**: Default, drag active, processing (spinner), error

### 2. File Analysis Engine (`fileSummary.ts`)

Generates a structured Markdown report with:

| Section | Description |
|---------|-------------|
| **Executive Summary** | Auto-generated overview with complexity and style assessment |
| **Code Metrics** | Line counts (code/comment/blank), function/class/conditional/loop counts, avg/max line length |
| **Documentation Quality** | Comment ratio with quality rating (Excellent/Good/Fair/Needs Improvement) |
| **Architecture & Structure** | Pattern detection (OOP, functional, procedural) |
| **Functions & Methods** | Count and modularization assessment |
| **Classes & Types** | OOP hierarchy analysis |
| **Dependencies** | External vs internal import extraction via regex |
| **Security Analysis** | XSS risk, SQL injection, hardcoded password detection |
| **Code Quality** | Naming convention, complexity rating, maintainability rating |
| **Purpose & Functionality** | Language-specific purpose guessing |
| **Feature Detection** | Async/await, React hooks, testing, API integration detection |
| **Recommendations** | Auto-generated improvement suggestions |
| **Refactoring Tips** | Based on metrics thresholds |
| **Technical Notes** | Encoding, line endings, reading time, file hash |
| **Full Source Code** | Truncated at 1500 chars |

**Key functions**:
- `generateFileSummary({ content, fileName, fileExtension, lines })` → returns Markdown string
- `getCodeLanguage(extension)` → maps 30+ extensions to language names
- `getFileTypeDescription(extension)` → human-readable file type
- `getPurposeGuess(extension)` → language-specific purpose description
- `performDetailedAnalysis(content, extension, lines)` → architecture, functions, classes, features
- `calculateCodeMetrics(content, extension, lines)` → all numeric metrics
- `performSecurityAnalysis(content, extension)` → security issue detection
- `analyzeDependencies(content, extension)` → import/require extraction
- `downloadFile(content, filename)` → blob download utility

### 3. Ruby-to-Python Converter (`rubyToPython.ts`)

**Syntax transformations** (applied via regex):

| Ruby | Python | Notes |
|------|--------|-------|
| `def method(args)` | `def method(args):` | Method definitions |
| `end` | *(removed)* | Python uses indentation |
| `#{var}` | `{var}` | String interpolation → f-string format |
| `puts text` | `print(text` | Print statements (needs closing paren) |
| `.each do \|x\|` | `# for x in` | Block iteration (needs manual review) |
| `class Foo < Bar` | `class Foo(Bar):` | Class inheritance |
| `@var` | `self.var` | Instance variables |
| `@@var` | `var` | Class variables (needs manual review) |
| `true/false/nil` | `True/False/None` | Boolean/null literals |
| `unless` | `if not` | Negated conditionals |
| `.gsub(` | `.replace(` | String replacement |
| `1..10` | `range(1, 11)` | Inclusive range |
| `1...10` | `range(1, 10)` | Exclusive range |

**Advanced pattern detection** (affects confidence level):
- `.each_with_index` → suggests `enumerate()`
- `yield` → suggests generators/callbacks
- `attr_accessor/reader/writer` → suggests `@property`
- `module` → suggests class or separate file
- `include` → suggests inheritance/composition
- `require` → suggests import

**Post-processing**:
- `addPythonImports()` — adds `import re`, `import json`, `import datetime` if needed
- `fixIndentation()` — applies 4-space Python indentation based on colon-terminated lines

**Output**: `ConversionResult { convertedCode, conversionNotes, confidence: 'high' | 'medium' | 'low' }`

**Report generation**: `generateConversionReport(result, fileName)` → detailed Markdown with:
- Confidence assessment
- All conversion notes
- Full converted code
- Manual review checklist (high/medium/low priority)
- Common Ruby-to-Python pattern reference table

### 4. Results Display (Modular Architecture)

The results view is composed of four components:

- **`SummaryDisplay.tsx`** — Orchestrator component (~95 lines). Manages conversion state and composes sub-components.
- **`DownloadActions.tsx`** — Download, copy, and convert buttons + editable filename field. Uses `fileSave.ts` utility.
- **`ConversionResults.tsx`** — Displays converted Python code and conversion report side-by-side with download buttons.
- **`SourceCodeViewer.tsx`** — Collapsible tabbed viewer showing app internal source code.

**Actions available**:
- **Download Summary** — saves `.md` file (File System Access API with fallback)
- **Copy Summary** — clipboard copy with toast feedback
- **Convert to Python** — (Ruby files only) triggers conversion + shows results
- **Download Python Code** — saves `.py` file
- **Download Conversion Report** — saves conversion report `.md`
- **Analyze Another** — resets state for new file
- **Show/Hide Source Code** — expandable section showing app internals in 4 tabs

**Editable field**: Markdown filename can be customized before download.

### 5. File Save Utility (`fileSave.ts`)

Centralized file save logic shared by `DownloadActions` and `ConversionResults`:
- Uses File System Access API (`showSaveFilePicker`) when available (Chrome/Edge)
- Falls back to blob URL + `<a>` download for other browsers
- Handles `AbortError` gracefully when user cancels save dialog

---

## 🧩 Component Breakdown

### `App.tsx`
```
QueryClientProvider → TooltipProvider → Toaster → Sonner → BrowserRouter
  Routes:
    / → Index
    * → NotFound
```

### `Index.tsx` (Main Page)
- **State**: `selectedFile`, `fileContent`, `summary`, `isProcessing`
- **Flow**: Hero section → Upload zone → (on file select) → Processing delay (1.5s UX) → SummaryDisplay
- **Hero**: Gradient background, floating icon animation, 3 feature highlights
- **Features grid**: 3 cards (Smart Analysis, Beautiful Formatting, Ruby to Python)

### `FileUploadZone.tsx`
- Props: `onFileSelect(file: File)`, `isProcessing?: boolean`
- Uses `react-dropzone` with MIME type + extension accept list
- Error handling for rejected files and oversized files
- Visual states with Tailwind transitions

### `SummaryDisplay.tsx` (607 lines — candidate for refactoring)
- Props: `summary`, `fileName`, `fileContent`, `onReset()`
- Manages conversion state, copy state, filename editing
- Contains inline source code display (4 tabs showing app internals)
- Uses File System Access API (`showSaveFilePicker`) with blob fallback

### `button.tsx` (Custom Variants)
Two custom button variants added to shadcn/ui:
- `hero` — gradient background, glow animation, scale-on-hover
- `upload` — gradient with dashed border

---

## 🎨 Design System

### Color Palette (Orange & Blue theme)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--primary` | `25 95% 55%` | Orange — buttons, accents, ring |
| `--primary-glow` | `35 100% 70%` | Light orange — gradient endpoint |
| `--secondary` | `210 100% 60%` | Blue — secondary buttons |
| `--accent` | `200 100% 55%` | Cyan-blue — accent elements |
| `--success` | `120 60% 50%` | Green — success states |
| `--warning` | `35 100% 60%` | Amber — warnings |
| `--info` | `210 100% 60%` | Blue — info states |
| `--destructive` | `0 70% 55%` | Red — errors |
| `--background` | `210 15% 97%` | Light blue-gray background |
| `--foreground` | `210 20% 15%` | Dark blue-gray text |
| `--muted` | `210 10% 95%` | Subtle background |
| `--muted-foreground` | `210 10% 45%` | Subdued text |

### Gradients

| Name | Definition |
|------|------------|
| `--gradient-primary` | 135deg, primary → primary-glow (orange gradient) |
| `--gradient-hero` | 135deg, orange → blue → cyan |
| `--gradient-rainbow` | 90deg, orange → gold → blue → cyan → indigo → purple |
| `--gradient-success` | 135deg, green → teal |
| `--gradient-warning` | 135deg, amber → gold |
| `--gradient-info` | 135deg, blue → cyan |

### Shadows

| Name | Usage |
|------|-------|
| `shadow-elegant` | Primary-tinted drop shadow |
| `shadow-colorful` | Blue-tinted glow shadow |
| `shadow-soft` | Subtle neutral shadow |

### Animations

| Name | Effect |
|------|--------|
| `animate-float` | Vertical bobbing (3s loop) |
| `animate-glow` | Opacity pulse (2s loop) |
| `animate-shimmer` | Horizontal slide (2s loop) |

### Dark Mode
Defined in `.dark` class in `index.css` — standard shadcn/ui dark theme values.

---

## 📦 Dependencies

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.30.1 | Client-side routing |
| `typescript` | (dev) | Type safety |
| `vite` | (dev) | Build tool & dev server |

### UI
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | (dev) | Utility-first CSS |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities |
| `tailwind-merge` | ^2.6.0 | Class deduplication |
| `class-variance-authority` | ^0.7.1 | Component variant system |
| `clsx` | ^2.1.1 | Conditional classnames |
| `lucide-react` | ^0.462.0 | Icon library |
| `sonner` | ^1.7.4 | Toast notifications (alt) |

### shadcn/ui (Radix primitives)
Full suite installed: accordion, alert-dialog, avatar, badge, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip.

### Functional
| Package | Version | Purpose |
|---------|---------|---------|
| `react-dropzone` | ^14.3.8 | File drag & drop |
| `react-hook-form` | ^7.61.1 | Form management |
| `@hookform/resolvers` | ^3.10.0 | Form validation |
| `zod` | ^3.25.76 | Schema validation |
| `@tanstack/react-query` | ^5.83.0 | Data fetching/caching |
| `date-fns` | ^3.6.0 | Date utilities |
| `recharts` | ^2.15.4 | Charting library |
| `next-themes` | ^0.3.0 | Theme switching |

---

## ⚙️ Configuration Files

### `vite.config.ts`
- Standard Vite + React setup
- Path alias: `@` → `./src`

### `tailwind.config.ts`
- Extended color palette mapping all CSS variables
- Custom keyframes: float, glow, shimmer
- Custom background images mapping gradient CSS variables
- Custom box shadows mapping shadow CSS variables
- Container: centered, 2rem padding, max 1400px

### `tsconfig.app.json`
- Target: ES2020
- Path alias: `@/*` → `./src/*`
- Strict mode enabled

### `components.json` (shadcn/ui)
- Style: default
- Base color: slate
- CSS variables: enabled
- Aliases configured for `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

---

## 🚀 How to Run Locally

```bash
# Clone the repository
git clone <repo-url>
cd <project-dir>

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Environment Variables & Secrets

This app is **100% client-side** with no backend, so there are **no environment variables required** for core functionality.

### Vite Environment Variable Support

If you extend the app with API integrations, Vite supports `.env` files:

| File | Purpose | Loaded When |
|------|---------|-------------|
| `.env` | Default variables | Always |
| `.env.local` | Local overrides (gitignored) | Always |
| `.env.development` | Dev-only variables | `npm run dev` |
| `.env.production` | Prod-only variables | `npm run build` |

**Usage convention**:
```bash
# .env.local (example — not currently used)
VITE_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.example.com
```

```tsx
// Access in code (must be prefixed with VITE_)
const apiKey = import.meta.env.VITE_API_KEY;
```

**Security note**: `VITE_`-prefixed variables are **embedded in the client bundle** and visible to users. Never put private API keys or secrets in `.env` files for Vite projects.

### Lovable-Specific

When deployed via Lovable:
- No `.env` files needed — Lovable manages the build environment
- If you add backend features via Lovable Cloud, secrets are managed through the Lovable dashboard (Settings → Secrets)
- The `lovable-tagger` dev dependency is automatically configured and requires no setup

---

## 🚢 Deployment Instructions

### Option 1: Deploy via Lovable (Recommended)

1. Open the project in [Lovable](https://lovable.dev/projects/dc9ad427-d8b0-42ef-a62b-18037e9fb70c)
2. Click **Share → Publish**
3. Your app is live at: `https://icm-ruby-md-python-maker.lovable.app`

**Custom domain**: Navigate to Project → Settings → Domains → Connect Domain. See [docs](https://docs.lovable.dev/tips-tricks/custom-domain).

### Option 2: Deploy to Netlify

```bash
# Build the project
npm run build

# Output is in dist/ — deploy this folder
# Via Netlify CLI:
npx netlify-cli deploy --prod --dir=dist
```

**Netlify config** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel config** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option 4: Deploy to GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Set base in vite.config.ts:
# base: '/your-repo-name/'

npm run deploy
```

### Option 5: Static File Hosting (Any Provider)

```bash
npm run build
# Upload the contents of dist/ to any static hosting:
# AWS S3 + CloudFront, Firebase Hosting, Cloudflare Pages, etc.
```

**Important**: Since this is a SPA with client-side routing, configure your hosting to redirect all routes to `index.html` (see redirects above).

### Build Output

| Metric | Approximate Value |
|--------|-------------------|
| Build time | ~5-10 seconds |
| Output directory | `dist/` |
| Bundle size (gzipped) | ~150-200KB (depends on tree-shaking) |
| Assets | JS chunks + CSS + hero image |

### Pre-deployment Checklist

- [ ] `npm run build` completes without errors
- [ ] `npm run preview` works correctly at `http://localhost:4173`
- [ ] All file upload formats work in production build
- [ ] Download functionality works (File System Access API + fallback)
- [ ] Ruby-to-Python conversion produces correct output
- [ ] Mobile responsive layout verified
- [ ] `robots.txt` and `favicon.ico` present in `public/`

---

## 🧪 Testing Strategies

### Current State

The project **does not currently have automated tests**. Below is a comprehensive testing strategy for adding tests.

### Recommended Test Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**`vitest.config.ts`**:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

**`src/test/setup.ts`**:
```typescript
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
```

### Unit Tests (Priority: High)

The pure utility functions are ideal candidates for unit testing:

**`src/utils/__tests__/fileSummary.test.ts`**:
```typescript
import { describe, it, expect } from "vitest";
import { generateFileSummary, getCodeLanguage, getFileTypeDescription } from "../fileSummary";

describe("getCodeLanguage", () => {
  it("maps .py to Python", () => expect(getCodeLanguage(".py")).toBe("Python"));
  it("maps .tsx to TypeScript React", () => expect(getCodeLanguage(".tsx")).toBe("TypeScript React"));
  it("handles unknown extensions", () => expect(getCodeLanguage(".xyz")).toBe("Unknown"));
});

describe("generateFileSummary", () => {
  it("generates markdown for a simple Python file", () => {
    const result = generateFileSummary({
      content: 'def hello():\n    print("world")\n',
      fileName: "hello.py",
      fileExtension: ".py",
      lines: ['def hello():', '    print("world")', ''],
    });
    expect(result).toContain("# 📄 File Summary");
    expect(result).toContain("hello.py");
    expect(result).toContain("Python");
  });
});
```

**`src/utils/__tests__/rubyToPython.test.ts`**:
```typescript
import { describe, it, expect } from "vitest";
import { convertRubyToPython } from "../rubyToPython";

describe("convertRubyToPython", () => {
  it("converts puts to print", () => {
    const result = convertRubyToPython('puts "hello"');
    expect(result.convertedCode).toContain("print");
  });

  it("converts true/false/nil to Python equivalents", () => {
    const result = convertRubyToPython("x = true\ny = false\nz = nil");
    expect(result.convertedCode).toContain("True");
    expect(result.convertedCode).toContain("False");
    expect(result.convertedCode).toContain("None");
  });

  it("returns high confidence for simple Ruby", () => {
    const result = convertRubyToPython('puts "hello"');
    expect(result.confidence).toBe("high");
  });

  it("returns lower confidence for complex Ruby", () => {
    const result = convertRubyToPython("module Foo\n  include Bar\n  yield block\nend");
    expect(["medium", "low"]).toContain(result.confidence);
  });
});
```

### Component Tests (Priority: Medium)

```typescript
// src/components/__tests__/FileUploadZone.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileUploadZone } from "../FileUploadZone";

describe("FileUploadZone", () => {
  it("renders upload prompt", () => {
    render(<FileUploadZone onFileSelect={() => {}} />);
    expect(screen.getByText(/drag/i)).toBeInTheDocument();
  });

  it("shows processing state", () => {
    render(<FileUploadZone onFileSelect={() => {}} isProcessing={true} />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });
});
```

### Integration Tests (Priority: Medium)

Test the full flow: file upload → analysis → display:

```typescript
// src/__tests__/integration.test.tsx
import { describe, it, expect } from "vitest";
import { generateFileSummary } from "../utils/fileSummary";
import { convertRubyToPython, generateConversionReport } from "../utils/rubyToPython";

describe("Full analysis pipeline", () => {
  it("analyzes a JavaScript file end-to-end", () => {
    const content = `
      import React from 'react';
      const App = () => <div>Hello</div>;
      export default App;
    `;
    const summary = generateFileSummary({
      content,
      fileName: "App.jsx",
      fileExtension: ".jsx",
      lines: content.split("\n"),
    });
    expect(summary).toContain("React");
    expect(summary).toContain("Dependencies");
  });

  it("converts Ruby and generates report", () => {
    const ruby = 'class Dog < Animal\n  def bark\n    puts "Woof!"\n  end\nend';
    const result = convertRubyToPython(ruby);
    const report = generateConversionReport(result, "dog.rb");
    expect(report).toContain("Conversion Report");
    expect(result.convertedCode).toContain("class Dog(Animal):");
  });
});
```

### E2E Testing (Priority: Low)

For full browser-based testing, use Playwright or Cypress:

```bash
npm install -D @playwright/test
```

```typescript
// e2e/upload-flow.spec.ts
import { test, expect } from "@playwright/test";

test("upload and analyze a file", async ({ page }) => {
  await page.goto("/");
  
  // Upload a file
  const fileChooser = await page.waitForEvent("filechooser");
  await page.click('[data-testid="upload-zone"]');
  await fileChooser.setFiles("./test-fixtures/sample.py");
  
  // Wait for analysis
  await expect(page.locator("text=File Summary")).toBeVisible({ timeout: 5000 });
  
  // Verify download button exists
  await expect(page.locator("text=Download Summary")).toBeVisible();
});
```

### Manual Testing Checklist

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Upload .py file | Drag & drop a Python file | Summary generated with Python-specific analysis |
| Upload .rb file | Upload a Ruby file | Summary + "Convert to Python" button visible |
| Ruby conversion | Click "Convert to Python" | Converted code displayed with confidence level |
| Download .md | Click "Download Summary" | `.md` file downloads with correct content |
| Download .py | Convert Ruby → Click "Download Python" | `.py` file downloads |
| Copy to clipboard | Click "Copy Summary" | Toast confirms copy, clipboard has content |
| File too large | Upload >5MB file | Error message displayed |
| Invalid file type | Upload .exe or .zip | Rejection with error message |
| Edit filename | Change filename field, download | File saves with custom name |
| Analyze another | Click "Analyze Another File" | State resets, upload zone reappears |
| Mobile layout | Test on 375px viewport | All elements accessible and properly stacked |
| Dark mode | Toggle system dark mode | UI adapts (partial — see known limitations) |

### Running Tests

```bash
# Run all tests
npx vitest

# Run in watch mode
npx vitest --watch

# Run with coverage
npx vitest --coverage

# Run specific test file
npx vitest src/utils/__tests__/fileSummary.test.ts
```

---

## ⚡ Performance & Optimization

### Current Performance Profile

| Metric | Status | Notes |
|--------|--------|-------|
| Initial load | ✅ Fast | Static SPA, no API calls |
| File analysis | ✅ Fast | Client-side regex, <100ms for typical files |
| Large files (>1MB) | ⚠️ Moderate | Regex operations may slow down |
| Bundle size | ⚠️ Could improve | Many unused shadcn/ui components installed |

### Optimization Opportunities

1. **Remove unused dependencies** — Calendar, carousel, chart, command, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, sheet, sidebar, skeleton, slider, switch, toggle, toggle-group are installed but unused. Removing them reduces bundle size.

2. **Lazy load heavy components**:
   ```tsx
   const SummaryDisplay = React.lazy(() => import('./components/SummaryDisplay'));
   ```

3. **Web Workers for analysis** — Move `generateFileSummary()` to a Web Worker to prevent UI thread blocking on large files:
   ```typescript
   // worker.ts
   self.onmessage = (e) => {
     const summary = generateFileSummary(e.data);
     self.postMessage(summary);
   };
   ```

4. **Memoize expensive computations** — Wrap analysis results in `useMemo` if re-renders occur.

5. **Image optimization** — `hero-image.jpg` should be converted to WebP and served with `<picture>` for smaller payloads.

---

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 80+ | Full support including File System Access API |
| Firefox | 78+ | Blob download fallback (no File System Access API) |
| Safari | 14+ | Blob download fallback |
| Edge | 80+ | Full support (Chromium-based) |
| Mobile Chrome | 80+ | Works, touch drag-drop limited |
| Mobile Safari | 14+ | File picker works, no drag-drop |

### Feature Detection

| Feature | Browsers | Fallback |
|---------|----------|----------|
| File System Access API (`showSaveFilePicker`) | Chrome/Edge 86+ | Blob URL + `<a>` download |
| Clipboard API (`navigator.clipboard`) | All modern | Toast error message |
| Drag & Drop API | Desktop browsers | Click-to-browse file picker |
| CSS `backdrop-filter` | All modern | Graceful degradation |

### Known Browser Issues

- **Safari**: File System Access API not supported — always uses blob download fallback
- **Firefox**: Same as Safari for downloads
- **Mobile**: Drag & drop not available — file picker input is the primary upload method
- **IE11**: Not supported (ES2020 target, no polyfills)

---

## ♿ Accessibility (a11y)

### Current State

| Area | Status | Notes |
|------|--------|-------|
| Keyboard navigation | ✅ Good | shadcn/ui components have built-in keyboard support |
| Screen reader labels | ⚠️ Partial | Upload zone needs `aria-label`, some buttons lack descriptions |
| Color contrast | ✅ Good | Orange/blue palette meets WCAG AA |
| Focus indicators | ✅ Good | Tailwind `ring` utilities provide visible focus |
| Motion preferences | ❌ Missing | Animations don't respect `prefers-reduced-motion` |
| Semantic HTML | ✅ Good | Proper heading hierarchy, landmark regions |

### Recommended Improvements

1. Add `aria-label` to the file upload zone
2. Add `prefers-reduced-motion` media query to disable animations
3. Add `aria-live="polite"` region for analysis status updates
4. Ensure all icon-only buttons have `aria-label` attributes
5. Add skip-to-content link for keyboard users

---

## 🔧 Troubleshooting & FAQ

### Common Issues

**Q: File upload doesn't work / nothing happens on drop**
- Ensure file extension is in the supported list (see Core Features § File Upload)
- Check file size is under 5MB
- On mobile, use the tap-to-browse method instead of drag & drop

**Q: Download doesn't trigger a save dialog**
- File System Access API is Chrome/Edge only. Other browsers auto-download to the default downloads folder.
- If using an ad blocker or privacy extension, it may block blob URL downloads

**Q: "Convert to Python" button doesn't appear**
- This button only appears for `.rb` (Ruby) files. Upload a `.rb` file to see it.

**Q: The analysis report seems inaccurate**
- The analysis engine uses regex-based heuristics, not an AST parser. Complex code patterns (nested functions, metaprogramming, DSLs) may be miscounted.
- Security analysis is intentionally basic — it's a starting point, not a replacement for tools like ESLint or Semgrep.

**Q: Build fails with TypeScript errors**
- Run `npx tsc --noEmit` to see all type errors
- Ensure `tsconfig.app.json` has the correct path aliases
- Check that all imported shadcn/ui components exist in `src/components/ui/`

**Q: Styles look broken after updating Tailwind**
- Verify `tailwind.config.ts` still has the custom theme extensions
- Check that `index.css` CSS variables are intact
- Run `npm run build` to verify PostCSS processing

**Q: Hot reload isn't working in development**
- Restart the dev server: `npm run dev`
- Clear browser cache and Vite cache: `rm -rf node_modules/.vite`

### Error Codes & Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "File type not supported" | Uploaded file extension not in accept list | Use a supported file type |
| "File is too large" | File exceeds 5MB limit | Split file or increase limit in `FileUploadZone.tsx` |
| "Failed to copy" | Clipboard API blocked | Check browser permissions, use HTTPS |
| Build: "Module not found" | Missing dependency or import path | Run `npm install`, check import paths |

---

## 🔄 Porting to Another Project

### Minimum files needed for the core feature:

```
# Analysis engine (copy as-is)
src/utils/fileSummary.ts          # 655 lines — full analysis engine
src/utils/rubyToPython.ts         # 350 lines — Ruby→Python converter

# Components (adapt to your UI framework)
src/components/FileUploadZone.tsx  # Requires: react-dropzone, lucide-react, shadcn button
src/components/SummaryDisplay.tsx  # Requires: shadcn card/tabs/input/button, lucide-react

# Required shadcn/ui components
src/components/ui/button.tsx       # Has custom variants (hero, upload)
src/components/ui/card.tsx
src/components/ui/tabs.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
src/hooks/use-toast.ts

# Design system
src/index.css                      # CSS variables, gradients, shadows, animations
tailwind.config.ts                 # Extended theme config
```

### Steps to port:

1. **Copy `fileSummary.ts` and `rubyToPython.ts`** — these are pure utility functions with zero dependencies. They work in any TypeScript/JavaScript project.

2. **Install required packages**:
   ```bash
   npm install react-dropzone lucide-react class-variance-authority clsx tailwind-merge
   ```

3. **Copy the design system** from `index.css` (CSS variables section) and merge into your project's global styles.

4. **Copy Tailwind config extensions** (colors, animations, gradients, shadows) from `tailwind.config.ts`.

5. **Copy/adapt components** — `FileUploadZone` and `SummaryDisplay` can be adapted to any React project. The main integration point is:
   ```tsx
   // Read file → generate summary
   const content = await file.text();
   const summary = generateFileSummary({ content, fileName, fileExtension, lines });
   
   // Optional: convert Ruby to Python
   const result = convertRubyToPython(fileContent);
   const report = generateConversionReport(result, fileName);
   ```

6. **If not using shadcn/ui**, replace `Button`, `Card`, `Tabs`, `Input`, `Label` with your own UI components. The logic is independent of the UI layer.

### API surface (for integration):

```typescript
// File Analysis
import { generateFileSummary, downloadFile } from './utils/fileSummary';

generateFileSummary({
  content: string,      // Raw file content
  fileName: string,     // e.g., "app.py"
  fileExtension: string, // e.g., ".py"
  lines: string[]       // content.split('\n')
}): string              // Returns Markdown report

downloadFile(content: string, filename: string): void  // Triggers browser download

// Ruby to Python
import { convertRubyToPython, generateConversionReport } from './utils/rubyToPython';

convertRubyToPython(rubyCode: string): {
  convertedCode: string,
  conversionNotes: string[],
  confidence: 'high' | 'medium' | 'low'
}

generateConversionReport(result: ConversionResult, originalFileName: string): string
```

---

## ⚠️ Known Limitations & TODOs

1. **`SummaryDisplay.tsx` is 607 lines** — should be refactored into smaller components (e.g., `DownloadActions`, `ConversionResults`, `SourceCodeViewer`)
2. **Ruby-to-Python converter is regex-based** — cannot handle complex Ruby metaprogramming, DSLs, or Proc/Lambda syntax reliably
3. **Security analysis is basic** — only checks for `eval()`, `innerHTML`, SQL patterns, and hardcoded passwords
4. **No backend** — all processing is client-side; large files may cause browser slowdown
5. **File size limit is 5MB** — enforced in `FileUploadZone`
6. **Source code preview truncated at 1500 chars** in the analysis report
7. **Dark mode colors** use default shadcn/ui values and don't fully match the orange/blue light theme
8. **Some shadcn/ui packages are installed but unused** (calendar, carousel, chart, etc.) — can be removed to reduce bundle size
9. **`puts` conversion** adds `print(` but doesn't add closing `)` — noted in conversion notes
10. **Regex-based function/class counting** may double-count in some cases

---

## 📊 Bundle Impact

The core utilities (`fileSummary.ts` + `rubyToPython.ts`) are approximately **1,000 lines** of pure TypeScript with **zero external dependencies**. They can be tree-shaken independently.

The UI layer adds `react-dropzone` (~15KB gzipped) and `lucide-react` icons as the only non-shadcn dependencies.

---

*Generated for project handover — GitHub File Summarizer v1.0*
