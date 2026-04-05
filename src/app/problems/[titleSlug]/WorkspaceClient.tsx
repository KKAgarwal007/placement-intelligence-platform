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
  XCircle,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CodeEditor from "@/components/ide/CodeEditor";

interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
}

interface Problem {
  _id: string;
  title: string;
  titleSlug: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  testCases: TestCase[];
  hints: string[];
  starterCode: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
    [key: string]: string;
  };
}

interface TestResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  stdout: string;
  stderr: string;
  hidden: boolean;
}

interface OutputState {
  results?: TestResult[];
  totalPassed?: number;
  total?: number;
  run?: { stdout: string; stderr: string; code: number; signal: string };
  compile?: { stdout: string; stderr: string; code: number };
  error?: string;
  isSubmit?: boolean;
}

const CONSOLE_HEIGHT = 260; // px

export default function WorkspaceClient({ titleSlug }: { titleSlug: string }) {
  const { data: session } = useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [output, setOutput] = useState<OutputState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcases" | "console">("testcases");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${titleSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
        }
      } catch (err) {
        console.error("Failed to load problem", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [titleSlug]);

  useEffect(() => {
    if (problem) {
      const savedCode = localStorage.getItem(`code-${problem._id}-${language}`);
      setCode(savedCode || problem.starterCode[language] || "");
    }
  }, [language, problem]);

  const difficultyColor = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  const visibleTestCases = problem?.testCases?.filter(t => !t.isHidden) || [];

  const handleCodeChange = (newCode: string | undefined) => {
    setCode(newCode || "");
    if (!session && problem) {
      setGuestMessage("Your code has been auto-saved locally.");
      setTimeout(() => setGuestMessage(""), 3000);
    }
  };

  const executeCode = async (action: "run" | "submit") => {
    if (!session) {
      alert("Please log in to run your code or use test features.");
      return;
    }

    setIsConsoleOpen(true);
    setIsExecuting(true);
    setActiveTab("testcases");
    setOutput(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, source_code: code, problemId: problem?._id, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOutput({ error: data.error || "Failed to execute code." });
      } else {
        setOutput({ ...data, isSubmit: action === "submit" });
      }
    } catch (err) {
      console.error(err);
      setOutput({ error: "Failed to connect to execution engine." });
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
      {/* Top Navbar */}
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

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Button
                size="sm"
                onClick={() => executeCode("run")}
                disabled={isExecuting}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded gap-2 h-8 px-4 text-xs font-semibold disabled:opacity-60 transition-all"
              >
                {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
                Run
              </Button>
              <Button
                size="sm"
                onClick={() => executeCode("submit")}
                disabled={isExecuting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded gap-2 h-8 px-4 text-xs font-semibold shadow-[0_0_15px_rgba(5,150,105,0.3)] disabled:opacity-60 transition-all"
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
                <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white rounded gap-2 h-8 px-4 text-xs font-semibold">
                  <Lock size={12} /> Log in to Run Code
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        {/* @ts-expect-error type limit */}
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* LEFT PANE */}
          <ResizablePanel defaultSize={40} minSize={22} className="h-full">
            <div className="h-full overflow-y-auto overflow-x-hidden bg-[#0a0a0a] border-r border-white/5 hide-scrollbar relative">
              <div className="p-6 pb-20">
                <h1 className="text-xl font-bold mb-3">{problem.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge variant="outline" className={`font-medium text-xs ${difficultyColor[problem.difficulty]}`}>
                    {problem.difficulty}
                  </Badge>
                  {problem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 font-normal text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-zinc-300 [&>p]:leading-relaxed [&>p]:mb-4 [&>pre]:bg-[#111] [&>pre]:border [&>pre]:border-white/5 [&>pre]:p-4 [&>pre]:rounded-md [&>code]:text-indigo-300 [&>code]:bg-indigo-500/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-sm text-sm">
                  <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, "<br/>") }} />
                </div>

                {/* Visible Examples Section */}
                <div className="mt-10 space-y-5">
                  {visibleTestCases.map((tc, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                       <h3 className="text-sm font-semibold text-white">Example {idx + 1}:</h3>
                       <div className="relative bg-[#111] border border-white/5 p-4 rounded-lg text-sm text-zinc-300 font-mono flex flex-col gap-3">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-lg"></div>
                          <div>
                            <span className="text-zinc-500 select-none">Input: </span>
                            <span className="text-white">{tc.input}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 select-none">Output: </span>
                            <span className="text-emerald-400">{tc.output}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                {problem.hints?.length > 0 && (
                  <div className="mt-10 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                      <Lightbulb size={15} className="text-amber-500" /> Hints
                    </h3>
                    {problem.hints.map((hint, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm text-amber-200/80">
                        {hint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-[3px] bg-white/5 hover:bg-indigo-500/60 transition-colors active:bg-indigo-500 cursor-col-resize" />

          {/* RIGHT PANE */}
          <ResizablePanel defaultSize={60} className="h-full">
            <div className="relative h-full flex flex-col bg-[#0d0d0d] overflow-hidden">
              <div className="h-10 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-3 shrink-0">
                <div className="flex">
                  {["javascript", "python", "cpp", "java"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        language === lang ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
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

              {/* CONSOLE DRAWER */}
              <div
                className="absolute left-0 right-0 bottom-0 flex flex-col bg-[#0a0a0a] border-t border-white/10 transition-transform duration-300 ease-in-out shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
                style={{
                  height: `${CONSOLE_HEIGHT}px`,
                  transform: isConsoleOpen ? "translateY(0)" : "translateY(100%)",
                }}
              >
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-[#080808]">
                  <div className="flex items-center h-full gap-5">
                    <button
                      onClick={() => setActiveTab("testcases")}
                      className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === "testcases" ? "text-white border-indigo-500" : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      <CheckCircle2 size={13} className={activeTab === "testcases" && output?.totalPassed === output?.total && output?.total ? "text-emerald-400" : activeTab === "testcases" && output?.results ? "text-red-400" : ""} />
                      Testcases
                    </button>
                    <button
                      onClick={() => setActiveTab("console")}
                      className={`h-full flex items-center gap-1.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === "console" ? "text-white border-indigo-500" : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      <TerminalSquare size={13} /> Console Output
                    </button>
                  </div>
                  <button
                    onClick={() => setIsConsoleOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                   {activeTab === "testcases" && (
                      <div className="flex-1 flex overflow-hidden">
                         {/* Test cases list */}
                         <div className="w-1/3 border-r border-white/5 overflow-y-auto hide-scrollbar p-2 space-y-1">
                           {isExecuting ? (
                              <div className="flex items-center gap-2 p-3 text-sm text-zinc-500">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                Running tests...
                              </div>
                           ) : output?.error ? (
                              <div className="p-3 text-sm text-red-400 flex items-center gap-2 font-mono">
                                 <XCircle size={14}/> Error occurred
                              </div>
                           ) : output?.results ? (
                              output.results.map((res, i) => {
                                 /* If Submit mode, maybe hide the contents of hidden test cases, but show generic card? */
                                 const isHidden = res.hidden;
                                 return (
                                  <button
                                    key={i}
                                    onClick={() => setActiveTestCaseIdx(i)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between ${
                                      activeTestCaseIdx === i ? "bg-white/10" : "hover:bg-white/5"
                                    }`}
                                  >
                                     <span className="flex items-center gap-2 text-zinc-300 font-mono">
                                       {res.passed ? <CheckCircle2 size={13} className="text-emerald-400"/> : <XCircle size={13} className="text-red-400"/>}
                                       {isHidden ? `Hidden Case ${i + 1}` : `Case ${i + 1}`}
                                     </span>
                                  </button>
                                 );
                               })
                           ) : (
                              visibleTestCases.map((tc, i) => (
                               <button
                                 key={i}
                                 onClick={() => setActiveTestCaseIdx(i)}
                                 className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
                                   activeTestCaseIdx === i ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                 }`}
                               >
                                  <FileText size={13} />
                                  Case {i + 1}
                               </button>
                              ))
                           )}
                         </div>
                         
                         {/* Test case detail view */}
                         <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                            {!session ? (
                               <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                                  <Lock size={20} className="text-zinc-600"/>
                                  <span className="text-sm">Log in to view execution results</span>
                               </div>
                            ) : output?.error ? (
                               <div className="text-red-400 bg-red-400/10 p-3 rounded text-sm font-mono whitespace-pre-wrap border border-red-500/20">
                                 {output.error}
                               </div>
                            ) : output?.results ? (
                               <div className="space-y-4">
                                  {(() => {
                                     const res = output.results[activeTestCaseIdx];
                                     if (!res) return null;
                                     if (res.hidden) {
                                        return (
                                          <div className="p-4 border border-dashed border-white/10 rounded flex flex-col items-center justify-center h-40 gap-2 text-zinc-500">
                                            {res.passed ? (
                                              <><CheckCircle2 className="text-emerald-500 w-8 h-8" /><span>Hidden test case passed.</span></>
                                            ) : (
                                              <><XCircle className="text-red-500 w-8 h-8" /><span>Hidden test case failed.</span></>
                                            )}
                                          </div>
                                        );
                                     }

                                     const tc = visibleTestCases[activeTestCaseIdx] || visibleTestCases[0]; 
                                     
                                     return (
                                        <div className="flex flex-col gap-4 font-mono text-sm">
                                           <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                                              <span className="font-semibold text-white">Status:</span>
                                              <span className={res.passed ? "text-emerald-400" : "text-red-400"}>
                                                 {res.passed ? "Accepted" : "Wrong Answer"}
                                              </span>
                                           </div>
                                           <div>
                                             <div className="text-xs text-zinc-500 mb-1">Input</div>
                                             <div className="bg-[#111] p-3 rounded-md text-zinc-300 border border-white/5 break-all">{tc?.input}</div>
                                           </div>
                                           {res.stdout && (
                                              <div>
                                                <div className="text-xs text-zinc-500 mb-1">Stdout</div>
                                                <div className="bg-white/5 p-3 rounded-md text-zinc-300 border border-white/10">{res.stdout}</div>
                                              </div>
                                           )}
                                           {res.stderr && (
                                              <div>
                                                <div className="text-xs text-zinc-500 mb-1">Stderr</div>
                                                <div className="bg-red-500/10 p-3 rounded-md text-red-400 border border-red-500/20">{res.stderr}</div>
                                              </div>
                                           )}
                                           <div>
                                             <div className="text-xs text-zinc-500 mb-1">Expected Output</div>
                                             <div className="bg-[#111] p-3 rounded-md text-emerald-400 border border-white/5">{tc?.output}</div>
                                           </div>
                                           <div>
                                             <div className="text-xs text-zinc-500 mb-1">Actual Output</div>
                                             <div className={`bg-[#111] p-3 rounded-md border ${res.passed ? 'border-white/5 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                                                {res.actualOutput || "undefined"}
                                             </div>
                                           </div>
                                        </div>
                                     );
                                  })()}
                               </div>
                            ) : (
                               <div className="space-y-4">
                                  {visibleTestCases[activeTestCaseIdx] && (
                                     <div className="flex flex-col gap-4 font-mono text-sm">
                                       <div>
                                         <div className="text-xs text-zinc-500 mb-1">Input</div>
                                         <div className="bg-[#111] p-3 rounded-md text-zinc-300 border border-white/5 whitespace-pre-wrap">{visibleTestCases[activeTestCaseIdx].input}</div>
                                       </div>
                                       <div>
                                         <div className="text-xs text-zinc-500 mb-1">Expected Output</div>
                                         <div className="bg-[#111] p-3 rounded-md text-emerald-400 border border-white/5">{visibleTestCases[activeTestCaseIdx].output}</div>
                                       </div>
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      </div>
                   )}

                   {activeTab === "console" && (
                     <div className="flex-1 p-4 font-mono text-sm overflow-y-auto hide-scrollbar">
                       {/* Basic terminal log style (Fallback or general run) */}
                       {output?.results ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-white font-bold mb-2">Test Run Summary</div>
                            <div>Passed: <span className="text-emerald-400">{output.totalPassed}</span> / <span className="text-white">{output.total}</span></div>
                            {output.totalPassed === output.total ? (
                               <div className="text-emerald-400 mt-2 font-bold animate-pulse">All tests accepted!</div>
                            ) : (
                               <div className="text-red-400 mt-2">Some tests failed. Check the Testcases tab.</div>
                            )}
                          </div>
                       ) : output?.run ? (
                         <div className="flex flex-col gap-3">
                            {output.run.stderr && (
                              <div className="text-red-400 whitespace-pre-wrap">
                                <div className="font-bold text-xs uppercase tracking-wider text-red-500 mb-1">Runtime Error</div>
                                <div className="bg-red-500/10 p-2 rounded">{output.run.stderr}</div>
                              </div>
                            )}
                            {output.run.stdout && (
                              <div className="text-zinc-300 whitespace-pre-wrap">
                                <div className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-1">Output</div>
                                <div className="bg-white/5 p-2 rounded border border-white/10">{output.run.stdout}</div>
                              </div>
                            )}
                         </div>
                       ) : (
                         <div className="text-zinc-500 italic h-full flex flex-col items-center justify-center gap-2">
                            <TerminalSquare size={20} className="opacity-50"/>
                            Run Code to see console output
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
