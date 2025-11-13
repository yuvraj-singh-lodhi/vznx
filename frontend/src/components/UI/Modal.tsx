// src/components/UI/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-100/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center z-10">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
