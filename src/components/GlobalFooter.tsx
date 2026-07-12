export function GlobalFooter() {
  return (
    <footer className="w-full border-t border-border bg-background py-8 mt-auto text-center transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center gap-1">
        <p className="text-sm text-foreground/80 font-medium">WeDoDare © {new Date().getFullYear()}</p>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          All rights reserved. Empowering developer productivity and insight sharing.
        </p>
      </div>
    </footer>
  );
}
