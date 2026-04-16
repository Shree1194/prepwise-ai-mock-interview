import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";

const bodySchema = z.object({
  role: z.string(),
  level: z.string(),
  techstack: z.array(z.string()),
  type: z.string(),
  amount: z.number(),
  userId: z.string().optional(),
  userid: z.string().optional(),
  // Pre-generated questions from E&TC subject selector
  questions: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = bodySchema.parse(body);
    const userId = parsedBody.userId || parsedBody.userid;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { role, level, techstack, type, amount, questions: preGeneratedQuestions } = parsedBody;

    let questions: string[];

    // If questions were pre-generated (E&TC subject flow), use them directly
    if (preGeneratedQuestions && preGeneratedQuestions.length > 0) {
      questions = preGeneratedQuestions;
    } else {
      // Generate questions via Gemini (standard flow)
      const { object } = await generateObject({
        model: google("gemini-1.5-flash") as any,
        schema: z.object({
          questions: z.array(z.string()),
        }),
        prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack.join(", ")}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          
          Thank you! <3
      `,
      });
      questions = object.questions;
    }

    const interviewData = {
      role,
      level,
      techstack,
      type,
      questions,
      userId,
      createdAt: new Date().toISOString(),
      finalized: true, // E&TC interviews are immediately available
    };

    const docRef = await db.collection("interviews").add(interviewData);

    return NextResponse.json({
      interviewId: docRef.id,
      questions,
    });
  } catch (error) {
    console.error("Error generating interview:", error);
    return NextResponse.json(
      { error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}
