import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "motion/react";

type InputLoginProps = HTMLMotionProps<"input">;

const InputLogin = forwardRef<HTMLInputElement, InputLoginProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.input
        ref={ref}
        className={`w-full bg-[#e4e2dd] rounded-[3rem] p-6 placeholder:text-[#838580]
            focus-visible:outline-none 
            focus-visible:ring-1 
            focus-visible:ring-offset-1
            focus-visible:ring-luca-accent ${className || ""}`}
        {...props}
      />
    );
  },
);

InputLogin.displayName = "InputLogin";

export default InputLogin;
