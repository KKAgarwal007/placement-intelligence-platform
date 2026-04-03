"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code2, BrainCircuit, Trophy, TerminalSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Placement<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">OS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#curriculum" className="hover:text-white transition-colors">Curriculum</Link>
            <Link href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Introducing AI-Powered Interview Simulation
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl"
          >
            Bridge the gap between <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">passive learning</span> and <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">active performance.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12"
          >
            The ultimate Placement Operating System. Curated DSA roadmaps, integrated code execution, AI debugging, and mock interview agents to get you hired.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              Start Practicing Free <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
               <BrainCircuit size={18} /> Try AI Interview
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<TerminalSquare className="text-indigo-400" size={24} />}
              title="Integrated IDE Workspace"
              description="Write, execute, and debug code directly in the browser with our Judge0-powered execution engine. No setup required."
              delay={0.4}
            />
            <FeatureCard 
              icon={<BrainCircuit className="text-purple-400" size={24} />}
              title="AI-Powered Debugger"
              description="Stuck on a tricky test case? Our Gemini AI engine analyzes your code and explains exactly where you went wrong."
              delay={0.5}
            />
            <FeatureCard 
              icon={<Trophy className="text-pink-400" size={24} />}
              title="Gamified Consistency"
              description="Build your streak with daily challenges. Track your progress on a GitHub-style active heatmap and climb the leaderboard."
              delay={0.6}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
