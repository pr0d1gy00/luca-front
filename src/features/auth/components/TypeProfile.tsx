import React from "react";

export default function TypeProfile({
  Icon,
  title,
  onClick,
  isActive,
}: {
  Icon: React.ElementType;
  title?: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full sm:flex-1 flex flex-col items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-pharmako-primary-light text-pharmako-primary border-2 border-pharmako-primary"
          : "bg-white text-pharmako-text-secondary border border-pharmako-border hover:border-pharmako-primary/30"
      }`}
    >
      <Icon
        className={`w-6 h-6 ${isActive ? "text-pharmako-primary" : "text-pharmako-text-muted"}`}
      />
      <span className="font-semibold">{title}</span>
    </button>
  );
}
