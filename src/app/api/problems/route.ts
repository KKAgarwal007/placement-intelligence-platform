import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Problem } from "@/models/Problem";

export async function GET() {
  try {
    await connectToDatabase();
    
    // We only fetch fields necessary for the problems list
    const problems = await Problem.find({}, {
      _id: 1,
      title: 1,
      titleSlug: 1,
      difficulty: 1,
      likes: 1,
      tags: 1
    }).sort({ createdAt: 1 });
    
    return NextResponse.json(problems, { status: 200 });
  } catch (error) {
    console.error("[PROBLEMS_GET] Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
