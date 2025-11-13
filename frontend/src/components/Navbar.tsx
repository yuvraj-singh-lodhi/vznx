// src/components/Navbar.tsx
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="shrink-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              VZNX Dashboard
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
