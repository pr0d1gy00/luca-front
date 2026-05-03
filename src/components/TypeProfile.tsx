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
    <div
      className={`rounded-full w-24 h-24 flex flex-col items-center justify-center  mt-4 hover:scale-105 transition-all duration-300 cursor-pointer  ${
        isActive
          ? "bg-[#ebbda8] text-black"
          : "bg-luca-fg-on-primary text-black hover:bg-[#f1d8b9]"
      }`}
      onClick={onClick}
    >
      <Icon className="w-10 h-10 mb-2 text-[#E07A5F]" />
      <p className="font-semibold font-jakarta text-center text-sm">{title}</p>
    </div>
  );
}
