"use client";

import React, { useEffect, useState, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  problemId: string;
  readOnly?: boolean;
}

export default function CodeEditor({ value, language, onChange, problemId, readOnly = false }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState(value);
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  // Configure custom theme
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("placement-os-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#050505", // Matching our tailwind background
          "editor.lineHighlightBackground": "#ffffff0a",
        },
      });
      monaco.editor.setTheme("placement-os-dark");
    }
  }, [monaco]);

  // Initialization
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorChange = (newValue: string | undefined) => {
    setCode(newValue || "");
    onChange(newValue);
    if (newValue) {
      localStorage.setItem(`code-${problemId}-${language}`, newValue);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-zinc-500 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
        <p className="text-sm">Initializing Secure Environment...</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="placement-os-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "var(--font-geist-mono), monospace",
        lineHeight: 24,
        padding: { top: 16, bottom: 16 },
        readOnly: readOnly,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        contextmenu: true,
        automaticLayout: true,
      }}
      loading={
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-zinc-500 gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          <p className="text-sm">Loading Editor Engine...</p>
        </div>
      }
    />
  );
}
