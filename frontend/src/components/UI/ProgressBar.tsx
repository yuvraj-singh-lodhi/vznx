// src/components/UI/ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const progressCls =
    progress < 50
      ? "bg-sky-400"
      : progress < 100
      ? "bg-amber-500"
      : "bg-emerald-500";
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${progressCls} transition-all duration-700 ease-out`}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

export default ProgressBar;
