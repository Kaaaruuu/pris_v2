"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 ring-1 ring-inset ring-white/10 shadow-sm",
    secondary: "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 shadow-sm",
    ghost: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
