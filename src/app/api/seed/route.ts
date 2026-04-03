import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Problem } from "@/models/Problem";

const sampleProblems = [
  {
    title: "Two Sum",
    titleSlug: "two-sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" },
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.",
      "So, if we fix one of the numbers, say `x`, we have to scan the entire array to find the next number `y` which is `value - x` where value is the input parameter. Can we change our array keeping a track of the elements we have already seen to reduce this search?",
    ],
    starterCode: {
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
    },
  },
  {
    title: "Reverse Linked List",
    titleSlug: "reverse-linked-list",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "[1,2]", output: "[2,1]" },
      { input: "[]", output: "[]" }
    ],
    hints: [],
    starterCode: {
      cpp: "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};",
      java: "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}",
      python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        ",
      javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};",
    },
  },
  {
    title: "Longest Substring Without Repeating Characters",
    titleSlug: "longest-substring-without-repeating-characters",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    testCases: [
      { input: '"abcabcbb"', output: "3" },
      { input: '"bbbbb"', output: "1" },
      { input: '"pwwkew"', output: "3" }
    ],
    hints: [
      "Generate all possible substrings & check for each substring if it's valid and keep updating max length.",
      "A naive approach can be optimized. How can we check if a substring has repeating characters without scanning it entirely entirely?",
      "Use a sliding window."
    ],
    starterCode: {
      cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}",
      python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ",
      javascript: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};",
    },
  }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Clear existing to avoid duplicates in development
    await Problem.deleteMany({});
    
    // Insert new seeded data
    await Problem.insertMany(sampleProblems);
    
    return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 });
  } catch (error) {
    console.error("[SEED] Error seeding database:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
