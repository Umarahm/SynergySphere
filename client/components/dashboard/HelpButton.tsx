import React from "react";
import { HelpCircle } from "lucide-react";

export function HelpButton() {
  return (
    <button
      className="
      fixed bottom-4 lg:bottom-8 left-4 lg:left-8
      w-10 lg:w-12 h-10 lg:h-12
      bg-orange-primary
      rounded-full
      shadow-lg hover:shadow-xl
      transition-shadow
      flex items-center justify-center
      group
      z-50
    "
    >
      <HelpCircle className="w-5 lg:w-6 h-5 lg:h-6 text-white group-hover:scale-110 transition-transform" />
    </button>
  );
}
