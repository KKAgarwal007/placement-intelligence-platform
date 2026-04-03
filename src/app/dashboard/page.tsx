"use client";

import { useSession, signOut } from "next-auth/react";
import { Code2, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Dashboard Nav */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Code2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              Placement<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <User size={14} />
              </div>
              <span>{session?.user?.name ?? session?.user?.email}</span>
            </div>
            <button
              id="signout-btn"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "Coder"} 👋
          </h1>
          <p className="text-zinc-400 text-lg">Your placement dashboard is being built. Stay tuned!</p>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Problems Solved", value: "0", color: "from-indigo-600 to-blue-600" },
            { label: "Current Streak", value: "0 days", color: "from-purple-600 to-pink-600" },
            { label: "Leaderboard Rank", value: "—", color: "from-orange-600 to-yellow-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-zinc-400 text-sm mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 flex flex-col items-start">
            <h3 className="text-xl font-bold text-white mb-2">DSA Curriculum</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Master the data structures and algorithms patterns to ace your technical interviews.
            </p>
            <Link href="/problems">
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 font-medium transition-all">
                Browse Problems
              </button>
            </Link>
          </div>
          
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-start opacity-70">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              AI Interview Agent <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-zinc-300">Coming Soon</span>
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Practice mock interviews with our AI agent to improve your communication and problem-solving skills under pressure.
            </p>
            <button disabled className="px-5 py-2.5 bg-white/5 text-zinc-500 rounded-lg font-medium cursor-not-allowed">
              Locked
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
