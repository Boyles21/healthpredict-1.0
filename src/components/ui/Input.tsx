import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  className?: string;
  type?: string;
}

export default function Input({ label, description, error, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
        {label}
      </label>
      <input 
        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all duration-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400 text-slate-800 ${
          error ? "border-red-500 focus:ring-red-500/20 focus:border-red-600" : "border-slate-300 focus:border-teal-600"
        }`}
        {...props}
      />
      {description && !error && <p className="text-xs text-slate-500 px-1 italic font-medium mt-1 leading-relaxed">{description}</p>}
      {error && <span className="text-xs font-semibold text-red-600 px-1 mt-1">{error}</span>}
    </div>
  );
}
