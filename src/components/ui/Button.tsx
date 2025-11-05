import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "success" | "danger" | "ghost";
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "btn-primary",
    success: "btn-success",
    danger: "btn-danger",
    ghost: "bg-transparent hover:bg-white/5 border border-white/10",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center gap-2 justify-center",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
