"use client";

import React, { useState } from "react";
import { UserPlus, X, Mail } from "lucide-react";
import { FormInput, FormSelect } from "@/components/ui/form-field";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (data: ModalData) => void;
  defaultRole?: string;
  variant?: "full" | "simple";
  title?: string;
  description?: string;
}

export interface ModalData {
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  onAction, 
  defaultRole,
  variant = "full",
  title,
  description
}: ModalProps) {
  const [formData, setFormData] = useState<ModalData>({
    firstName: "",
    lastName: "",
    email: "",
    role: defaultRole || "",
  });

  React.useEffect(() => {
    if (defaultRole) {
      setFormData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAction(formData);
    onClose();
    setFormData({ firstName: "", lastName: "", email: "", role: defaultRole || "" });
  };

  const roleOptions = [
    { label: "Supervisor", value: "Supervisor" },
    { label: "Curriculum evaluator", value: "Curriculum evaluator" },
    { label: "Evaluator", value: "Evaluator" },
  ];

  const defaultTitle = variant === "full" ? "Invite User" : "Invite User";
  const defaultDescription = variant === "full" 
    ? "Invited users will receive access to manage applications and perform evaluations." 
    : "Invited users will receive access to evaluate applications and perform site visits.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 transition-opacity font-sans">
      <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="h-10 w-13 mt-2 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-[#BE123C]" />
            </div>
            <div>
              <h3 className="text-lg text-[#323539] font-medium">{title || defaultTitle}</h3>
              <p className="text-sm text-[#858C95] w-full">
                {description || defaultDescription}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            type="button"
            className="p-2 cursor-pointer h-10 mt-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {variant === "full" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  value={formData.firstName || ""}
                  onChange={(value) => setFormData({ ...formData, firstName: value })}
                  placeholder="First name"
                  required
                />
                <FormInput
                  label="Last Name"
                  value={formData.lastName || ""}
                  onChange={(value) => setFormData({ ...formData, lastName: value })}
                  placeholder="Last name"
                  required
                />
              </div>

              <FormInput
                label="Email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                placeholder="Enter his/her email"
                type="email"
                required
                icon={Mail}
              />

              <FormSelect
                label="Role"
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                options={roleOptions}
                placeholder="Select a role"
                required
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-slate-700 font-medium">Email</label>
                <div className="relative">
                  <input 
                    id="email"
                    placeholder="Enter his/her email" 
                    required
                    className="w-full pl-4 pr-12 py-3 bg-white border mt-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#BE123C]/10 focus:border-[#BE123C] transition-all" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <FormSelect
                label="Role"
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                options={roleOptions}
                placeholder="Select a role"
                required
              />
            </div>
          )}

          <p className="text-xs text-slate-400 italic">He/she will receive an invitation email</p>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium cursor-pointer text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Exit
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 text-sm font-medium cursor-pointer text-white bg-[#BE123C] rounded-lg hover:bg-[#9F1239] transition-colors shadow-sm active:scale-[0.98]"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
