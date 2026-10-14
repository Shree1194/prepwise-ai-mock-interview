"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CONNECTION_SLOW_MS = 8000;
const CONNECTION_TIMEOUT_MS = 25000;
const VAPI_RESET_DELAY_MS = 400;

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const getNestedValue = (value: unknown, path: string[]): unknown => {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
};

const getConnectionErrorMessage = (error: unknown): string => {
  const rawMessage =
    error instanceof Error
      ? error.message
      : [
          getNestedValue(error, ["error", "message"]),
          getNestedValue(error, ["error", "errorMsg"]),
          getNestedValue(error, ["message"]),
          getNestedValue(error, ["errorMsg"]),
          getNestedValue(error, ["type"]),
          getNestedValue(error, ["stage"]),
        ].find((value): value is string => typeof value === "string" && value.length > 0);

  if (rawMessage) {
    const message = rawMessage.toLowerCase();

    if (message.includes("permission") || message.includes("microphone")) {
      return "Microphone access is blocked. Please allow microphone permission in the browser and try again.";
    }

    if (message.includes("assistant-not-found") || message.includes("assistant not found")) {
      return "Vapi could not find the assistant. Check that the app is using the correct assistant or workflow ID.";
    }

    if (message.includes("workflow") && message.includes("not found")) {
      return "Vapi could not find the workflow. Check NEXT_PUBLIC_VAPI_WORKFLOW_ID and save the workflow in Vapi.";
    }

    if (message.includes("unauthorized") || message.includes("401")) {
      return "Vapi rejected the web token. Check NEXT_PUBLIC_VAPI_WEB_TOKEN and restart the server.";
    }

    if (message.includes("insufficient") || message.includes("credits") || message.includes("quota")) {
      return "Vapi could not start because the provider has insufficient credits or quota.";
    }

    if (message.includes("timeout")) {
      return "The AI interviewer took too long to connect. Please check your network and try again.";
    }

    return rawMessage;
  }

  return "Unable to connect to the AI interviewer. Please try again.";
};

const withConnectionTimeout = async <T,>(startCall: Promise<T>): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      startCall,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Vapi connection timeout"));
        }, CONNECTION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stopVapiSilently = async () => {
  try {
    await vapi.stop();
  } catch {
    // Best-effort cleanup for stale SDK state.
  }
};

const startWithStaleCallRecovery = async (
  startCall: () => Promise<unknown>
) => {
  let call = await withConnectionTimeout(startCall());
  if (call) return call;

  await stopVapiSilently();
  await delay(VAPI_RESET_DELAY_MS);

  call = await withConnectionTimeout(startCall());
  if (call) return call;

  await stopVapiSilently();
  return null;
};

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const savingRef = useRef(false);
  const messagesRef = useRef<SavedMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSlowConnectionHint, setShowSlowConnectionHint] = useState(false);
  const isStartingRef = useRef(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === CallStatus.ACTIVE) {
      interval = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    const onCallStart = () => {
      isStartingRef.current = false;
      setCallStatus(CallStatus.ACTIVE);
      setElapsedTime(0);
      setConnectionError(null);
      setShowSlowConnectionHint(false);
    };

    const onCallEnd = () => {
      isStartingRef.current = false;
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
      setShowSlowConnectionHint(false);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        messagesRef.current = [...messagesRef.current, newMessage];
        setMessages(messagesRef.current);
        if (message.role === "assistant") {
          setQuestionCount((c) => c + 1);
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      isStartingRef.current = false;
      setConnectionError(getConnectionErrorMessage(error));
      setIsSpeaking(false);
      setShowSlowConnectionHint(false);
      setCallStatus((status) =>
        status === CallStatus.CONNECTING ? CallStatus.INACTIVE : status
      );
      void stopVapiSilently();
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus !== CallStatus.CONNECTING) {
      setShowSlowConnectionHint(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowSlowConnectionHint(true);
    }, CONNECTION_SLOW_MS);

    return () => clearTimeout(timeoutId);
  }, [callStatus]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      if (savingRef.current) return;
      if (!messages.some(message => message.role === "user" && message.content.trim())) {
        setConnectionError("No answers were recorded. Start a new call and allow microphone access.");
        return;
      }
      savingRef.current = true;
      setIsGeneratingFeedback(true);
      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!, userId: userId!, transcript: messages, feedbackId,
        });
        if (!success || !id) throw new Error("Save failed");
        router.push(`/interview/${interviewId}/feedback`);
      } catch {
        setConnectionError("Your feedback could not be saved. Keep this page open and retry saving below.");
        setIsGeneratingFeedback(false);
        savingRef.current = false;
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messagesRef.current);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, saveAttempt]);

  const handleCall = async () => {
    if (
      isStartingRef.current ||
      callStatus === CallStatus.CONNECTING ||
      callStatus === CallStatus.ACTIVE
    ) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;

    if (!token) {
      setConnectionError("Vapi web token is missing. Add NEXT_PUBLIC_VAPI_WEB_TOKEN and restart the server.");
      return;
    }

    if (type === "generate" && !workflowId) {
      setConnectionError("Vapi workflow ID is missing. Add NEXT_PUBLIC_VAPI_WORKFLOW_ID and restart the server.");
      return;
    }

    setConnectionError(null);
    setShowSlowConnectionHint(false);
    isStartingRef.current = true;
    setCallStatus(CallStatus.CONNECTING);

    try {
      await stopVapiSilently();
      await delay(VAPI_RESET_DELAY_MS);

      if (type === "generate") {
        const call = await startWithStaleCallRecovery(() =>
          vapi.start(
            undefined,
            undefined,
            undefined,
            workflowId!,
            {
              variableValues: {
                username: userName,
                userid: userId,
              },
            }
          )
        );
        if (!call) {
          setCallStatus(CallStatus.INACTIVE);
          setConnectionError("The previous AI interviewer connection could not be cleared automatically. Please refresh the page and try again.");
          return;
        }
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        const call = await startWithStaleCallRecovery(() =>
          vapi.start(interviewer, {
            variableValues: {
              questions: formattedQuestions,
            },
          })
        );
        if (!call) {
          setCallStatus(CallStatus.INACTIVE);
          setConnectionError("The previous AI interviewer connection could not be cleared automatically. Please refresh the page and try again.");
          return;
        }
      }
    } catch (error) {
      setConnectionError(getConnectionErrorMessage(error));
      setCallStatus(CallStatus.INACTIVE);
      setIsSpeaking(false);
      setShowSlowConnectionHint(false);
      await stopVapiSilently();
    } finally {
      isStartingRef.current = false;
    }
  };

  const handleDisconnect = async () => {
    isStartingRef.current = false;
    setConnectionError(null);
    setShowSlowConnectionHint(false);
    await stopVapiSilently();
    setCallStatus(CallStatus.FINISHED);
  };

  const isActive = callStatus === CallStatus.ACTIVE;
  const isConnecting = callStatus === CallStatus.CONNECTING;
  const isFinished = callStatus === CallStatus.FINISHED;

  return (
    <div className="w-full flex flex-col gap-6 relative min-h-[400px]">
      {isFinished && connectionError && messages.some(message => message.role === "user") && !isGeneratingFeedback && <button className="btn-primary" onClick={() => setSaveAttempt(attempt => attempt + 1)}>Retry saving feedback</button>}
      {/* Loading Overlay when generating feedback */}
      {isGeneratingFeedback && (
        <div className="absolute -inset-4 bg-[#0a0f18]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-xl animate-fadeIn">
          <div className="flex gap-2 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-12 bg-success-100 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Analyzing Performance...</h2>
          <p className="text-light-100 text-center max-w-sm px-4">
            Calculating your final marks and identifying specific areas where you can improve...
          </p>
        </div>
      )}
      {/* Interview Status Bar */}
      {(isActive || isConnecting) && (
        <div className="glass-card flex items-center justify-between px-6 py-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className={cn("w-2.5 h-2.5 rounded-full", isActive ? "bg-success-100 animate-pulse" : "bg-yellow-400 animate-pulse")} />
            <span className="text-sm font-medium text-white">
              {isActive ? "Interview in progress" : "Connecting..."}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {isActive && (
              <>
                <div className="flex items-center gap-2 text-light-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono text-white font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-light-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white">
                    {Math.floor(questionCount / 2)} / {questions?.length || 5} Qs
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Interview View */}
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3 className="text-center text-primary-100 mt-5">AI Interviewer</h3>
          {isSpeaking && (
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary-200 animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 16}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="User"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
            {isActive && !isSpeaking && messages.length > 0 && (
              <div className="flex items-center gap-2 mt-2 text-success-100 text-sm">
                <span className="w-2 h-2 rounded-full bg-success-100 animate-pulse" />
                Listening...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="w-full flex justify-center gap-4">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={isConnecting || isFinished}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative flex items-center gap-2">
              {isConnecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : isFinished ? (
                "Interview Ended"
              ) : (
                <>🎙️ Start Interview</>
              )}
            </span>
          </button>
        ) : (
          <button
            className="btn-disconnect flex items-center gap-2"
            onClick={() => handleDisconnect()}
          >
            ⏹️ End Interview
          </button>
        )}
      </div>

      {connectionError && (
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100"
        >
          {connectionError}
        </div>
      )}

      {/* Loading Overlay when connecting */}
      {isConnecting && (
        <div className="flex flex-col items-center gap-3 animate-fadeIn">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-8 bg-primary-200 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="max-w-md text-center text-light-100 text-sm">
            {showSlowConnectionHint
              ? "Still connecting. Allow microphone access if prompted, and check your network if this continues."
              : "Initializing AI interviewer..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Agent;
