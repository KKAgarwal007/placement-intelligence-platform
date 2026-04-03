import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Problem } from "@/models/Problem";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ titleSlug: string }> }
) {
  try {
    const { titleSlug } = await params;
    await connectToDatabase();
    
    // We omit test cases outputs or hidden test cases in a robust system
    // but for now we fetch the whole document to allow validation on the client.
    const problem = await Problem.findOne({ titleSlug });
    
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json(problem, { status: 200 });
  } catch (error) {
    console.error(`[PROBLEM_GET_${request.url}] Error fetching problem:`, error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
