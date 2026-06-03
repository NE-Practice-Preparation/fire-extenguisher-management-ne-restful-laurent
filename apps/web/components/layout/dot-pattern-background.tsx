import type { ReactNode } from "react"

export function DotPatternBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate">
      <div
        className="absolute inset-x-0 top-0 h-[60vh] -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148, 163, 184, 0.8) 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 85% 65% at 50% 0%, black 48%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 0%, black 48%, transparent 100%)",
        }}
      />

      {children}
    </div>
  )
}
