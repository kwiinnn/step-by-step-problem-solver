import React, { useState } from 'react';
import { ChevronDown, Check, FileText, PlayCircle } from 'lucide-react';
import Latex from 'react-latex-next';
import { cn } from '../lib/utils';

export interface Step {
  id: string;
  title: string;
  content: string;
  notes?: string;
  videoUrl?: string;
  understood: boolean;
}

interface StepCardProps {
  step: Step;
  onToggleUnderstood: (id: string) => void;
  index: number;
}

export const StepCard: React.FC<StepCardProps> = ({ step, onToggleUnderstood, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0); // Open first by default

  return (
    <div className="group rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden transition-all duration-300 hover:border-neutral-700 w-full mb-4 relative">
      {/* Decorative left line */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-300",
          step.understood ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-neutral-800"
        )} 
      />
      
      {/* Header Row */}
      <div 
        className="flex items-center gap-4 p-5 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleUnderstood(step.id);
          }}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            step.understood 
              ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" 
              : "border-neutral-600 group-hover:border-neutral-500 text-transparent"
          )}
          aria-label={step.understood ? "Mark as not understood" : "Mark as understood"}
        >
          <Check size={14} className={cn("transition-transform duration-300", step.understood ? "scale-100" : "scale-0")} strokeWidth={3} />
        </button>

        {/* Title */}
        <div className="flex-1 font-medium text-lg tracking-wide text-neutral-200">
          <Latex>{step.title}</Latex>
        </div>

        {/* Expand Icon */}
        <div className="flex-shrink-0 text-neutral-500">
          <ChevronDown 
            size={20} 
            className={cn("transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]", isExpanded ? "rotate-180" : "rotate-0")}
          />
        </div>
      </div>

      {/* Expandable Content Body */}
      <div 
        className={cn(
          "grid transition-all duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 pl-[3.25rem] border-t border-neutral-800/30 mt-1">
            <p className="text-neutral-300 leading-relaxed text-[15px] whitespace-pre-wrap">
              <Latex>{step.content}</Latex>
            </p>

            {/* Extras Section (Notes / Video) */}
            {(step.notes || step.videoUrl) && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {step.notes && (
                  <div className="flex items-center gap-3 h-full bg-neutral-800/40 border border-neutral-800/60 rounded-xl p-4 transition-colors hover:border-neutral-700 min-h-[5rem]">
                    <FileText size={24} className="text-cyan-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-cyan-400/80 mb-1">Notes</span>
                      <p className="text-sm text-neutral-300 font-medium leading-snug whitespace-pre-wrap"><Latex>{step.notes}</Latex></p>
                    </div>
                  </div>
                )}
                
                {step.videoUrl && (() => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                  const match = step.videoUrl.match(regExp);
                  const videoId = (match && match[2].length === 11) ? match[2] : null;
                  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;

                  return (
                    <a 
                      href={step.videoUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="relative overflow-hidden flex items-center gap-3 h-full border border-neutral-800/60 rounded-xl p-4 group transition-all hover:border-neutral-600 min-h-[5rem]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {thumbnailUrl ? (
                        <>
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-40 mix-blend-luminosity"
                            style={{ backgroundImage: `url(${thumbnailUrl})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-neutral-900/30" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-neutral-800/40 group-hover:bg-neutral-800/60 transition-colors" />
                      )}

                      <div className="relative z-10 flex items-center gap-3 w-full">
                        <PlayCircle size={24} className="text-cyan-400 shrink-0 group-hover:text-cyan-300 transition-colors drop-shadow-md" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-cyan-300/90 mb-1 drop-shadow-md">Video Guide</span>
                          <p className="text-sm text-neutral-200 font-medium leading-snug truncate drop-shadow-md">
                            Watch explanation
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
