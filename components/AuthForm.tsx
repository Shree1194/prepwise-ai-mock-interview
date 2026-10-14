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
  deleteUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import {
  FormControl,
  FormField as ControlledFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
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
          idToken: await userCredential.user.getIdToken(),
        });

        if (!result.success) {
          await deleteUser(userCredential.user).catch(() => undefined);
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

        const result = await signIn({
          email,
          idToken,
        });

        if (!result?.success) {
          await firebaseSignOut(auth).catch(() => undefined);
          toast.error(result?.message ?? "Sign in failed. Please try again.");
          return;
        }

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch {
      toast.error("Authentication failed. Please check your details and try again.");
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="auth-card w-full max-w-md">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex flex-row gap-2 items-center">
          <Image
            src="/logo.svg"
            alt="PrepWise Logo"
            height={34}
            width={39}
          />
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
            {isSignIn ? "Welcome back" : "Create your account"}
          </h3>
          <p className="text-sm text-light-100">
            {isSignIn
              ? "Sign in to continue your interview practice"
              : "Join E&TC students preparing with AI"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4 form"
        >
          {!isSignIn && (
            <ControlledFormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className="input"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
            autoComplete={isSignIn ? "current-password" : "new-password"}
          />

          <Button className="btn" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Please wait..." : isSignIn ? "Sign In" : "Create Account"}
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
