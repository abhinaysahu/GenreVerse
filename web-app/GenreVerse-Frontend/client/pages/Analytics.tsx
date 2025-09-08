import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [data, setData] = useState<{ genre: string; count: number }[]>([]);
  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold">Platform analytics</h1>
        <p className="mt-2 text-foreground/70">Aggregated insights across GenreVerse users.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.length === 0 ? (
            <div className="glass p-6">No analytics yet</div>
          ) : (
            data.map((d) => (
              <div key={d.genre} className="glass p-6">
                <h3 className="font-semibold">{d.genre}</h3>
                <div className="mt-1 text-sm text-foreground/70">{d.count} analyses</div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
