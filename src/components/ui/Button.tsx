import React, { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "custom";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

export default function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "", 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-medical-primary/50 focus-visible:ring-offset-2 outline-none rounded-full",
    secondary: "bg-medical-soft-blue text-teal-700 hover:bg-teal-100/70 shadow-sm hover:shadow transition-all duration-300 focus-visible:ring-2 focus-visible:ring-medical-primary/50 focus-visible:ring-offset-2 outline-none rounded-full",
    outline: "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-medical-primary/50 focus-visible:ring-offset-2 outline-none rounded-full",
    ghost: "text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-medical-primary/50 focus-visible:ring-offset-2 outline-none rounded-full",
    custom: ""
  };

  const sizes = {
    sm: "px-4 py-2 text-xs font-semibold leading-tight min-h-[40px] flex items-center justify-center",
    md: "px-6 py-3 text-sm font-semibold leading-tight min-h-[48px] flex items-center justify-center",
    lg: "px-8 py-4.5 text-base font-bold leading-normal min-h-[56px] flex items-center justify-center"
  };

  return (
    <button 
      className={`font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
