import React from "react";
import {
  Sparkles,
  FunctionSquare as Function,
} from "lucide-react";
import Latex from "react-latex-next";

interface ProblemHeaderProps {
  text: string;
}

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({
  text,
}) => {
  return (
    <div className="w-full relative rounded-3xl p-[2px] bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 mb-12 shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)]">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10" />
      <div className="bg-[#09090b] rounded-[22px] p-8 md:p-10 w-full flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-cyan-400 font-medium uppercase tracking-widest text-sm">
            Problem Statement
          </h2>
        </div>

        <p className="text-2xl md:text-4xl font-light text-white leading-tight font-serif tracking-wide max-w-3xl">
          <Latex>{text}</Latex>
        </p>
      </div>
    </div>
  );
};
