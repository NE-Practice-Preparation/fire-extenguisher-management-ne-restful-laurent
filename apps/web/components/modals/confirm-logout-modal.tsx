"use client"

import { LogOut, X } from "lucide-react"

export function ConfirmLogoutModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl animate-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F2] text-[#BE123C]">
              <LogOut className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#101828]">Log out</h3>
              <p className="mt-1 text-sm text-[#667085]">
                Are you sure you want to log out of your account?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 p-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-[#BE123C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9F1239] active:scale-[0.98]"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
