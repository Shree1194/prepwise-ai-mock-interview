// ─── Coding Problems Dataset ───────────────────────────────────────────────────
// Problems are relevant to E&TC students: DSA fundamentals, bit manipulation,
// embedded-style problems, signal/array processing, and algorithmic thinking.

export type CodingLanguage = "c" | "cpp" | "java" | "python" | "javascript";
export type ProblemDifficulty = "easy" | "medium" | "hard";
export type ProblemCategory =
  | "arrays"
  | "strings"
  | "bit-manipulation"
  | "math"
  | "recursion"
  | "sorting"
  | "searching"
  | "dynamic-programming"
  | "graph"
  | "embedded-logic";

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface StarterCode {
  c: string;
  cpp: string;
  java: string;
  python: string;
  javascript: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  category: ProblemCategory;
  subject: string;
  tags: string[];
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation: string }>;
  testCases: TestCase[];
  hints: string[];
  starterCode: StarterCode;
  timeLimit: number;
  memoryLimit: number;
  etcRelevance: string;
}

const STARTER: Record<string, StarterCode> = {
  twoSum: {
    c: `#include <stdio.h>\n\nvoid twoSum(int* nums, int numsSize, int target, int* result) {\n    // Your code here\n}\n\nint main() {\n    int nums[] = {2, 7, 11, 15};\n    int result[2];\n    twoSum(nums, 4, 9, result);\n    printf("[%d, %d]\\n", result[0], result[1]);\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto result = twoSum(nums, 9);\n    cout << "[" << result[0] << ", " << result[1] << "]" << endl;\n    return 0;\n}`,
    java: `import java.util.*;\n\nclass Main {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        Main sol = new Main();\n        int[] result = sol.twoSum(new int[]{2, 7, 11, 15}, 9);\n        System.out.println(Arrays.toString(result));\n    }\n}`,
    python: `def two_sum(nums, target):\n    # Your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))`,
    javascript: `function twoSum(nums, target) {\n    // Your code here\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  },
  bitCount: {
    c: `#include <stdio.h>\n\nint countBits(unsigned int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    printf("%d\\n", countBits(5));\n    printf("%d\\n", countBits(7));\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint countBits(unsigned int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    cout << countBits(5) << endl;\n    cout << countBits(7) << endl;\n    return 0;\n}`,
    java: `class Main {\n    public int countBits(int n) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Main sol = new Main();\n        System.out.println(sol.countBits(5));\n        System.out.println(sol.countBits(7));\n    }\n}`,
    python: `def count_bits(n):\n    # Your code here\n    pass\n\nprint(count_bits(5))\nprint(count_bits(7))`,
    javascript: `function countBits(n) {\n    // Your code here\n}\n\nconsole.log(countBits(5));\nconsole.log(countBits(7));`,
  },
  movingAvg: {
    c: `#include <stdio.h>\n\nvoid movingAverage(int* signal, int n, int k, float* output) {\n    // Your code here\n}\n\nint main() {\n    int signal[] = {1, 2, 3, 4, 5, 6};\n    float output[4];\n    movingAverage(signal, 6, 3, output);\n    for (int i = 0; i < 4; i++) printf("%.2f ", output[i]);\n    return 0;\n}`,
    cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<double> movingAverage(vector<int>& signal, int k) {\n    // Your code here\n    return {};\n}\n\nint main() {\n    vector<int> signal = {1, 2, 3, 4, 5, 6};\n    auto result = movingAverage(signal, 3);\n    for (double v : result) cout << v << " ";\n    return 0;\n}`,
    java: `import java.util.*;\n\nclass Main {\n    public double[] movingAverage(int[] signal, int k) {\n        // Your code here\n        return new double[]{};\n    }\n    \n    public static void main(String[] args) {\n        Main sol = new Main();\n        System.out.println(Arrays.toString(sol.movingAverage(new int[]{1,2,3,4,5,6}, 3)));\n    }\n}`,
    python: `def moving_average(signal, k):\n    # Your code here\n    pass\n\nprint(moving_average([1, 2, 3, 4, 5, 6], 3))`,
    javascript: `function movingAverage(signal, k) {\n    // Your code here\n}\n\nconsole.log(movingAverage([1, 2, 3, 4, 5, 6], 3));`,
  },
  fibonacci: {
    c: `#include <stdio.h>\n\nlong long fibonacci(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    for (int i = 0; i <= 10; i++)\n        printf("%lld ", fibonacci(i));\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nlong long fibonacci(int n) {\n    // Your code here\n    return 0;\n}\n\nint main() {\n    for (int i = 0; i <= 10; i++)\n        cout << fibonacci(i) << " ";\n    return 0;\n}`,
    java: `class Main {\n    public long fibonacci(int n) {\n        // Your code here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Main sol = new Main();\n        for (int i = 0; i <= 10; i++)\n            System.out.print(sol.fibonacci(i) + " ");\n    }\n}`,
    python: `def fibonacci(n):\n    # Your code here\n    pass\n\nfor i in range(11):\n    print(fibonacci(i), end=' ')`,
    javascript: `function fibonacci(n) {\n    // Your code here\n}\n\nfor (let i = 0; i <= 10; i++)\n    process.stdout.write(fibonacci(i) + ' ');`,
  },
  checkPow2: {
    c: `#include <stdio.h>\n#include <stdbool.h>\n\nbool isPowerOfTwo(int n) {\n    // Your code here using bit manipulation\n    return false;\n}\n\nint main() {\n    printf("%d\\n", isPowerOfTwo(16));\n    printf("%d\\n", isPowerOfTwo(6));\n    printf("%d\\n", isPowerOfTwo(1));\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nbool isPowerOfTwo(int n) {\n    // Your code here using bit manipulation\n    return false;\n}\n\nint main() {\n    cout << isPowerOfTwo(16) << endl;\n    cout << isPowerOfTwo(6) << endl;\n    cout << isPowerOfTwo(1) << endl;\n    return 0;\n}`,
    java: `class Main {\n    public boolean isPowerOfTwo(int n) {\n        // Your code here using bit manipulation\n        return false;\n    }\n    \n    public static void main(String[] args) {\n        Main sol = new Main();\n        System.out.println(sol.isPowerOfTwo(16));\n        System.out.println(sol.isPowerOfTwo(6));\n        System.out.println(sol.isPowerOfTwo(1));\n    }\n}`,
    python: `def is_power_of_two(n):\n    # Your code here using bit manipulation\n    pass\n\nprint(is_power_of_two(16))\nprint(is_power_of_two(6))\nprint(is_power_of_two(1))`,
    javascript: `function isPowerOfTwo(n) {\n    // Your code here using bit manipulation\n}\n\nconsole.log(isPowerOfTwo(16));\nconsole.log(isPowerOfTwo(6));\nconsole.log(isPowerOfTwo(1));`,
  },
};

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

Return the answer in any order.`,
    difficulty: "easy",
    category: "arrays",
    subject: "data-structures",
    tags: ["array", "hash-table"],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists"],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6" },
    ],
    testCases: [
      { input: "[2,7,11,15] 9", expectedOutput: "0 1" },
      { input: "[3,2,4] 6", expectedOutput: "1 2" },
      { input: "[3,3] 6", expectedOutput: "0 1" },
      { input: "[1,5,3,7] 8", expectedOutput: "1 2", isHidden: true },
    ],
    hints: [
      "A brute-force approach uses O(n²) time — can you do better?",
      "Think about using a hash map to store values you've seen.",
      "For each number, check if (target - number) exists in your hash map.",
    ],
    starterCode: STARTER.twoSum,
    timeLimit: 2000,
    memoryLimit: 256,
    etcRelevance: "Hash maps are used in signal processing lookup tables and communication protocol implementations.",
  },
  {
    id: "count-set-bits",
    title: "Count Set Bits (Hamming Weight)",
    description: `Write a function that takes an unsigned integer and returns the number of **set bits** (1-bits) in its binary representation.

This is also known as the **Hamming weight** or **popcount** — a fundamental concept in digital electronics, error detection, and data communication.

**Example:** 5 in binary is \`101\` → 2 set bits.`,
    difficulty: "easy",
    category: "bit-manipulation",
    subject: "digital-electronics",
    tags: ["bit-manipulation", "digital-electronics"],
    constraints: ["0 ≤ n ≤ 2³¹ - 1"],
    examples: [
      { input: "n = 5", output: "2", explanation: "5 in binary = 101 → 2 set bits" },
      { input: "n = 7", output: "3", explanation: "7 in binary = 111 → 3 set bits" },
      { input: "n = 128", output: "1", explanation: "128 = 10000000 → 1 set bit" },
    ],
    testCases: [
      { input: "5", expectedOutput: "2" },
      { input: "7", expectedOutput: "3" },
      { input: "128", expectedOutput: "1" },
      { input: "0", expectedOutput: "0" },
      { input: "2147483647", expectedOutput: "31", isHidden: true },
    ],
    hints: [
      "Loop through all 32 bits using a mask.",
      "Brian Kernighan's trick: n & (n-1) clears the rightmost set bit.",
      "Most languages have a built-in popcount — can you implement it manually first?",
    ],
    starterCode: STARTER.bitCount,
    timeLimit: 1000,
    memoryLimit: 64,
    etcRelevance: "Bit counting is fundamental in digital circuits, parity checking, Hamming error correction codes, and CDMA chip detection.",
  },
  {
    id: "moving-average",
    title: "Moving Average Filter",
    description: `Implement a **moving average (sliding window)** filter for a signal array.

Given a signal array and window size \`k\`, return an array of moving averages where each value is the average of the current and previous \`k-1\` elements.

This is the simplest digital low-pass filter used in DSP and embedded sensor data processing.

**Output length:** \`n - k + 1\` (only complete windows)`,
    difficulty: "easy",
    category: "arrays",
    subject: "dsp",
    tags: ["sliding-window", "arrays", "dsp", "signal-processing"],
    constraints: ["1 ≤ k ≤ n ≤ 10⁵", "k ≤ n", "-10⁴ ≤ signal[i] ≤ 10⁴"],
    examples: [
      { input: "signal = [1,2,3,4,5,6], k = 3", output: "[2.00, 3.00, 4.00, 5.00]", explanation: "avg(1,2,3)=2, avg(2,3,4)=3, avg(3,4,5)=4, avg(4,5,6)=5" },
      { input: "signal = [10,20,30], k = 2", output: "[15.00, 25.00]", explanation: "avg(10,20)=15, avg(20,30)=25" },
    ],
    testCases: [
      { input: "[1,2,3,4,5,6] 3", expectedOutput: "2.00 3.00 4.00 5.00" },
      { input: "[10,20,30] 2", expectedOutput: "15.00 25.00" },
      { input: "[5] 1", expectedOutput: "5.00" },
      { input: "[1,3,5,7,9,11] 4", expectedOutput: "4.00 6.00 8.00", isHidden: true },
    ],
    hints: [
      "Naive: compute sum of each window — O(n*k).",
      "Optimized: maintain a running sum, subtract the leftmost element and add the new rightmost — O(n).",
      "Think of this like a shift register in digital hardware.",
    ],
    starterCode: STARTER.movingAvg,
    timeLimit: 2000,
    memoryLimit: 256,
    etcRelevance: "Moving average filters are used in sensor fusion (IMU, ADC data), noise reduction in embedded systems, and digital FIR filter design.",
  },
  {
    id: "fibonacci-dp",
    title: "Fibonacci Number (DP Approach)",
    description: `Compute the **n-th Fibonacci number** using an efficient approach.

The Fibonacci sequence: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n ≥ 2.

**Implement this using dynamic programming or iterative approach** — the recursive O(2ⁿ) solution will time out for large inputs.

This problem tests your understanding of memoization and iterative DP — foundational algorithmic thinking.`,
    difficulty: "easy",
    category: "dynamic-programming",
    subject: "algorithms",
    tags: ["dynamic-programming", "recursion", "memoization"],
    constraints: ["0 ≤ n ≤ 50"],
    examples: [
      { input: "n = 0", output: "0", explanation: "F(0) = 0" },
      { input: "n = 1", output: "1", explanation: "F(1) = 1" },
      { input: "n = 10", output: "55", explanation: "F(10) = 55" },
    ],
    testCases: [
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "10", expectedOutput: "55" },
      { input: "20", expectedOutput: "6765" },
      { input: "45", expectedOutput: "1134903170", isHidden: true },
    ],
    hints: [
      "Recursive solution works but is O(2ⁿ) — too slow for n=50.",
      "Store previously computed results (memoization) to avoid recomputation.",
      "Bottom-up DP: build from F(0) to F(n) iteratively — you only need two variables.",
    ],
    starterCode: STARTER.fibonacci,
    timeLimit: 1000,
    memoryLimit: 64,
    etcRelevance: "Recursive algorithms and their optimization appear in signal processing, codec design, and tree-based data structure operations in embedded systems.",
  },
  {
    id: "power-of-two",
    title: "Power of Two (Bit Trick)",
    description: `Given an integer \`n\`, return \`true\` if it is a **power of two**, otherwise return \`false\`.

**Key constraint:** Solve this in **O(1) time and O(1) space** using a single bit manipulation trick.

**Hint:** Powers of two in binary always have exactly one set bit:
- 1 = 0001
- 2 = 0010
- 4 = 0100
- 8 = 1000

This bit trick is commonly used in embedded firmware to check memory alignment and timer prescaler values.`,
    difficulty: "easy",
    category: "bit-manipulation",
    subject: "digital-electronics",
    tags: ["bit-manipulation", "math", "embedded"],
    constraints: ["-2³¹ ≤ n ≤ 2³¹ - 1"],
    examples: [
      { input: "n = 16", output: "true", explanation: "16 = 10000 in binary — exactly one set bit" },
      { input: "n = 6", output: "false", explanation: "6 = 110 in binary — two set bits" },
      { input: "n = 1", output: "true", explanation: "1 = 1 = 2⁰" },
    ],
    testCases: [
      { input: "16", expectedOutput: "true" },
      { input: "6", expectedOutput: "false" },
      { input: "1", expectedOutput: "true" },
      { input: "0", expectedOutput: "false" },
      { input: "-16", expectedOutput: "false", isHidden: true },
      { input: "1073741824", expectedOutput: "true", isHidden: true },
    ],
    hints: [
      "Powers of two have exactly one set bit — all others are 0.",
      "If n is a power of 2: what happens when you compute n & (n-1)?",
      "Single line solution: return n > 0 && (n & (n-1)) == 0",
    ],
    starterCode: STARTER.checkPow2,
    timeLimit: 500,
    memoryLimit: 32,
    etcRelevance: "This trick is used in embedded firmware for checking memory alignment, timer prescalers, and DMA transfer sizes which must be powers of two.",
  },
];

export const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getProblemById(id: string): CodingProblem | undefined {
  return CODING_PROBLEMS.find((p) => p.id === id);
}

export function getProblemsByDifficulty(diff: ProblemDifficulty): CodingProblem[] {
  return CODING_PROBLEMS.filter((p) => p.difficulty === diff);
}

export function getProblemsByCategory(cat: ProblemCategory): CodingProblem[] {
  return CODING_PROBLEMS.filter((p) => p.category === cat);
}
