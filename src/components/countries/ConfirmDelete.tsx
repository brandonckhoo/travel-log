"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface ConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => Promise<void>;
}

export default function ConfirmDelete({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: ConfirmDeleteProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete confirmation"
      className="max-w-sm"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm text-ink-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-ink">{itemName}</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-2.5 border border-border text-ink text-sm font-medium rounded-xl hover:bg-surface-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
