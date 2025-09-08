import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { saveAuth } from "@/lib/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Registration failed");
      }
      const data = await res.json();
      saveAuth(data.token, data.user);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md rounded-xl glass p-6">
          <h1 className="text-2xl font-bold">Create your GenreVerse account</h1>
          <p className="mt-2 text-sm text-foreground/70">Sign up to save your analyses and access private dashboard features.</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-md border px-3 py-2" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-md border px-3 py-2" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-md border px-3 py-2" />
            <div className="flex items-center gap-3">
              <button className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Create account</button>
              <a href="/login" className="text-sm text-foreground/70 hover:underline">Already have an account?</a>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
