"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Code2,
  Lightbulb,
  Lock,
  Play,
  TerminalSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CodeEditor from "@/components/ide/CodeEditor";

interface Problem {
  _id: string;
  title: string;
  titleSlug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  hints: string[];
  starterCode: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
    [key: string]: string;
  };
}

const CONSOLE_HEIGHT = 260; // px — height of the slide-up console drawer

export default function WorkspaceClient({ titleSlug }: { titleSlug: string }) {
  const { data: session } = useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [output, setOutput] = useState<{
    run?: { stdout: string; stderr: string; code: number; signal: string };
    compile?: { stdout: string; stderr: string; code: number };
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcases" | "console">("console");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${titleSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          if (!localStorage.getItem(`code-${data._id}`)) {
            setCode(data.starterCode[language] || "");
          }
        }
      } catch (err) {
        console.error("Failed to load problem", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [titleSlug, language]);

  const difficultyColor = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  const handleCodeChange = (newCode: string | undefined) => {
    setCode(newCode || "");
    if (!session && problem) {
      setGuestMessage("Your code has been auto-saved locally.");
      setTimeout(() => setGuestMessage(""), 3000);
    }
  };

  const handleRunCode = async () => {
    if (!session) {
      alert("Please log in to run your code or use AI features.");
      return;
    }

    setIsConsoleOpen(true);
    setIsExecuting(true);
    setActiveTab("console");
    setOutput({ run: { stdout: "Executing code...", stderr: "", code: 0, signal: "" } });

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, source_code: code, stdin: "" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOutput({ run: { stdout: "", stderr: data.error || "Failed to execute code.", code: 1, signal: "" } });
      } else {
        setOutput(data);
      }
    } catch (err) {
      console.error(err);
      setOutput({ run: { stdout: "", stderr: "Failed to connect to execution engine.", code: 1, signal: "" } });
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
        <p className="text-zinc-500">Loading workspace...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col gap-4 text-white">
        <h2>Problem not found</h2>
        <Link href="/problems">
          <Button variant="outline">Back to Curriculum</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-white overflow-hidden">
      {/* ── Top Navbar ── */}
      <nav className="h-12 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/problems" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={17} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Code2 size={12} />
            </div>
            <span className="font-semibold text-sm">PlacementOS</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Button
                size="sm"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded gap-2 h-8 px-4 text-xs font-semibold disabled:opacity-60"
              >
                {isExecuting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Play size={13} fill="currentColor" />
                )}
                Run Code
              </Button>
              <Button
                size="sm"
                onClick={handleRunCode}
                disabled={isExecuting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded gap-2 h-8 px-4 text-xs font-semibold shadow-indigo-600/20 disabled:opacity-60"
              >
                <TerminalSquare size={13} /> Submit
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {guestMessage && (
                <span className="text-xs text-amber-500 animate-pulse hidden md:inline-block">
                  {guestMessage}
                </span>
              )}
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white rounded gap-2 h-8 px-4 text-xs font-semibold"
                >
                  <Lock size={12} /> Log in to Run Code
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Two-Pane Workspace (fills remaining screen height) ── */}
      <div className="flex-1 overflow-hidden">
        {/* @ts-expect-error direction prop has type issues with react-resizable-panels v4 */}
        <ResizablePanelGroup direction="horizontal" className="h-full">

          {/* ── LEFT PANE: Problem Description ── */}
          <ResizablePanel defaultSize={40} minSize={22} className="h-full">
            <div className="h-full overflow-y-auto overflow-x-hidden bg-[#0a0a0a] border-r border-white/5 hide-scrollbar">
              <div className="p-6">
                {/* Title */}
                <h1 className="text-xl font-bold mb-3">{problem.title}</h1>

                {/* Difficulty + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge
                    variant="outline"
                    className={`font-medium text-xs ${difficultyColor[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </Badge>
                  {problem.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 font-normal text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Problem Description */}
                <div className="text-zinc-300 [&>p]:leading-relaxed [&>p]:mb-4 [&>pre]:bg-[#111] [&>pre]:border [&>pre]:border-white/5 [&>pre]:p-4 [&>pre]:rounded-md [&>code]:text-indigo-300 [&>code]:bg-indigo-500/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-sm text-sm">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: problem.description.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>

                {/* Hints */}
                {problem.hints?.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                      <Lightbulb size={15} className="text-amber-500" /> Hints
                    </h3>
                    {problem.hints.map((hint, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm text-amber-200/80"
                      >
                        {hint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          {/* Drag Handle */}
          <ResizableHandle className="w-[3px] bg-white/5 hover:bg-indigo-500/60 transition-colors active:bg-indigo-500 cursor-col-resize" />

          {/* ── RIGHT PANE: Code Editor + Slide-up Console ── */}
          <ResizablePanel defaultSize={60} className="h-full">
            {/* Use position:relative so the absolute console drawer is scoped here */}
            <div className="relative h-full flex flex-col bg-[#0d0d0d] overflow-hidden">

              {/* Language Tab Bar */}
              <div className="h-10 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-3 shrink-0">
                <div className="flex">
                  {["javascript", "python", "cpp", "java"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        language === lang
                          ? "bg-white/10 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-zinc-600 font-mono capitalize pr-1">
                  {language === "cpp" ? "C++" : language}
                </span>
              </div>

              {/* Monaco Editor
                  Push its bottom up by CONSOLE_HEIGHT when the console is open,
                  so the editor content is never hidden behind the drawer. */}
              <div
                className="flex-1 overflow-hidden transition-all duration-300 ease-in-out"
                style={{ paddingBottom: isConsoleOpen ? `${CONSOLE_HEIGHT}px` : "0px" }}
              >
                <CodeEditor
                  value={code}
                  language={language}
                  onChange={handleCodeChange}
                  problemId={problem._id}
                />
              </div>

              {/* ── Slide-up Console Drawer ──
                  Absolutely positioned, anchored to bottom-0.
                  translateY(100%) hides it; translateY(0) reveals it. */}
              <div
                className="absolute left-0 right-0 bottom-0 flex flex-col bg-[#080808] border-t border-white/10 transition-transform duration-300 ease-in-out"
                style={{
                  height: `${CONSOLE_HEIGHT}px`,
                  transform: isConsoleOpen ? "translateY(0)" : "translateY(100%)",
                }}
              >
                {/* Console Header Tabs */}
                <div className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center h-full gap-5">
                    <button
                      onClick={() => setActiveTab("testcases")}
                      className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === "testcases"
                          ? "text-white border-indigo-500"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      <CheckCircle2
                        size={13}
                        className={activeTab === "testcases" ? "text-emerald-400" : ""}
                      />
                      Testcases
                    </button>
                    <button
                      onClick={() => setActiveTab("console")}
                      className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === "console"
                          ? "text-white border-indigo-500"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      <TerminalSquare size={13} />
                      Console Output
                    </button>
                  </div>

                  {/* Collapse button */}
                  <button
                    onClick={() => setIsConsoleOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                    title="Close console"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                {/* Console Body */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm hide-scrollbar">
                  {!session ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                      <Lock size={22} className="text-zinc-600" />
                      <p className="text-sm font-sans">
                        Please{" "}
                        <Link href="/login" className="text-indigo-400 hover:underline">
                          log in
                        </Link>{" "}
                        to run test cases
                      </p>
                    </div>
                  ) : activeTab === "testcases" ? (
                    <div className="text-zinc-400 text-sm italic font-sans">
                      Select a testcase and click &apos;Run Code&apos; to see execution results.
                    </div>
                  ) : (
                    <div>
                      {isExecuting ? (
                        <div className="flex items-center gap-2 text-indigo-400 font-sans">
                          <Loader2 className="animate-spin w-4 h-4" /> Executing code…
                        </div>
                      ) : output ? (
                        <div className="flex flex-col gap-3">
                          {/* Compile error */}
                          {output.compile && output.compile.code !== 0 && (
                            <div className="text-red-400 whitespace-pre-wrap flex flex-col gap-1">
                              <div className="font-bold text-xs uppercase tracking-wider text-red-500">
                                Compile Error
                              </div>
                              <div className="bg-red-500/10 p-2 rounded border border-red-500/20">
                                {output.compile.stderr || output.compile.stdout}
                              </div>
                            </div>
                          )}
                          {/* Run output */}
                          {output.run && (
                            <>
                              {output.run.stderr && (
                                <div className="text-red-400 whitespace-pre-wrap flex flex-col gap-1">
                                  <div className="font-bold text-xs uppercase tracking-wider text-red-500">
                                    Runtime Error
                                  </div>
                                  <div className="bg-red-500/10 p-2 rounded border border-red-500/20">
                                    {output.run.stderr}
                                  </div>
                                </div>
                              )}
                              {output.run.stdout && (
                                <div className="text-zinc-300 whitespace-pre-wrap flex flex-col gap-1">
                                  <div className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                                    Standard Output
                                  </div>
                                  <div className="bg-white/5 p-2 rounded border border-white/10">
                                    {output.run.stdout}
                                  </div>
                                </div>
                              )}
                              {!output.run.stdout &&
                                !output.run.stderr &&
                                (!output.compile || output.compile.code === 0) && (
                                  <div className="text-zinc-500 italic">
                                    Program executed successfully with no output.
                                  </div>
                                )}
                              {output.run.code !== undefined &&
                                output.run.signal !== undefined && (
                                  <div className="text-xs text-zinc-600 mt-2 flex gap-4 border-t border-white/5 pt-2">
                                    <span>Exit Code: {output.run.code}</span>
                                    {output.run.signal && (
                                      <span>Signal: {output.run.signal}</span>
                                    )}
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-500 italic">
                          No output yet. Run your code to see results.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* ── End Console Drawer ── */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
