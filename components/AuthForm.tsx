"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div
      className="w-full max-w-md"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "2.5rem 2rem",
      }}
    >
      {/* Logo & Branding */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex flex-row gap-2 items-center">
          <Image src="/logo.svg" alt="PrepWise Logo" height={36} width={42} />
          <div>
            <h2
              className="text-primary-100 leading-tight"
              style={{ fontSize: "1.75rem" }}
            >
              PrepWise
            </h2>
            <p className="text-xs text-light-400 -mt-1">E&TC Edition</p>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl text-white mb-1">
            {isSignIn ? "Welcome Back 👋" : "Create Account 🚀"}
          </h3>
          <p className="text-sm text-light-100">
            {isSignIn
              ? "Sign in to continue your interview practice"
              : "Join E&TC students preparing with AI"}
          </p>
        </div>
      </div>

      {/* Subjects Preview */}
      <div className="flex gap-2 justify-center flex-wrap mb-6">
        {["📡 Digital Comm", "⚡ Electronics", "🔲 8051/ARM"].map((s) => (
          <span
            key={s}
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#a5b4fc",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4 form"
        >
          {!isSignIn && (
            <FormField
              control={form.control}
              name="name"
              label="Full Name"
              placeholder="Your full name"
              type="text"
            />
          )}

          <FormField
            control={form.control}
            name="email"
            label="Email Address"
            placeholder="your@email.com"
            type="email"
          />

          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />

          <Button className="btn" type="submit">
            {isSignIn ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </Form>

      <p className="text-center mt-5 text-sm text-light-100">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}
        <Link
          href={!isSignIn ? "/sign-in" : "/sign-up"}
          className="font-bold text-primary-200 ml-1 hover:text-primary-100 transition-colors"
        >
          {!isSignIn ? "Sign In" : "Sign Up"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
