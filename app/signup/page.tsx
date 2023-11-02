"use client";

import { FormEvent, useState } from "react";
import { getUserData, login, register } from "@/appwrite";
import { useUserStore } from "@/store/UserStore";
import z from "zod";
import { useRouter } from "next/navigation";

const User = z.object({
  name: z.string(),
  email: z
    .string()
    .email({
      message: "Invalid email",
    })
    .trim(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export default function SignUp() {
  const [formName, setFormName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const [setId, setName] = useUserStore((state) => [state.setId, state.setName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      User.parse({ name: formName, email: email, password: password });
      setError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
      return;
    }

    if (!error) {
      setLoading(true);
      register(email, password, formName)
        .then(() => {
          setLoading(false);
          login(email, password)
            .then(() => {
              setLoading(false);
              getUserData().then((account) => {
                setId(account.$id);
                setName(account.name);
                router.push("/");
              });
            })
            .catch((err) => {
              setLoading(false);
              setError(err.message);
            });
        })
        .catch((err) => {
          setLoading(false);
          setError(err.message);
        });
    }
  };

  return (
    <section className="h-screen flex justify-center items-center">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-pink-400 to-[#0055D1] rounded-md filter blur-3xl opacity-50 -z-50" />
      <form className="flex flex-col bg-white w-[300px] rounded-md p-6" onSubmit={handleSubmit}>
        <p className="text-lg font-bold text-center mb-6">Sign Up</p>
        {error && (
          <div className="px-1 py-2 mb-4 bg-red-500 opacity-80 text-white text-center rounded-md">
            {error}
          </div>
        )}
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          onChange={(e) => setFormName(e.target.value)}
          className="border rounded-md mb-2 outline-none p-1 px-2"
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md mb-2 outline-none p-1 px-2"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-md mb-5 outline-none p-1 px-2"
        />

        <button
          type="submit"
          disabled={!email || !password || !formName || loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2  font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          Sign up
        </button>
        <button
          type="button"
          className="mt-3 text-sm underline text-blue-900 hover:text-blue-500"
          onClick={() => router.push("/login")}
        >
          Do you already have an account? Log in!
        </button>
      </form>
    </section>
  );
}
