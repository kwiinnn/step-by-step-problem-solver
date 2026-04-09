import React, { useState, useRef, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { ProblemHeader } from './components/ProblemHeader';
import { StepCard, Step } from './components/StepCard';
import { FinalAnswer, GraphDataConfig } from './components/FinalAnswer';
import { ChatWidget } from './components/ChatWidget';
import { Sidebar, Tab } from './components/Sidebar';
import { BookOpen, FunctionSquare, List } from 'lucide-react';
import { motion } from 'motion/react';

interface ProblemData {
  text: string;
  finalAnswer: string;
  steps: Step[];
  graph?: GraphDataConfig;
}

const mockProblem1: ProblemData = {
  text: "Solve the integral: $$\\int x e^x \\, dx$$",
  finalAnswer: "$x e^x - e^x + C$",
  steps: [
    {
      id: "step-1",
      title: "Step 1: Integration by Parts Formula",
      content: "Recall the formula for integration by parts:\n\n$$\\int u \\, dv = u \\cdot v - \\int v \\, du$$\n\nThis method is particularly useful when integrating the product of two distinct types of functions, such as algebraic and exponential functions.",
      notes: "The LIATE rule (Logarithmic, Inverse trig, Algebraic, Trig, Exponential) is a helpful mnemonic to decide which part of the integrand should be $u$. Algebraic comes before Exponential, so we let $u = x$.",
      videoUrl: "https://youtu.be/sWSLLO3DS1I?si=uNKKzwbhndgRRn0E",
      understood: false
    },
    {
      id: "step-2",
      title: "Step 2: Choose $u$ and $dv$",
      content: "Based on the LIATE rule, we choose:\n\n$$u = x \\implies du = dx$$\n\n$$dv = e^x \\, dx \\implies v = \\int e^x \\, dx = e^x$$",
      notes: "A good check: after choosing $u$ and $dv$, make sure that $dv$ is something you can easily integrate. If you can't integrate $dv$, try swapping your choices.",
      videoUrl: "https://youtu.be/sWSLLO3DS1I?si=uNKKzwbhndgRRn0E",
      understood: false
    },
    {
      id: "step-3",
      title: "Step 3: Apply the formula",
      content: "Substitute our chosen $u$, $v$, $du$, and $dv$ into the integration by parts formula:\n\n$$\\int x e^x \\, dx = (x)(e^x) - \\int (e^x)\\, dx$$",
      notes: "Make sure you correctly substitute all parts. A common mistake is forgetting the minus sign before the new integral.",
      videoUrl: "https://youtu.be/sWSLLO3DS1I?si=uNKKzwbhndgRRn0E",
      understood: false
    },
    {
      id: "step-4",
      title: "Step 4: Evaluate the remaining integral",
      content: "Now we simply need to evaluate the remaining simpler integral: $\\int e^x \\, dx$.\n\nWe know that the integral of $e^x$ is just $e^x$. Don't forget to add the constant of integration, $C$, at the very end since this is an indefinite integral.",
      notes: "The constant of integration $C$ is essential for indefinite integrals. Forgetting it is one of the most common mistakes in calculus exams.",
      videoUrl: "https://youtube.com/watch?v=2I-G-dK2P0M",
      understood: false
    }
  ]
};

const mockProblem2: ProblemData = {
  text: "Find the Maclaurin series expansion for $\\sin(x)$ up to the $x^5$ term.",
  finalAnswer: "x - \\frac{x^3}{3!} + \\frac{x^5}{5!}",
  steps: [
    {
      id: "step-2-1",
      title: "Step 1: Formula for Maclaurin series",
      content: "A Maclaurin series is a Taylor series expansion of a function about 0:\n\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n$$",
      notes: "A Maclaurin series is just a special case of a Taylor series where the center $a = 0$. The general Taylor series is $\\sum \\frac{f^{(n)}(a)}{n!}(x-a)^n$.",
      videoUrl: "https://youtu.be/3d6DsjIBzJ4",
      understood: false
    },
    {
      id: "step-2-2",
      title: "Step 2: Find derivatives evaluated at 0",
      content: "$f(x) = \\sin(x) \\implies f(0) = 0$\n$f'(x) = \\cos(x) \\implies f'(0) = 1$\n$f''(x) = -\\sin(x) \\implies f''(0) = 0$\n$f'''(x) = -\\cos(x) \\implies f'''(0) = -1$\n$f^{(4)}(x) = \\sin(x) \\implies f^{(4)}(0) = 0$\n$f^{(5)}(x) = \\cos(x) \\implies f^{(5)}(0) = 1$",
      notes: "Notice the cyclic pattern of $\\sin$ derivatives: $\\sin, \\cos, -\\sin, -\\cos, \\sin, \\ldots$ — this repeats every 4 derivatives, which is why only odd-powered terms survive.",
      videoUrl: "https://youtu.be/3d6DsjIBzJ4",
      understood: false
    },
    {
      id: "step-2-3",
      title: "Step 3: Substitute into the formula",
      content: "$$\\sin(x) = 0 + \\frac{1}{1!}x + 0 - \\frac{1}{3!}x^3 + 0 + \\frac{1}{5!}x^5$$",
      notes: "The zero-valued terms vanish, leaving only odd powers of $x$. The general pattern is $\\sin(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n+1)!} x^{2n+1}$.",
      videoUrl: "https://youtu.be/3d6DsjIBzJ4",
      understood: false
    }
  ]
};

const mockProblem3: ProblemData = {
  text: "Find the area of the region bounded by the curves $y = x^2$ and $y = 2x + 3$.",
  finalAnswer: "\\frac{32}{3}",
  graph: {
    data: [
      { x: -2, y1: 4, y2: -1 },
      { x: -1.5, y1: 2.25, y2: 0 },
      { x: -1, y1: 1, y2: 1 },
      { x: -0.5, y1: 0.25, y2: 2 },
      { x: 0, y1: 0, y2: 3 },
      { x: 0.5, y1: 0.25, y2: 4 },
      { x: 1, y1: 1, y2: 5 },
      { x: 1.5, y1: 2.25, y2: 6 },
      { x: 2, y1: 4, y2: 7 },
      { x: 2.5, y1: 6.25, y2: 8 },
      { x: 3, y1: 9, y2: 9 },
      { x: 3.5, y1: 12.25, y2: 10 },
      { x: 4, y1: 16, y2: 11 },
    ],
    lines: [
      { dataKey: "y1", stroke: "#22d3ee", name: "y = x²", fn: (x: number) => x * x },
      { dataKey: "y2", stroke: "#818cf8", name: "y = 2x + 3", fn: (x: number) => 2 * x + 3 }
    ],
    points: [
      { x: -1, y: 1, label: "Intersection 1", color: "#f43f5e" },
      { x: 3, y: 9, label: "Intersection 2", color: "#f43f5e" }
    ],
    xAxisDomain: [-2, 4],
    yAxisDomain: [-2, 16]
  },
  steps: [
    {
      id: "step-3-1",
      title: "Step 1: Find points of intersection",
      content: "To find where the curves intersect, set them equal to each other:\n\n$$x^2 = 2x + 3$$\n\nRearrange into a standard quadratic equation:\n\n$$x^2 - 2x - 3 = 0$$",
      notes: "Setting curves equal is the standard technique for finding intersection points. Always rearrange to one side so you can factor or use the quadratic formula.",
      videoUrl: "https://youtu.be/YBYu1aGg5Pg",
      understood: false
    },
    {
      id: "step-3-2",
      title: "Step 2: Solve the quadratic equation",
      content: "Factor the quadratic equation:\n\n$$(x - 3)(x + 1) = 0$$\n\nSo the x-coordinates of the intersection points are $x = -1$ and $x = 3$. You can evaluate the function at these x values to see that the exact points are $(-1, 1)$ and $(3, 9)$.",
      notes: "Quick factoring tip: look for two numbers that multiply to $-3$ and add to $-2$. Those are $-3$ and $1$. If factoring isn't obvious, the quadratic formula always works.",
      videoUrl: "https://youtu.be/YBYu1aGg5Pg",
      understood: false
    },
    {
      id: "step-3-3",
      title: "Step 3: Set up the definite integral for area",
      content: "The area between two curves is given by $\\int_{a}^{b} (\\text{Top Function} - \\text{Bottom Function}) \\, dx$.\n\nBetween $x = -1$ and $x = 3$, $2x + 3$ is above $x^2$. So our integral is:\n\n$$A = \\int_{-1}^{3} ((2x + 3) - x^2) \\, dx$$",
      notes: "Always check which function is on top by testing a point in the interval. At $x = 0$: $2(0)+3 = 3 > 0 = 0^2$, confirming the linear function is above the parabola.",
      videoUrl: "https://youtu.be/YBYu1aGg5Pg",
      understood: false
    },
    {
      id: "step-3-4",
      title: "Step 4: Evaluate the integral",
      content: "Find the antiderivative:\n\n$$A = \\left[ x^2 + 3x - \\frac{x^3}{3} \\right]_{-1}^{3}$$\n\nEvaluate at the bounds:\n\n$A = (3^2 + 3(3) - \\frac{3^3}{3}) - ((-1)^2 + 3(-1) - \\frac{(-1)^3}{3})$\n\n$A = (9 + 9 - 9) - (1 - 3 + \\frac{1}{3}) = 9 - (-\\frac{5}{3}) = \\frac{32}{3}$",
      notes: "Be extra careful with signs when evaluating at the lower bound $x = -1$. The cube of a negative number is negative: $(-1)^3 = -1$, so $-\\frac{(-1)^3}{3} = \\frac{1}{3}$.",
      videoUrl: "https://youtu.be/YBYu1aGg5Pg",
      understood: false
    }
  ]
};

const problemsDatabase: Record<string, ProblemData> = {
  '1': mockProblem1,
  '2': mockProblem2,
  '3': mockProblem3,
};

const initialTabs: Tab[] = [
  { id: '1', name: 'Integration by Parts' },
  { id: '2', name: 'Taylor Series Expansion' },
  { id: '3', name: 'Area Between Curves' }
];

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [mainTitle, setMainTitle] = useState<string>('CALCULUS II');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [activeTabId]);

  const [steps, setSteps] = useState<Step[]>(problemsDatabase[initialTabs[0].id]?.steps || []);

  // Update steps when tab changes
  useEffect(() => {
    const problem = problemsDatabase[activeTabId];
    if (problem) {
      setSteps(problem.steps);
    } else {
      setSteps([]); // Or some empty state
    }
  }, [activeTabId]);

  const handleToggleUnderstood = (id: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === id ? { ...step, understood: !step.understood } : step
      )
    );
  };

  const handleAddTab = () => {
    const newTab = { id: Date.now().toString(), name: `New Problem ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    // In a real app, we'd also load a new blank problem here.
  };

  const handleDeleteTab = (id: string) => {
    if (tabs.length === 1) return; // Prevent deleting the last tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const handleRenameTab = (id: string, newName: string) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const allUnderstood = steps.every(s => s.understood);
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const currentProblem = problemsDatabase[activeTabId] || problemsDatabase['1'];

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-neutral-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden">
      
      {/* Top Header Title */}
      <header className="h-14 border-b border-neutral-800 bg-[#09090b] flex items-center px-6 shrink-0 z-20">
        <div className="flex items-center text-[15px] font-medium tracking-[0.18em] text-[#06b6d4]">
          <input 
            type="text"
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="uppercase bg-transparent outline-none border border-transparent focus:border-cyan-800/50 hover:bg-cyan-900/10 rounded px-1 -ml-1 transition-all w-64 md:w-96"
            placeholder="MAIN TITLE"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          tabs={tabs}
          activeTabId={activeTabId}
          isOpen={isSidebarOpen}
          onSelectTab={setActiveTabId}
          onAddTab={handleAddTab}
          onDeleteTab={handleDeleteTab}
          onRenameTab={handleRenameTab}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative pb-32">
          
          {/* Floating Hamburger Menu Toggle */}
          {!isSidebarOpen && (
            <div className="sticky top-0 left-0 w-full z-30 h-0">
              <div className="absolute top-4 left-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-3 bg-[#1e293b] hover:bg-slate-700 rounded-full p-1 pr-4 transition-colors"
                  title="Open sidebar"
                >
                  <div className="bg-slate-600 rounded-full p-1.5 text-blue-200">
                    <List size={16} />
                  </div>
                  <span className="text-[15px] font-medium text-blue-200">{tabs.length}</span>
                </button>
              </div>
            </div>
          )}

          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-cyan-900/10 blur-[150px] -z-10 rounded-full mix-blend-screen pointer-events-none translate-y-[-50%]" />
          
          <motion.main 
            key={activeTabId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="max-w-3xl mx-auto px-6 pt-20 md:pt-24 relative z-10"
          >
            
            {/* Header Topic */}
            <div className="flex items-center gap-2 text-cyan-500/80 mb-6 font-medium tracking-widest text-sm uppercase px-2">
              <BookOpen size={16} />
              <span>{mainTitle} • {tabs.find(t => t.id === activeTabId)?.name || 'Integration'}</span>
            </div>

            {/* Problem Header Component */}
            <ProblemHeader text={currentProblem.text} />

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
            <div className={`transition-all duration-700 transform`}>
              <FinalAnswer answer={currentProblem.finalAnswer} graph={currentProblem.graph} />
            </div>

          </motion.main>
        </div>

        {/* Floating Chat Interface */}
        <ChatWidget />
      </div>
    </div>
  );
}