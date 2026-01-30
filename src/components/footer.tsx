import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-md">StudyConnect</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudyConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
