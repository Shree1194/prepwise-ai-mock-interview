"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    /* 
    const { object } = await generateObject({
      model: google("gemini-1.5-flash", {
        structuredOutputs: false,
      }) as any,
      schema: feedbackSchema,
      prompt: `...`,
      system: "..."
    });
    */

    // Simulate AI generation time for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Hardcoded mock generated score exactly as user requested since actual API fails
    const object = {
      totalScore: 82,
      categoryScores: [
        { name: "Communication Skills", score: 85, comment: "You communicated your ideas clearly and concisely throughout the interview." },
        { name: "Technical Knowledge", score: 75, comment: "Good understanding of core concepts, but missed some deeper architectural details." },
        { name: "Problem Solving", score: 80, comment: "Demonstrated strong logical flow when attempting to answer complex questions." },
        { name: "Cultural Fit", score: 90, comment: "Excellent professional demeanor and willingness to learn." },
        { name: "Confidence and Clarity", score: 80, comment: "Remained composed and confident even when challenged." },
      ],
      strengths: [
        "Excellent verbal communication.",
        "Strong structural approach to problem-solving.",
        "Maintained high confidence and professionalism."
      ],
      areasForImprovement: [
        "Deeper knowledge of System Architecture and Optimization.",
        "Provide more concrete real-world examples when explaining concepts.",
        "Take a moment to fully process multi-part questions before answering."
      ],
      finalAssessment: "You performed very well overall! You have an extremely solid foundation and excellent communication skills. By brushing up on some deeper technical optimizations and specific framework internals, you will be highly competitive!"
    };

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  if (!userId) return []; // Prevent Firestore crash

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return []; // Prevent Firestore crash if userId is missing

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
