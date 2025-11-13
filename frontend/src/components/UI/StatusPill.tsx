// src/components/UI/StatusPill.tsx
import React from "react";

interface StatusPillProps {
  status: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  let colorClasses = "";
  switch (status) {
    case "Completed":
      colorClasses = "bg-emerald-100 text-emerald-700";
      break;
    case "In Progress":
      colorClasses = "bg-sky-100 text-sky-700";
      break;
    case "Pending":
    default:
      colorClasses = "bg-slate-100 text-slate-600";
      break;
  }

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses} transition-colors duration-300`}
    >
      {status}
    </span>
  );
};

export default StatusPill;
