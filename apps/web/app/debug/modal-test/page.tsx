 "use client";

import React, { useState } from "react";
import { Modal, ModalData } from "@/components/modals/modal";

export default function ModalTestPage() {
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [isSimpleOpen, setIsSimpleOpen] = useState(false);

  const handleAction = (data: ModalData) => {
    console.log("Action data:", data);
    alert(`Action for: ${data.email} as ${data.role}`);
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-8">Modal Design Test</h1>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setIsFullOpen(true)}
          className="px-4 py-2 bg-[#BE123C] text-white rounded hover:bg-[#9F1239] transition-colors"
        >
          Open Full Modal
        </button>
        
        <button 
          onClick={() => setIsSimpleOpen(true)}
          className="px-4 py-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
        >
          Open Simple Modal
        </button>
      </div>

      <Modal
        isOpen={isFullOpen} 
        onClose={() => setIsFullOpen(false)} 
        onAction={handleAction}
        variant="full"
      />

      <Modal
        isOpen={isSimpleOpen} 
        onClose={() => setIsSimpleOpen(false)} 
        onAction={handleAction}
        variant="simple"
        defaultRole="Evaluator"
      />
    </div>
  );
}
