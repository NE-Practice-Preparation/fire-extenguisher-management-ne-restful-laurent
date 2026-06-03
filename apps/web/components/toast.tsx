"use client"

import * as React from "react"
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ToastType = "success" | "error" | "info"

type Toast = {
  id: string
  title: string
  description?: string
  type: ToastType
}

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const remove = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback(
    (nextToast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID()
      setToasts((current) => [{ ...nextToast, id }, ...current].slice(0, 4))
      window.setTimeout(() => remove(id), 4500)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(420px,calc(100vw-2rem))] gap-3">
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }

  return context
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon =
    toast.type === "success" ? CheckCircle2 : toast.type === "error" ? TriangleAlert : Info

  return (
    <div
      className={cn(
        "animate-[toast-slide-in_220ms_ease-out] rounded-lg border bg-white p-4 shadow-lg dark:bg-[#16211f]",
        toast.type === "success" &&
          "border-[#0f766e]/25 text-[#0b4f49] dark:text-[#aef0e6]",
        toast.type === "error" &&
          "border-red-500/25 text-red-700 dark:text-red-200",
        toast.type === "info" &&
          "border-black/10 text-[#17211f] dark:border-white/10 dark:text-[#eef6f3]"
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm text-[#64736f] dark:text-[#b8c7c2]">
              {toast.description}
            </p>
          ) : null}
        </div>
        <Button
          aria-label="Close toast"
          className="size-7"
          onClick={onClose}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
