import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Analysis = {
  id: string;
  filename?: string;
  genre: string;
  probabilities: { label: string; probability: number }[];
  createdAt: string;
};

export default function Dashboard() {
  const [items, setItems] = useState<Analysis[]>([]);
  const [page, setPage] = useState(1);
  const per = 8;

  useEffect(() => {
    api<Analysis[]>("/api/history")
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / per));
  const pageItems = useMemo(() => items.slice((page - 1) * per, page * per), [items, page]);

  const genreCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) m[it.genre] = (m[it.genre] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const chartData = {
    labels: genreCounts.map((g) => g[0]),
    datasets: [{ label: "Analyses", data: genreCounts.map((g) => g[1]), backgroundColor: "#7c3aed" }],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold">Your dashboard</h1>
        <p className="mt-2 text-foreground/70">A history of your previous track analyses.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="glass p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold">Recent analyses</h3>
            <div className="mt-4 grid gap-3">
              {pageItems.length === 0 ? (
                <div className="p-6 text-sm text-foreground/70">No analyses yet. Upload a track from the home page.</div>
              ) : (
                pageItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="text-sm font-medium">{it.filename || "(uploaded)"}</div>
                      <div className="mt-1 text-xs text-foreground/70">{new Date(it.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{it.genre}</div>
                      <div className="mt-1 text-xs text-foreground/70">Top probability: {(it.probabilities[0]?.probability * 100 || 0).toFixed(1)}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-md border px-3 py-1" disabled={page <= 1}>
                Prev
              </button>
              <div className="text-sm text-foreground/70">Page {page} of {pages}</div>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="rounded-md border px-3 py-1" disabled={page >= pages}>
                Next
              </button>
            </div>
          </div>

          <div className="glass p-4">
            <h3 className="text-lg font-semibold">Genre distribution</h3>
            <div className="mt-4">
              <Bar data={chartData} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
