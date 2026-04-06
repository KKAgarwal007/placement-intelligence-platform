import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import vm from "vm";
import connectToDatabase from "@/lib/db";
import { Problem } from "@/models/Problem";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { language, source_code, stdin = "", problemId, action } = body;

    if (!language || !source_code) {
      return NextResponse.json({ error: "Missing language or source_code" }, { status: 400 });
    }

    const aliases: Record<string, { lang: string; version: string }> = {
      javascript: { lang: "javascript", version: "*" },
      python: { lang: "python", version: "*" },
      java: { lang: "java", version: "*" },
      cpp: { lang: "c++", version: "*" },
    };

    const pistonLang = aliases[language.toLowerCase()];
    if (!pistonLang) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    // Load test cases from DB
    let targetTestCases: any[] = [];
    if (problemId && (action === "run" || action === "submit")) {
      await connectToDatabase();
      const problem = await Problem.findById(problemId);
      if (problem?.testCases) {
        targetTestCases =
          action === "submit"
            ? problem.testCases
            : problem.testCases.filter((t: any) => !t.isHidden);
      }
    }

    // ─── JavaScript: native Node VM execution ────────────────────────────────
    if (pistonLang.lang === "javascript") {
      let stdoutGlobal = "";
      const mockConsole = {
        log: (...args: any[]) => {
          stdoutGlobal +=
            args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") + "\n";
        },
        error: (...args: any[]) => {
          stdoutGlobal +=
            "ERROR: " +
            args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") +
            "\n";
        },
        warn: (...args: any[]) => {
          stdoutGlobal +=
            "WARN: " +
            args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") +
            "\n";
        },
      };

      const vmContext = vm.createContext({
        console: mockConsole,
        Math,
        String,
        Array,
        Object,
        Number,
        Boolean,
        Date,
        RegExp,
        Map,
        Set,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        undefined,
        null: null,
      });

      // ── Test runner mode (run / submit with test cases) ───────────────────
      if (targetTestCases.length > 0) {
        // Step 1: compile/define all functions in context
        let compileError = "";
        try {
          vm.runInContext(source_code, vmContext, { timeout: 5000 });
        } catch (err: any) {
          compileError = err.toString();
        }

        if (compileError) {
          // Compilation / syntax error — report against all test cases
          const results = targetTestCases.map((tc) => ({
            passed: false,
            actualOutput: undefined,
            expectedOutput: tc.output,
            stdout: "",
            stderr: compileError,
            hidden: tc.isHidden,
          }));
          return NextResponse.json({
            language: "javascript",
            version: "node (native)",
            results,
            totalPassed: 0,
            total: targetTestCases.length,
          });
        }

        // Step 2: extract the user's main solution function
        // Handles: function foo(...), var/let/const foo = function|arrow
        const fnMatch = source_code.match(
          /(?:^|\n)\s*(?:var|let|const)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:function|\()/m
        ) || source_code.match(
          /(?:^|\n)\s*function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/m
        );
        const fnName = fnMatch?.[1] ?? null;
        const fn = fnName ? (vmContext as any)[fnName] : null;

        const results: any[] = [];
        let totalPassed = 0;

        for (const tc of targetTestCases) {
          const localLogs: string[] = [];
          const origLog = mockConsole.log;
          mockConsole.log = (...args: any[]) => {
            const out = args
              .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
              .join(" ");
            localLogs.push(out);
            stdoutGlobal += out + "\n";
          };

          let actualOutput: any = undefined;
          let passed = false;
          let execErr = "";

          try {
            if (!fn || typeof fn !== "function") {
              execErr =
                fnName
                  ? `Found function name "${fnName}" but it is not callable. Make sure your solution is defined correctly.`
                  : "Could not find a callable solution function. Make sure you define a function (e.g. var twoSum = function(...){}).";
            } else {
              // Parse each line of the test input as a separate argument
              const inputLines = tc.input
                .split("\n")
                .map((l: string) => l.trim())
                .filter((l: string) => l !== "");

              const args = inputLines.map((line: string) => {
                try {
                  return JSON.parse(line);
                } catch {
                  // If not valid JSON, treat as raw string
                  return line;
                }
              });

              actualOutput = fn(...args);

              // Deep comparison via JSON stringify (order-insensitive for arrays)
              const parsedExpected = (() => {
                try {
                  return JSON.parse(tc.output);
                } catch {
                  return tc.output;
                }
              })();

              // Sort arrays before comparing (handles [0,1] vs [1,0])
              const normalise = (v: any): string => {
                if (Array.isArray(v)) return JSON.stringify([...v].sort());
                return JSON.stringify(v);
              };

              passed = normalise(actualOutput) === normalise(parsedExpected);
            }
          } catch (e: any) {
            execErr = e.toString();
          }

          mockConsole.log = origLog;
          if (passed) totalPassed++;

          results.push({
            passed,
            actualOutput: actualOutput !== undefined ? JSON.stringify(actualOutput) : undefined,
            expectedOutput: tc.output,
            stdout: localLogs.join("\n"),
            stderr: execErr,
            hidden: tc.isHidden,
          });
        }

        return NextResponse.json({
          language: "javascript",
          version: "node (native)",
          results,
          totalPassed,
          total: targetTestCases.length,
        });
      }

      // ── Free-run mode (no test cases, just run the code) ──────────────────
      try {
        vm.runInContext(source_code, vmContext, { timeout: 5000 });
        return NextResponse.json({
          language: "javascript",
          version: "node (native)",
          run: { stdout: stdoutGlobal, stderr: "", code: 0, signal: null },
        });
      } catch (err: any) {
        return NextResponse.json({
          language: "javascript",
          version: "node (native)",
          run: { stdout: stdoutGlobal, stderr: err.toString(), code: 1, signal: null },
        });
      }
    }

    // ─── Other languages: Real Execution via JDoodle API ───
    if (!process.env.JDOODLE_CLIENT_ID || process.env.JDOODLE_CLIENT_ID === "YOUR_JDOODLE_CLIENT_ID") {
       return NextResponse.json({ 
         error: "Remote Execution API Key is missing. Please sign up for JDoodle Free API and paste your credentials into .env.local (JDOODLE_CLIENT_ID & JDOODLE_CLIENT_SECRET), or switch to Javascript for native evaluation."
       }, { status: 400 });
    }

    const jdoodleLangConfig: Record<string, { lang: string; versionIndex: string }> = {
      python: { lang: "python3", versionIndex: "4" }, // Python 3.9
      java: { lang: "java", versionIndex: "4" },      // JDK 17
      "c++": { lang: "cpp", versionIndex: "5" }       // C++ 17 GCC
    };
    const langConfig = jdoodleLangConfig[pistonLang.lang];

    async function runJDoodle(source: string, stdinText: string) {
      const res = await fetch("https://api.jdoodle.com/v1/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET,
          script: source,
          stdin: stdinText,
          language: langConfig.lang,
          versionIndex: langConfig.versionIndex
        })
      });
      if (!res.ok) throw new Error("JDoodle API returned " + res.status);
      const data = await res.json();
      return {
        stdout: data.output !== null ? data.output : "",
        stderr: data.error || "",
        compile_output: ""
      };
    }

    if (problemId && targetTestCases.length > 0) {
      const problem = await Problem.findById(problemId);
      let results = [];
      let totalPassed = 0;

      for (const tc of targetTestCases) {
        let finalSource = source_code;
        let testInput = tc.input;

        // Auto-generate test execution wrappers based on problem
        if (problem?.titleSlug === "two-sum") {
          if (pistonLang.lang === "python") {
            finalSource = `from typing import *\n` + finalSource + `\n\nimport sys, json\nif __name__ == '__main__':\n    lines = sys.stdin.read().strip().split('\\n')\n    if len(lines)>=2:\n        try:\n            sol = Solution()\n            res = sol.twoSum(json.loads(lines[0]), json.loads(lines[1]))\n            print(json.dumps(res, separators=(',', ':')))\n        except Exception as e:\n            pass`;
          } else if (pistonLang.lang === "java") {
            finalSource += `\n\npublic class Main {\n    public static void main(String[] args) {\n        java.util.Scanner sc = new java.util.Scanner(System.in);\n        if(!sc.hasNextLine()) return;\n        String l1 = sc.nextLine().trim();\n        String l2 = sc.nextLine().trim();\n        l1 = l1.substring(1, l1.length()-1);\n        String[] p = l1.split(",");\n        int[] nums = new int[p.length];\n        for(int i=0; i<p.length; i++) nums[i] = Integer.parseInt(p[i].trim());\n        int target = Integer.parseInt(l2);\n        Solution sol = new Solution();\n        int[] res = sol.twoSum(nums, target);\n        System.out.print("[" + res[0] + "," + res[1] + "]");\n    }\n}`;
          } else if (pistonLang.lang === "c++") {
            finalSource = `#include <bits/stdc++.h>\nusing namespace std;\n` + finalSource + `\n\nint main() {\n    string line1, line2;\n    if(!getline(cin, line1)) return 0;\n    getline(cin, line2);\n    line1 = line1.substr(1, line1.length()-2);\n    vector<int> nums;\n    stringstream ss(line1);\n    string item;\n    while(getline(ss, item, ',')) nums.push_back(stoi(item));\n    int target = stoi(line2);\n    Solution sol;\n    vector<int> res = sol.twoSum(nums, target);\n    if (res.size() >= 2) cout << "[" << res[0] << "," << res[1] << "]";\n    return 0;\n}`;
          }
        }
        
        try {
          const apiRes = await runJDoodle(finalSource, testInput);
          
          // JDoodle's Free tier enforces a strict limit of 1 request per second. 
          // Since we are looping through test cases, we must artificial sleep to prevent 429s.
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const outputStr = (apiRes.stdout || "").trim();
          const errorStr = (apiRes.stderr || apiRes.compile_output || "").trim();
          
          let passed = false;
          if (!errorStr && outputStr) {
             // Basic Normalisation for Array matching
             const normalise = (str: string) => str.replace(/\\s/g, '');
             passed = normalise(outputStr) === normalise(tc.output);
          }

          if (passed) totalPassed++;

          results.push({
            passed,
            actualOutput: outputStr || undefined,
            expectedOutput: tc.output,
            stdout: outputStr,
            stderr: errorStr,
            hidden: tc.isHidden
          });
        } catch (e: any) {
          results.push({
            passed: false,
            actualOutput: undefined,
            expectedOutput: tc.output,
            stdout: "",
            stderr: e.message || "Failed to contact remote compilation engine.",
            hidden: tc.isHidden
          });
        }
      }

      return NextResponse.json({
        language: pistonLang.lang,
        version: "Judge0 Remote",
        results,
        totalPassed,
        total: targetTestCases.length
      });
    }

    // Free-run mode (no test cases, just raw evaluation)
    const rawRes = await runJDoodle(source_code, stdin);
    const outputString = rawRes.stdout || "";
    const errorString = rawRes.stderr || rawRes.compile_output || "";
    
    return NextResponse.json({
        language: pistonLang.lang,
        version: "Judge0 Remote",
        run: { stdout: outputString, stderr: errorString, code: errorString ? 1 : 0, signal: null }
    });
  } catch (error) {
    console.error("Execution Code Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
