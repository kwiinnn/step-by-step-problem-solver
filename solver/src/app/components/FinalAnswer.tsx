import React, { useState } from 'react';
import { Flag, ChevronDown, ChevronUp, Info } from 'lucide-react';
import Latex from 'react-latex-next';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveGraph } from './InteractiveGraph';

export type { GraphPoint, GraphDataConfig } from './InteractiveGraph';

interface FinalAnswerProps {
  answer: string;
  graph?: import('./InteractiveGraph').GraphDataConfig | null;
}

export const FinalAnswer: React.FC<FinalAnswerProps> = ({ answer, graph }) => {
  const [showGraph, setShowGraph] = useState(false);

  // Ensure answer is wrapped in $ delimiters for LaTeX rendering
  const latexAnswer = answer.includes('$') ? answer : `$${answer}$`;

  return (
    <div className="mt-16 mb-24 w-full">
      <div className="flex items-center gap-3 mb-4 justify-center">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent flex-1 opacity-50" />
        <Flag className="text-cyan-400" size={18} />
        <h3 className="text-cyan-400 font-medium uppercase tracking-[0.2em] text-sm text-center">Final Answer</h3>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent flex-1 opacity-50" />
      </div>

      <div className="bg-gradient-to-b from-cyan-950/40 to-black/60 border border-cyan-500/30 rounded-2xl p-8 md:p-12 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col items-center">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="text-3xl md:text-5xl font-semibold text-white tracking-wider font-serif text-center mb-8">
          <Latex>{latexAnswer}</Latex>
        </div>

        <button
          onClick={() => setShowGraph(!showGraph)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 rounded-full text-slate-300 transition-colors z-10 font-medium text-sm"
        >
          {showGraph ? 'Hide Graph' : 'Show Graph'}
          {showGraph ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showGraph && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full mt-8 overflow-hidden z-10"
            >
              {!graph ? (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed">
                  <Info className="text-slate-400 mb-3" size={32} />
                  <p className="text-slate-400 font-medium">Graph unavailable</p>
                  <p className="text-slate-500 text-sm mt-1">This problem does not include a graph visualization.</p>
                </div>
              ) : (
                <div className="bg-slate-900/80 p-4 sm:p-6 rounded-xl border border-slate-700 w-full">
                  <InteractiveGraph graph={graph} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
