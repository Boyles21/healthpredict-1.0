import React, { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
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
    primary: "bg-medical-primary text-white hover:bg-medical-primary-hover shadow-sm",
    secondary: "bg-medical-soft-blue text-medical-primary hover:bg-blue-100",
    outline: "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    ghost: "text-slate-600 hover:text-medical-primary hover:bg-slate-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`font-semibold rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
