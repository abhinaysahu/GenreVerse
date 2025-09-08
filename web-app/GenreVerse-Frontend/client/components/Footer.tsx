export default function Footer() {
  return (
    <footer className="border-t bg-white/60 backdrop-blur dark:bg-black/30 dark:border-white/10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:h-16 md:flex-row">
        <p className="text-sm text-foreground/60">© {new Date().getFullYear()} GenreVerse. All rights reserved.</p>
        <div className="text-sm text-foreground/60">Built with React, Express, MongoDB, and TensorFlow.</div>
      </div>
    </footer>
  );
}
