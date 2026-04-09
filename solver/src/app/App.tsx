import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { ProblemHeader } from './components/ProblemHeader';
import { StepCard, Step } from './components/StepCard';
import { FinalAnswer } from './components/FinalAnswer';
import { ChatWidget } from './components/ChatWidget';
import { BookOpen } from 'lucide-react';

const mockProblem = {
  text: "Solve the integral: $$\\int x e^x \\, dx$$",
  finalAnswer: "$x e^x - e^x + C$",
  steps: [
    {
      id: "step-1",
      title: "Step 1: Integration by Parts Formula",
      content: "Recall the formula for integration by parts:\n\n$$\\int u \\, dv = u \\cdot v - \\int v \\, du$$\n\nThis method is particularly useful when integrating the product of two distinct types of functions, such as algebraic and exponential functions.",
      notes: "The LIATE rule (Logarithmic, Inverse trig, Algebraic, Trig, Exponential) is a helpful mnemonic to decide which part of the integrand should be $u$. Algebraic comes before Exponential, so we let $u = x$.",
      videoUrl: "https://youtube.com/watch?v=example-video",
      understood: false
    },
    {
      id: "step-2",
      title: "Step 2: Choose $u$ and $dv$",
      content: "Based on the LIATE rule, we choose:\n\n$$u = x \\implies du = dx$$\n\n$$dv = e^x \\, dx \\implies v = \\int e^x \\, dx = e^x$$",
      understood: false
    },
    {
      id: "step-3",
      title: "Step 3: Apply the formula",
      content: "Substitute our chosen $u$, $v$, $du$, and $dv$ into the integration by parts formula:\n\n$$\\int x e^x \\, dx = (x)(e^x) - \\int (e^x)\\, dx$$",
      notes: "Make sure you correctly substitute all parts. A common mistake is forgetting the minus sign before the new integral.",
      understood: false
    },
    {
      id: "step-4",
      title: "Step 4: Evaluate the remaining integral",
      content: "Now we simply need to evaluate the remaining simpler integral: $\\int e^x \\, dx$.\n\nWe know that the integral of $e^x$ is just $e^x$. Don't forget to add the constant of integration, $C$, at the very end since this is an indefinite integral.",
      videoUrl: "https://youtube.com/watch?v=example-video-2",
      understood: false
    }
  ]
};

export default function App() {
  const [steps, setSteps] = useState<Step[]>(mockProblem.steps);

  const handleToggleUnderstood = (id: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id ? { ...step, understood: !step.understood } : step
      )
    );
  };

  const allUnderstood = steps.every(s => s.understood);

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 pb-32">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-cyan-900/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none translate-y-[-50%]" />
      
      {/* Main Content Container */}
      <main className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 relative z-10">
        
        {/* Header Topic */}
        <div className="flex items-center gap-2 text-cyan-500/80 mb-6 font-medium tracking-widest text-sm uppercase px-2">
          <BookOpen size={16} />
          <span>Calculus II • Integration</span>
        </div>

        {/* Problem Header Component */}
        <ProblemHeader text={mockProblem.text} />

        {/* Steps Container */}
        <div className="mt-16 space-y-4">
          
          <div className="flex items-center justify-between px-2 mb-8">
            <h3 className="text-xl font-semibold text-white tracking-wide">
              Step-by-Step Solution
            </h3>
            <span className="text-sm font-medium bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800 text-neutral-400">
              {steps.filter(s => s.understood).length} / {steps.length} Understood
            </span>
          </div>

          <div className="relative border-l-2 border-neutral-800/50 pl-6 ml-4 space-y-8 py-2">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connecting node on the left line */}
                <div 
                  className={`absolute -left-[33px] top-6 w-4 h-4 rounded-full border-4 border-[#09090b] z-10 transition-colors duration-300 ${
                    step.understood ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-neutral-700'
                  }`} 
                />
                <StepCard 
                  step={step} 
                  index={index}
                  onToggleUnderstood={handleToggleUnderstood} 
                />
              </div>
            ))}
          </div>

        </div>

        {/* Final Answer Container */}
        <div className={`transition-all duration-700 transform ${allUnderstood ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale-[0.5]'}`}>
          <FinalAnswer answer={mockProblem.finalAnswer} />
          
          {!allUnderstood && (
            <p className="text-center text-sm text-neutral-500 mt-4 font-medium italic">
              Review all steps to unlock the final answer.
            </p>
          )}
        </div>

      </main>

      {/* Floating Chat Interface */}
      <ChatWidget />
      
    </div>
  );
}
