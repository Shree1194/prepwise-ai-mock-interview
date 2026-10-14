// ─── E&TC Subjects — backward-compatible re-export ───────────────────────────
// All subject data now lives in data/subjects/index.ts.
// This file re-exports everything so existing imports continue to work.

export type { ETCSubjectData as ETCSubject } from "@/data/subjects";
export {
  ETC_SUBJECTS,
  getSubjectById,
  getSubjectsByCategory,
  getTopicNamesForSubject,
  buildSubjectContextPrompt,
} from "@/data/subjects";

// ── Legacy shape (used by SubjectSelector, home page) ─────────────────────────
// The old ETCSubject had a flat `topics: string[]`. We expose a mapped list
// to satisfy existing components that destructure `subject.topics` as strings.

import { ETC_SUBJECTS } from "@/data/subjects";

export interface LegacyETCSubject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  topics: string[];
}

export const etcSubjects: LegacyETCSubject[] = ETC_SUBJECTS.map((s) => ({
  id: s.id,
  name: s.name,
  icon: s.icon,
  color: s.color,
  description: s.description,
  topics: s.topics.map((t) => t.name),
}));

// ── Question bank ─────────────────────────────────────────────────────────────
// Static fallback questions kept for the legacy flow.
// The AI question generator in vapi/generate/route.ts is the primary path.

export const etcQuestionBank: Record<string, string[]> = {
  "digital-communication": [
    "What is the difference between AM and digital modulation? Why is digital communication preferred?",
    "Explain the concept of PCM. What are the steps involved in pulse code modulation?",
    "What is Shannon's channel capacity theorem? State the formula and explain each term.",
    "Differentiate between ASK, FSK, and PSK modulation techniques.",
    "What is QPSK? How does it differ from BPSK in terms of bandwidth efficiency?",
    "Explain the concept of spread spectrum communication. What are its advantages?",
    "What is OFDM? Where is it used in modern communication systems?",
    "What are Hamming codes? Explain how they help in error correction.",
    "Describe the working of a matched filter receiver.",
    "What is the Nyquist sampling theorem? What happens if sampling frequency is below Nyquist rate?",
  ],
  "communication-engineering": [
    "What is amplitude modulation? Derive the expression for a standard AM wave.",
    "What is the modulation index in AM? What happens if modulation index exceeds 1?",
    "Explain FM modulation. How is it different from AM in terms of noise immunity?",
    "What is a superheterodyne receiver? Explain its block diagram.",
    "What is SSB modulation? What are its advantages over DSB?",
    "Define sensitivity and selectivity of a radio receiver.",
    "Explain the concept of image frequency in superheterodyne receivers.",
    "What is phase modulation (PM)? How is it related to FM?",
    "Describe different types of noise in communication systems.",
    "What is a varactor diode and where is it used in communication circuits?",
  ],
  "signals-systems": [
    "State and explain the Fourier series. When can a signal be represented by a Fourier series?",
    "What is the Fourier transform? How does it differ from the Fourier series?",
    "Explain the Laplace transform and its region of convergence.",
    "What is the Z-transform? How is it used in discrete-time system analysis?",
    "Define convolution. How does convolution relate to LTI system output?",
    "What is an LTI system? State its properties.",
    "Explain the sampling theorem. What is aliasing?",
    "What is the transfer function of a system? How is it derived?",
    "Differentiate between energy signals and power signals with examples.",
    "What is impulse response? How does it characterize an LTI system?",
  ],
  "microprocessors": [
    "Describe the architecture of the 8085 microprocessor.",
    "What is the difference between a microcontroller and a microprocessor?",
    "Explain the register set of the 8051 microcontroller.",
    "How do timers work in the 8051? What are the different timer modes?",
    "What are interrupts? Explain the interrupt structure of 8085.",
    "What is UART communication? How is it configured in 8051?",
    "Explain the difference between I2C and SPI protocols.",
    "What is PWM? How can it be generated using a microcontroller?",
    "Describe the basics of ARM Cortex-M architecture.",
    "What is the difference between Harvard and Von Neumann architecture?",
  ],
  "embedded-systems": [
    "What is an RTOS? Name some popular real-time operating systems.",
    "Explain the difference between hard real-time and soft real-time systems.",
    "What is task scheduling in RTOS? Describe preemptive vs cooperative scheduling.",
    "What is a semaphore? How is it used for task synchronization?",
    "What is a mutex? How does it differ from a binary semaphore?",
    "Explain the concept of priority inversion and how to avoid it.",
    "What is a watchdog timer? Why is it used in embedded systems?",
    "Describe different memory types used in embedded systems (Flash, SRAM, EEPROM).",
    "What is bootloader? What is its role in embedded systems?",
    "How do you approach power optimization in an embedded system design?",
  ],
  "analog-electronics": [
    "Explain the working of a PN junction diode.",
    "What is the difference between a Zener diode and a regular diode? What is Zener breakdown?",
    "Describe the three configurations of a BJT transistor and their characteristics.",
    "What is the DC load line? How do you determine the operating Q-point?",
    "Explain the working of a MOSFET. What are its advantages over BJT?",
    "What is an op-amp? State the ideal characteristics of an op-amp.",
    "Explain the inverting and non-inverting amplifier configurations of an op-amp.",
    "What is a Colpitts oscillator? How does it generate oscillations?",
    "Explain the difference between active and passive filters.",
    "What is feedback in amplifiers? Explain positive and negative feedback.",
  ],
  "digital-electronics": [
    "What is the difference between a combinational and sequential circuit?",
    "Explain K-map minimization for a 4-variable Boolean function.",
    "What are the different types of flip-flops? Explain JK flip-flop operation.",
    "Design a 3-bit binary counter using JK flip-flops.",
    "What is the difference between a multiplexer and a demultiplexer?",
    "Explain the working of a full adder circuit.",
    "What is a Mealy machine? How does it differ from a Moore machine?",
    "What are universal gates? Prove that NAND is a universal gate.",
    "Explain setup time and hold time of a flip-flop.",
    "What is metastability in sequential circuits and how is it handled?",
  ],
  "data-structures": [
    "What is the difference between an Array and a Linked List? When would you use one over the other?",
    "Explain the four main pillars of Object-Oriented Programming (OOP).",
    "What are the primary differences between SQL and NoSQL databases?",
    "Describe the OSI model. What is the role of the Network and Transport layers?",
    "Explain the difference between a process and a thread in an Operating System.",
    "What is a deadlock in OS? What are the necessary conditions for a deadlock to occur?",
    "What is a Binary Search Tree? What is its time complexity for searching an element?",
    "Explain the concepts of Inheritance and Polymorphism in typical programming languages.",
    "What is a REST API? State the common HTTP methods and their conventional uses.",
    "Describe vertical vs horizontal scaling in System Design. What are their pros and cons?",
  ],
};

export function getQuestionsForSubject(subjectId: string, count: number = 5): string[] {
  if (subjectId === "mixed") {
    const allQuestions: string[] = [];
    Object.values(etcQuestionBank).forEach((questions) => {
      allQuestions.push(...questions);
    });
    return shuffleArray(allQuestions).slice(0, count);
  }

  const questions = etcQuestionBank[subjectId] || [];
  return shuffleArray(questions).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const etcInterviewerConfig = {
  name: "E&TC Interviewer",
  firstMessage:
    "Hello! Welcome to your E&TC Mock Interview. I'm your AI interviewer today. I'll be asking you some technical questions related to Electronics and Telecommunication. Please take your time to answer clearly. Let's get started!",
  systemPrompt: `You are a professional interviewer specializing in Electronics and Telecommunication (E&TC) engineering. You are conducting a technical mock interview with a final-year engineering student.

Interview Guidelines:
1. Follow the structured question flow provided: {{questions}}
2. Ask questions clearly and professionally
3. Listen to the student's answers and acknowledge them
4. Ask brief follow-up questions if the answer is incomplete or vague
5. Be encouraging but honest in your assessment
6. Keep the conversation natural and conversational
7. After the last question, thank the student and end the interview professionally

Important:
- Keep your responses concise (1-3 sentences)
- Be warm but professional
- Do not reveal answers to questions
- If an answer is partially correct, gently probe for more depth
- End the interview after all questions are covered`,
};
