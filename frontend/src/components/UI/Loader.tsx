import React from "react";

const Loader: React.FC<{ size?: number }> = ({ size = 22 }) => {
  return (
    <div
      className="-z-50 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500"
      style={{ width: size, height: size }}
    ></div>
  );
};

export default Loader;
