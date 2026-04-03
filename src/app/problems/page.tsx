"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, ArrowLeft, Lock, Loader2, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Problem {
  _id: string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  likes: number;
  tags: string[];
}

export default function ProblemsPage() {
  const { data: session } = useSession();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch("/api/problems");
        if (res.ok) {
          const data = await res.json();
          setProblems(data);
        }
      } catch (err) {
        console.error("Failed to load problems", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  const difficultyColor = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Code2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Placement<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer px-4">
                    Sign in
                  </span>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-medium">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Header section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft size={14} /> Back
              </Link>
              <span className="text-zinc-700">•</span>
              <span className="text-indigo-400/80 text-sm font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} /> Curriculum Roadmap
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
              DSA Practice
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Master the data structures and algorithms patterns to ace your technical interviews. View ratings, track your progress, and get AI explanations.
            </p>
          </div>
          
          {!session && (
            <Card className="p-4 bg-indigo-500/5 border-indigo-500/20 rounded-xl backdrop-blur-sm max-w-sm shrink-0">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 mt-0.5">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Guest Mode active</h3>
                  <p className="text-sm text-zinc-400">
                    You can browse the problems, but you need an account to run code, use AI assistance, and track your streak.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Problems Table */}
        <div className="rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl shadow-indigo-500/5">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[80px] text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium">Title</TableHead>
                <TableHead className="text-zinc-400 font-medium">Difficulty</TableHead>
                <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Tags</TableHead>
                <TableHead className="text-right text-zinc-400 font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-none">
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400 gap-3">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                      <span>Loading curriculum...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : problems.length === 0 ? (
                <TableRow className="border-none">
                  <TableCell colSpan={5} className="h-64 text-center text-zinc-500">
                    No problems found. Run the seed API to populate.
                  </TableCell>
                </TableRow>
              ) : (
                problems.map((problem) => (
                  <TableRow 
                    key={problem._id} 
                    className="border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <TableCell>
                      <div className="w-5 h-5 rounded-full border border-white/20 ml-2 group-hover:border-indigo-400/50 transition-colors"></div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="group-hover:text-indigo-400 transition-colors text-zinc-200 text-base">
                        {problem.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal ${difficultyColor[problem.difficulty]}`}>
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.03] text-zinc-400 text-xs font-medium border border-white/5">
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2.5 py-1 rounded-md bg-white/[0.03] text-zinc-500 text-xs font-medium border border-white/5">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {session ? (
                        <Link href={`/problems/${problem.titleSlug}`}>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 font-medium">
                            Solve Problem
                          </Button>
                        </Link>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <Link href={`/problems/${problem.titleSlug}`}>
                              <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-zinc-300 hover:text-white rounded-lg gap-2">
                                <Lock size={14} className="text-zinc-500" />
                                View Only
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <p>Log in to run code and track progress</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
