import React from 'react';
import { Flag } from 'lucide-react';
import Latex from 'react-latex-next';

interface FinalAnswerProps {
  answer: string;
}

export const FinalAnswer: React.FC<FinalAnswerProps> = ({ answer }) => {
  return (
    <div className="mt-16 mb-24 w-full">
      <div className="flex items-center gap-3 mb-4 justify-center">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent flex-1 opacity-50" />
        <Flag className="text-cyan-400" size={18} />
        <h3 className="text-cyan-400 font-medium uppercase tracking-[0.2em] text-sm text-center">Final Answer</h3>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent flex-1 opacity-50" />
      </div>

      <div className="bg-gradient-to-b from-cyan-950/40 to-black/60 border border-cyan-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_30px_rgba(34,211,238,0.1)] text-center relative overflow-hidden backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.2)]">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="text-3xl md:text-5xl font-semibold text-white tracking-wider font-serif">
          <Latex>{answer}</Latex>
        </div>
      </div>
    </div>
  );
};
