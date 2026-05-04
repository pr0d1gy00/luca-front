import { cn } from "@/app/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType; // Permite cambiar el tag (div, section, main, article)
  variant?: "default" | "narrow" | "fluid" | "reading";
}

export function Container({
  children,
  className,
  as: Component = "div",
  variant = "default",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",

        {
          "max-w-7xl": variant === "default",
          "max-w-4xl": variant === "narrow",
          "max-w-2xl": variant === "reading",
          "max-w-[90%]": variant === "fluid",
        },
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
