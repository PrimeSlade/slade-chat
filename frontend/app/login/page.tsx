"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client"; // Import from your new file
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for sign up
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/dashboard",
    });
  };

  const handleSubmit = async () => {
    if (isSignUp) {
      await signUp.email(
        {
          email,
          password,
          name,
        },
        {
          onSuccess: () => router.push("/dashboard"),
          onError: (ctx) => alert(ctx.error.message),
        }
      );
    } else {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => router.push("/dashboard"),
          onError: (ctx) => alert(ctx.error.message),
        }
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>

        <div className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Name"
              className="w-full border p-2 rounded"
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          <button onClick={handleGoogleLogin}>Sign in with Google</button>
        </div>

        <p className="mt-4 text-center text-sm">
          {isSignUp ? "Already have an account?" : "No account?"}{" "}
          <button
            className="text-blue-500 underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
