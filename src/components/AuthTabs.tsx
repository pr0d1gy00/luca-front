import React from "react";

export default function AuthTabs({
  title,
  onClick,
  isActive,
}: {
  title: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <h2
      onClick={onClick}
      className={`text-2xl font-medium  cursor-pointer  p-4 hover:border-luca-primary-hover hover:text-luca-primary-hover hover:scale-105 transition-all duration-300 ${
        isActive
          ? "text-luca-accent border-luca-accent border-b-2"
          : "border-b-gray-400 border-b-2"
      }`}
    >
      {title}
    </h2>
  );
}
