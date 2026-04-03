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
  Cpu, 
  TerminalSquare, 
  CheckCircle2, 
  Loader2 
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

export default function WorkspaceClient({ titleSlug }: { titleSlug: string }) {
  const { data: session } = useSession();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${titleSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          // Only set initial code if there is no local storage code
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

  const handleRunCode = () => {
     if (!session) {
        alert("Please log in to run your code or use AI features.");
        return;
     }
     alert("Code execution will be implemented in the next phase!");
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
      {/* Navbar */}
      <nav className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/problems" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
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
              <Button size="sm" onClick={handleRunCode} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded gap-2 h-8 px-4 text-xs font-semibold">
                <Play size={14} fill="currentColor" /> Run Code
              </Button>
              <Button size="sm" onClick={handleRunCode} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded gap-2 h-8 px-4 text-xs font-semibold shadow-indigo-600/20">
                <TerminalSquare size={14} /> Submit
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

      {/* Main Workspace Workspace */}
      <div className="flex-1 overflow-hidden p-2">
        {/* @ts-expect-error direction prop has type issues with react-resizable-panels v4 */}
        <ResizablePanelGroup direction="horizontal">
          {/* Left Pane: Description */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] overflow-y-auto overflow-x-hidden flex flex-col hide-scrollbar">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-2xl font-bold">{problem.title}</h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Badge variant="outline" className={`font-medium ${difficultyColor[problem.difficulty]}`}>
                    {problem.difficulty}
                  </Badge>
                  {problem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-zinc-300 font-normal">
                       {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-zinc-300 [&>p]:leading-relaxed [&>p]:mb-4 [&>pre]:bg-[#111] [&>pre]:border [&>pre]:border-white/5 [&>pre]:p-4 [&>pre]:rounded-md [&>code]:text-indigo-300 [&>code]:bg-indigo-500/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded-sm text-sm">
                  <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br/>') }} />
                </div>

                {problem.hints && problem.hints.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                      <Lightbulb size={16} className="text-amber-500" /> Hints
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

          <ResizableHandle className="w-2 hover:bg-indigo-500/50 transition-colors mx-1 rounded-full active:bg-indigo-500 relative flex items-center justify-center">
            <div className="w-1 h-8 rounded-full bg-white/20" />
          </ResizableHandle>

          {/* Right Pane: Editor & Console */}
          <ResizablePanel defaultSize={60}>
            {/* @ts-expect-error direction prop has type issues with react-resizable-panels v4 */}
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={65} minSize={30}>
                <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex flex-col">
                  {/* Editor Header */}
                  <div className="h-10 border-b border-white/5 bg-[#0d0d0d] flex items-center justify-between px-3 shrink-0">
                    <div className="flex flex-wrap">
                      {["javascript", "python", "cpp", "java"].map(lang => (
                        <button 
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${language === lang ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Monaco Editor Wrapper */}
                  <div className="flex-1 relative">
                    <CodeEditor 
                       value={code} 
                       language={language}
                       onChange={handleCodeChange}
                       problemId={problem._id}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-2 hover:bg-indigo-500/50 transition-colors my-1 rounded-full active:bg-indigo-500 flex items-center justify-center">
                 <div className="h-1 w-8 rounded-full bg-white/20" />
              </ResizableHandle>

              <ResizablePanel defaultSize={35} minSize={20}>
                <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] flex flex-col overflow-hidden text-sm">
                  <div className="h-10 border-b border-white/5 bg-[#0d0d0d] flex items-center px-4 shrink-0 gap-6">
                     <button className="text-white border-b-2 border-indigo-500 h-full flex items-center gap-2 text-xs font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500"/> Testcases
                     </button>
                     <button className="text-zinc-500 hover:text-zinc-300 h-full flex items-center gap-2 text-xs font-medium transition-colors">
                        <TerminalSquare size={14} /> Console output
                     </button>
                  </div>
                  <div className="flex-1 p-4 bg-[#050505]/50 overflow-y-auto">
                     {!session ? (
                         <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                           <Lock size={24} className="text-zinc-600" />
                           <p>Please <Link href="/login" className="text-indigo-400 hover:underline">log in</Link> to run test cases</p>
                         </div>
                     ) : (
                         <div className="text-zinc-400 font-mono text-sm">
                           Select a testcase and click 'Run Code' to see execution results.
                         </div>
                     )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
