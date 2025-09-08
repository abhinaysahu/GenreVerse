import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { api } from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ genre: string; probabilities: { label: string; probability: number }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!file) return setError("Please choose an audio file");
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await api<{ genre: string; probabilities: { label: string; probability: number }[]; id?: string }>("/api/analyze", { method: "POST", body: fd });
      setResult({ genre: res.genre, probabilities: res.probabilities });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  const pieData = result
    ? {
        labels: result.probabilities.map((p) => p.label),
        datasets: [
          {
            data: result.probabilities.map((p) => Math.max(0.001, Math.round(p.probability * 100))),
            backgroundColor: ["#7c3aed", "#06b6d4", "#f97316", "#ef4444", "#eab308"],
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-900">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col gap-10 px-4 py-12">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">
              GenreVerse
              <span className="block text-2xl font-semibold text-foreground/60 mt-2">AI-powered music genre classifier</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/70">
              Upload any audio file and get an instant genre prediction powered by a convolutional neural network. View probability
              distributions, save analyses to your dashboard, and explore platform-wide trends.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#analyze" className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700">
                Try it now
              </a>
              <a href="/analytics" className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground">
                View analytics
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4">
              <Stat label="Model" value="CNN (Keras)" />
              <Stat label="Input" value="Mel spectrograms" />
              <Stat label="Accuracy" value="~86%" />
              <Stat label="Dataset" value="GTZAN" />
            </div>
          </div>

          <div id="analyze" className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold">Analyze a track</h3>
            <p className="mt-2 text-sm text-foreground/70">Upload an mp3/wav file and receive an instant genre prediction.</p>

            <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
              <label className="group relative flex h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-foreground/10 bg-transparent text-center hover:border-violet-400">
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="pointer-events-none">
                  <div className="text-sm font-medium">Drop an audio file here or click to select</div>
                  <div className="mt-2 text-xs text-foreground/60">MP3, WAV. Max 25MB</div>
                </div>
              </label>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50">
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
                <button type="button" onClick={() => { setFile(null); setResult(null); setError(null); }} className="rounded-md border px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground">
                  Reset
                </button>
                {file && <div className="ml-auto text-sm text-foreground/70">{file.name}</div>}
              </div>

              {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

              {result && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium">Predicted genre</h4>
                    <div className="mt-2 text-2xl font-bold">{result.genre}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Probability distribution</h4>
                    <div className="mt-2 w-full max-w-xs">
                      {pieData && <Pie data={pieData} />}
                    </div>
                  </div>
                </div>
              )}
            </form>

            <p className="mt-4 text-xs text-foreground/60">Files are forwarded to the ML microservice for prediction; no model runs in the browser.</p>
          </div>
        </section>

        <section className="rounded-xl bg-white/60 p-6 dark:bg-black/20">
          <h3 className="text-lg font-semibold">Platform insights</h3>
          <p className="mt-2 text-sm text-foreground/70">Community trends from all analyses (live)</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="glass p-4">
              <h4 className="text-sm font-medium">Most classified genres</h4>
              <div className="mt-3 text-sm text-foreground/70">Popular genres across the platform, updated in real-time.</div>
            </div>
            <div className="glass p-4">
              <h4 className="text-sm font-medium">Recent analyses</h4>
              <div className="mt-3 text-sm text-foreground/70">Login to see your personal history and revisit previous predictions.</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white/40 p-3 text-sm shadow-sm dark:bg-black/10">
      <div className="text-xs text-foreground/60">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
