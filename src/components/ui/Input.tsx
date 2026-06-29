import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  className?: string;
  type?: string;
}

export default function Input({ label, description, error, className = "", type = "text", ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";
  const inputType = isPasswordInput ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
        {label}
      </label>
      <div className="relative">
        <input 
          type={inputType}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all duration-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 placeholder:text-slate-400 text-slate-800 ${
            isPasswordInput ? "pr-11" : ""
          } ${
            error ? "border-red-500 focus:ring-red-500/20 focus:border-red-600" : "border-slate-300 focus:border-teal-600"
          }`}
          {...props}
        />
        {isPasswordInput && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 focus:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {description && !error && <p className="text-xs text-slate-500 px-1 italic font-medium mt-1 leading-relaxed">{description}</p>}
      {error && <span className="text-xs font-semibold text-red-600 px-1 mt-1">{error}</span>}
    </div>
  );
}
