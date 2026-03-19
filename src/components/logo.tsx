import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  // The 'relative' wrapper allows the 'fill' property to respect the dimensions
  // passed in via className (e.g., h-8 w-8).
  return (
    <div className={cn("relative shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="StudyConnect Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
