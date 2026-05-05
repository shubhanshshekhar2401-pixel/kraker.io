/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FileText, Activity, CheckCircle2, ChevronRight, RotateCcw, ShieldCheck, Download, AlertTriangle, Info, Zap } from 'lucide-react';
import { AppState, AIClassification, QuestionnaireState, LocationType, CrackKind, CrackPattern, CrackSeverity, SurfaceType } from './types';
import { getAIClassification, generateDiagnosis } from './logicEngine';
import { QUESTIONNAIRE_TREE } from './constants';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const theme = 'dark';
  const [state, setState] = useState<AppState>({
    ai_classification: null,
    questionnaire: null,
    diagnosis: null,
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const resetAll = () => {
    setState({
      ai_classification: null,
      questionnaire: null,
      diagnosis: null,
    });
    setStep(1);
  };

  const handleAIClassification = async (ai: AIClassification) => {
    setState(prev => ({ ...prev, ai_classification: ai }));
    setStep(2);
  };

  const handleQuestionnaire = (quest: QuestionnaireState) => {
    if (!state.ai_classification) return;
    const diagnosis = generateDiagnosis(state.ai_classification, quest);
    setState(prev => ({ ...prev, questionnaire: quest, diagnosis }));
    setStep(3);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-10 transition-colors duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-stone-200 dark:border-stone-800 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-stone-900 dark:bg-stone-800 p-2 border border-stone-800 dark:border-white/10 shrink-0">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-900 dark:text-stone-100">KRAKER.IO</h1>
            <p className="text-[8px] sm:text-[9px] text-stone-500 dark:text-stone-500 mono uppercase tracking-wider">Professional Integrity Verification // Active</p>
          </div>
        </div>

        <div className="flex gap-6 sm:gap-10 items-center w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-stone-500 dark:text-stone-600 uppercase tracking-widest mono">Phase</span>
            <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-tighter">
              {step.toString().padStart(2, '0')}: {step === 1 ? 'Classification' : step === 2 ? 'Inquiry' : 'Evaluation'}
            </span>
          </div>
          <div className="flex gap-1.5 h-8 items-center">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${step === s ? 'step-dot-active' : ''}`} />
            ))}
          </div>
          
          <button 
            onClick={resetAll}
            className="text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors border-l border-stone-800/20 dark:border-stone-800 pl-6 h-8 flex items-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-12 gap-0 md:gap-6 min-h-0">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-hidden border-r border-stone-200 dark:border-stone-800 pr-6">
          <div className="flex-1 flex flex-col">
            <h2 className="text-[10px] font-bold text-stone-500 dark:text-stone-500 uppercase mb-4 flex items-center gap-2 mono tracking-widest">
              <span className="w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600"></span> Active Session
            </h2>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
               <div className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 space-y-4 overflow-y-auto">
                 <div className="flex items-center gap-2 text-stone-400 dark:text-stone-600">
                   <Info className="w-3 h-3" />
                   <span className="text-[9px] mono uppercase tracking-widest">Domain Intelligence</span>
                 </div>
                 
                 <div className="space-y-4">
                   {state.ai_classification ? (
                     <div className="space-y-2">
                       <h4 className="text-[10px] font-bold text-stone-900 dark:text-stone-200 uppercase tracking-tighter">AI Analysis Insights</h4>
                       <p className="text-[10px] leading-relaxed text-stone-500 dark:text-stone-400 italic">
                         The {state.ai_classification.pattern} pattern detected is highly correlated with {state.ai_classification.kind} stresses. Research indicates that {state.ai_classification.severity} depth requires immediate classification of the propagation rate.
                       </p>
                     </div>
                   ) : (
                     <p className="text-[10px] leading-relaxed text-stone-400 dark:text-stone-600 italic">Awaiting optical analysis for secondary pattern recognition research data...</p>
                   )}

                   {state.questionnaire?.location && (
                     <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                       <h4 className="text-[10px] font-bold text-stone-900 dark:text-stone-200 uppercase tracking-tighter">{state.questionnaire.location} Research Context</h4>
                       <p className="text-[10px] leading-relaxed text-stone-500 dark:text-stone-400 italic">
                         {state.questionnaire.location === LocationType.Wall && "Vertical load distribution in wall systems often highlights foundation shifts via diagonal shear patterns."}
                         {state.questionnaire.location === LocationType.Beam && "Research indicates beams are most vulnerable near mid-span flexure and support-based shear shear points."}
                         {state.questionnaire.location === LocationType.Column && "Column failure research categorizes vertical splitting as a precursor to axial capacity loss."}
                         {state.questionnaire.location === LocationType.Slab && "Slab behavior relies on multi-directional load paths; research focuses on drying shrinkage delamination."}
                         {state.questionnaire.location === LocationType.Floor && "Floor slabs are dominated by sub-grade stability research and thermal cycle stress accumulation."}
                       </p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-[9px] text-stone-500 dark:text-stone-700 mono uppercase tracking-widest leading-relaxed">
              Diagnostic Protocol: ST-CONC-002
              <br />Reference: ASTM C823/C823M
            </div>
          </div>
        </aside>

        {/* Content Section */}
        <section className="col-span-12 lg:col-span-9 glass relative flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col p-4 md:p-8"
              >
                <Step1AI onComplete={handleAIClassification} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col p-4 md:p-8"
              >
                <Step2Questionnaire onComplete={handleQuestionnaire} onBack={() => setStep(1)} />
              </motion.div>
            )}

            {step === 3 && state.diagnosis && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col p-4 md:p-8"
              >
                <Step3Report state={state} onReset={resetAll} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function Step1AI({ onComplete, isProcessing, setIsProcessing }: { 
  onComplete: (ai: AIClassification) => void, 
  isProcessing: boolean, 
  setIsProcessing: (v: boolean) => void 
}) {
  const [aiResult, setAiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAiResult(null);
    
    try {
      const result = await getAIClassification(file);
      setAiResult(result);
      setIsProcessing(false);
    } catch (error: any) {
      console.error("AI Prediction Error Details:", error);
      setError("Connection failed. Ensure backend + ngrok are running.");
      setIsProcessing(false);
    }
  };

  const handleProceed = () => {
    if (aiResult) {
      onComplete(aiResult);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-10 border-l-4 border-stone-200 dark:border-stone-800 pl-4 sm:pl-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-stone-950 dark:text-stone-50 tracking-widest uppercase mb-1">Visual Capture</h2>
          <p className="text-stone-500 dark:text-stone-500 text-[10px] mono tracking-widest uppercase italic border-stone-800">Optical Neural Net Analysis // Real-time Diagnostic</p>
        </div>
        <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-1.5 font-mono text-[9px] text-stone-600 dark:text-stone-400 tracking-[0.3em] uppercase self-start">
          API Integration Active
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 items-center lg:items-start justify-center pb-8 p-1">
        <input 
          type="file" 
          id="imageInput" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-sm aspect-square lg:w-72 lg:h-72 border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex flex-col items-center justify-center hover:border-stone-400 dark:hover:border-stone-600 transition-all cursor-pointer group relative overflow-hidden shrink-0"
        >
          <div className="absolute inset-0 bg-stone-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Camera className="w-10 h-10 text-stone-300 dark:text-stone-700 group-hover:text-stone-900 dark:group-hover:text-stone-300 transition-all" />
          <span className="text-[9px] mono mt-6 text-stone-500 dark:text-stone-500 uppercase tracking-widest group-hover:text-stone-950 dark:group-hover:text-stone-100">
            {isProcessing ? 'Analyzing...' : 'Upload Image / Capture'}
          </span>
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-stone-200 dark:border-stone-700" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-stone-200 dark:border-stone-700" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-stone-200 dark:border-stone-700" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-stone-200 dark:border-stone-700" />
        </div>

        <div className="flex-1 w-full max-w-lg">
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center py-10"
              >
                <div className="text-center text-stone-500 dark:text-stone-400 mono text-xs animate-pulse tracking-widest uppercase">
                  Analyzing crack...
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl text-red-200"
              >
                <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Error</h2>
                <p className="text-sm mono">{error}</p>
              </motion.div>
            )}

            {aiResult && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {aiResult.no_crack ? (
                  <div className="bg-stone-900/50 p-6 rounded-2xl shadow-lg border border-stone-800">
                    <h2 className="text-xl font-bold text-green-400 uppercase tracking-widest">No Crack Detected</h2>
                    <p className="text-stone-300 mt-2 text-sm italic">{aiResult.message || "Upload a clearer crack image."}</p>
                  </div>
                ) : (
                  <div className="bg-stone-900 p-6 rounded-2xl shadow-xl border border-stone-700">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">
                      {aiResult.kind.toUpperCase()} CRACK
                    </h2>

                    <div className="mb-6">
                      <p className="text-[10px] text-stone-400 mono uppercase tracking-widest mb-2">Detection Confidence</p>
                      <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="bg-blue-500 h-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${aiResult.confidence_score || 0}%` }}
                        />
                      </div>
                      <p className="text-right text-[10px] text-stone-300 mt-1 mono font-bold">{aiResult.confidence_score}%</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Primary Cause</h3>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                          <p className="text-stone-300 text-xs italic leading-relaxed">{aiResult.cause || "Environmental stress factors."}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Recommended Fix</h3>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                          <p className="text-stone-300 text-xs italic leading-relaxed">{aiResult.fix || "Standard remediation protocol."}</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleProceed}
                      className="w-full mt-8 btn-primary py-4 text-xs tracking-[0.3em]"
                    >
                      Initialize Field Inquest
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!isProcessing && !aiResult && !error && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center py-20 border-2 border-dashed border-stone-800/30 rounded-3xl"
              >
                <div className="text-center px-6">
                  <p className="text-stone-500 text-[10px] mono uppercase tracking-widest mb-4">Awaiting Signal</p>
                  <p className="text-xs text-stone-600 italic">Select a source frame for structural evaluation</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Step2Questionnaire({ onComplete, onBack }: { onComplete: (q: QuestionnaireState) => void, onBack: () => void }) {
  const [location, setLocation] = useState<LocationType | ''>('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleLocationChange = (loc: LocationType) => {
    setLocation(loc);
    setAnswers({});
    setCurrentIdx(0);
  };

  const currentQuestions = location ? QUESTIONNAIRE_TREE[location] : [];
  const activeQuestion = currentQuestions[currentIdx];
  const isFormComplete = location && currentQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (val: any) => {
    const newAnswers = { ...answers, [activeQuestion.id]: val };
    setAnswers(newAnswers);
    
    if (currentIdx < currentQuestions.length - 1) {
      setTimeout(() => setCurrentIdx(prev => prev + 1), 300);
    } else {
      // Auto-trigger completion on last question
      setTimeout(() => {
        onComplete({ location: location as LocationType, answers: newAnswers });
      }, 800);
    }
  };

  const progress = location ? ((Object.keys(answers).length) / currentQuestions.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="mb-8 sm:mb-10 border-l-4 border-stone-300 dark:border-stone-800 pl-4 sm:pl-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-widest uppercase mb-1">Field Inquest</h2>
          <p className="text-stone-400 dark:text-stone-500 text-[10px] mono tracking-widest uppercase">Expert Logic Chain // Contextual Parameters</p>
        </div>
        {location && (
          <div className="w-full sm:w-auto text-left sm:text-right">
             <span className="text-[9px] mono text-stone-400 dark:text-stone-600 block mb-1 uppercase tracking-widest">Progress</span>
             <div className="w-full sm:w-48 h-1 bg-black/5 dark:bg-stone-900 overflow-hidden">
                <motion.div 
                  className="h-full bg-stone-900 dark:bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>
          </div>
        )}
      </div>

      {location && (
        <div className="lg:hidden w-full max-w-2xl mx-auto mb-6 px-4">
          <div className="p-3 bg-stone-900 dark:bg-white/5 border border-stone-800 dark:border-white/10 flex items-start gap-3">
             <Info className="w-3 h-3 text-stone-500 mt-0.5 shrink-0" />
             <p className="text-[9px] leading-relaxed text-stone-400 dark:text-stone-500 italic">
                {location === LocationType.Wall && "Research focus: Load-bearing shear assessment and foundation settlement indicators."}
                {location === LocationType.Beam && "Research focus: Mid-span flexural stress and critical shear failure near supports."}
                {location === LocationType.Column && "Research focus: Vertical splitting vs. compression capacity depletion indices."}
                {location === LocationType.Slab && "Research focus: Slab-matrix delamination and shrinkage-based volumetric relief."}
                {location === LocationType.Floor && "Research focus: Sub-grade stability cycles and thermal expansion path analysis."}
             </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full">
        {!location ? (
          <div className="w-full space-y-8 sm:space-y-12 text-center py-10 sm:py-20">
            <h3 className="text-sm sm:text-xl font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase text-stone-400 dark:text-stone-500 px-4">Specify Observation Focal Point</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 border border-stone-200 dark:border-white/5">
              {Object.values(LocationType).map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className="p-6 sm:p-8 bg-stone-50 dark:bg-white/2 border border-stone-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 dark:hover:bg-white hover:text-white dark:hover:text-stone-950 transition-all text-stone-500 dark:text-stone-400 mono h-24 sm:h-32 flex items-center justify-center text-center group"
                >
                  <span className="group-hover:scale-110 transition-transform">{loc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-10 relative">
            {activeQuestion ? (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="w-full max-w-2xl space-y-8 sm:space-y-12 px-4"
                >
                  <div className="space-y-4">
                    <span className="text-[9px] sm:text-[10px] mono text-stone-400 dark:text-stone-600 uppercase tracking-[0.4em] block text-center">Question {currentIdx + 1} of {currentQuestions.length}</span>
                    <h3 className="text-xl sm:text-2xl font-light text-stone-800 dark:text-white text-center leading-relaxed">
                      {activeQuestion.label}
                    </h3>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {activeQuestion.type === 'boolean' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {[true, false].map((val) => (
                          <button
                            key={String(val)}
                            onClick={() => handleAnswer(val)}
                            className={`group p-6 sm:p-8 border transition-all text-center ${
                              answers[activeQuestion.id] === val 
                                ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 shadow-lg' 
                                : 'bg-white dark:bg-transparent border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 shadow-sm'
                            }`}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] block mb-2 ${
                              answers[activeQuestion.id] === val ? 'text-white dark:text-stone-900' : 'text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-300'
                            }`}>
                              {val ? 'Affirm' : 'Negative'}
                            </span>
                            <div className={`mx-auto w-4 h-0.5 mt-4 ${
                              answers[activeQuestion.id] === val ? 'bg-stone-100 dark:bg-stone-900' : 'bg-stone-300 dark:bg-stone-800'
                            }`} />
                          </button>
                        ))}
                      </div>
                    )}

                    {activeQuestion.type === 'select' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {activeQuestion.options?.map((opt: string) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`group p-4 sm:p-6 border transition-all text-center h-full flex flex-col justify-center min-h-[4rem] sm:min-h-0 ${
                              answers[activeQuestion.id] === opt 
                                ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 shadow-lg' 
                                : 'bg-white dark:bg-transparent border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 shadow-sm'
                            }`}
                          >
                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] block ${
                              answers[activeQuestion.id] === opt ? 'text-white dark:text-stone-900' : 'text-stone-500 group-hover:text-stone-900 dark:group-hover:text-stone-300'
                            }`}>
                              {opt}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {answers[activeQuestion.id] !== undefined && (
                     <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                     >
                       <p className="text-[10px] mono text-stone-500 uppercase tracking-widest italic">
                          {currentIdx < currentQuestions.length - 1 ? 'Acknowledged. Proceeding...' : 'Diagnostics Finalized. Synchronizing Report...'}
                       </p>
                     </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center">
                <p className="text-stone-500 mono uppercase tracking-widest text-xs">No research parameters defined for this domain.</p>
              </div>
            )}

            {/* Back Arrow for individual questions */}
            {currentIdx > 0 && (
              <button 
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="absolute left-0 text-stone-600 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="text-[9px] mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Previous</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-auto pt-6 sm:pt-10 border-t border-black/5 dark:border-white/5 gap-4">
        <button onClick={onBack} className="w-full sm:w-auto px-6 sm:px-10 py-3 border border-stone-200 dark:border-stone-800 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 hover:bg-stone-900/5 dark:hover:bg-stone-900 hover:text-stone-600 dark:hover:text-stone-400 transition-all">
          {location ? 'Change Domain' : 'Re-Capture'}
        </button>
        {isFormComplete && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full sm:w-auto">
            <button
              onClick={() => onComplete({ location: location as LocationType, answers })}
              className="btn-primary w-full sm:w-auto px-8 sm:px-16 py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em]"
            >
              Compute Evaluation
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Step3Report({ state, onReset }: { state: AppState, onReset: () => void }) {
  const theme = 'dark';
  const { diagnosis, ai_classification, questionnaire } = state;
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!diagnosis || !ai_classification || !questionnaire) return null;

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: theme === 'dark' ? '#0C0A09' : '#FFFFFF',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const reportElement = clonedDoc.querySelector('.report-card');
          if (reportElement instanceof HTMLElement) {
            const isDark = theme === 'dark';
            
            // 1. Force standard colors in all <style> tags to avoid oklab/oklch parsing errors in html2canvas
            const styleTags = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleTags.length; i++) {
              let css = styleTags[i].innerHTML;
              // Very aggressive replacement of oklch/oklab patterns with safe fallbacks
              // Tailwind 4 uses these heavily. We'll simplify them to standard hex for the export.
              css = css.replace(/oklch\([^)]+\)/g, isDark ? '#FFFFFF' : '#000000');
              css = css.replace(/oklab\([^)]+\)/g, isDark ? '#FFFFFF' : '#000000');
              css = css.replace(/color-mix\([^)]+\)/g, isDark ? '#888888' : '#666666');
              styleTags[i].innerHTML = css;
            }

            // 2. Inject high-priority overrides for key variables
            const overrideStyle = clonedDoc.createElement('style');
            overrideStyle.innerHTML = `
              :root {
                --stone-50: #FAFAFA !important;
                --stone-100: #F5F5F4 !important;
                --stone-200: #E7E7E4 !important;
                --stone-300: #D6D3D1 !important;
                --stone-400: #A8A29E !important;
                --stone-500: #78716C !important;
                --stone-600: #57534E !important;
                --stone-700: #44403C !important;
                --stone-800: #292524 !important;
                --stone-900: #1C1917 !important;
                --stone-950: #0C0A09 !important;
                --color-green-500: #22C55E !important;
                --color-orange-500: #F97316 !important;
                --color-red-500: #EF4444 !important;
              }
              .report-card, .report-card * {
                border-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
                background-image: none !important; /* Kill complex gradients */
              }
            `;
            clonedDoc.head.appendChild(overrideStyle);

            reportElement.style.backgroundColor = isDark ? '#0C0A09' : '#FFFFFF';
            reportElement.style.color = isDark ? '#D1D5DB' : '#1C1917';

            // 3. Manual override for elements that might have problematic inline styles or specific classes
            const elements = reportElement.querySelectorAll('*');
            elements.forEach((el) => {
              if (el instanceof HTMLElement) {
                if (el.className.includes('bg-linear') || el.className.includes('from-')) {
                   el.style.backgroundColor = isDark ? '#1C1917' : '#F5F5F4';
                }
                // Strip opacity from borders if they still fail
                if (el.style.borderColor.includes('okl')) el.style.borderColor = isDark ? '#444' : '#ccc';
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Diagnostic_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Moderate': return '#FACC15';
      default: return '#22C55E';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 shrink-0 gap-6">
        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-stone-900/80 dark:text-white/80">Diagnostic Evaluation Summary</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
          <button 
            onClick={exportPDF} 
            disabled={isExporting}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-950 text-[10px] font-bold tracking-widest uppercase border border-stone-800 dark:border-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-3 h-3" />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
          <button 
            onClick={onReset} 
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 text-[10px] font-bold tracking-widest uppercase hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            New Inspection
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-hidden pr-0 sm:pr-2 pb-10" ref={reportRef}>
        <div className="report-card p-0 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-10 border-b border-black/5 dark:border-white/5 bg-linear-to-b from-black/[0.02] dark:from-white/5 to-transparent relative">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-stone-900 dark:bg-white hidden lg:block" />
                  <span className="label-tech m-0">Final Analytical Classification</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tighter mb-6 uppercase leading-none italic break-words">
                  {diagnosis.type}
                </h1>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                  <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-stone-200 dark:bg-black/40 ${
                    diagnosis.confidence === 'High' ? 'border-green-500/30 text-green-700 dark:text-green-500' : 'border-orange-500/30 text-orange-700 dark:text-orange-500'
                  }`}>
                    <CheckCircle2 className="w-3 h-3 text-current" />
                    Confidence: {diagnosis.confidence}
                  </div>
                  <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-stone-200 dark:bg-black/40 ${
                    diagnosis.risk_level === 'Critical' || diagnosis.risk_level === 'High' ? 'border-red-500/50 text-red-700 dark:text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3 text-current" />
                    Risk Level: {diagnosis.risk_level}
                  </div>
                </div>
              </div>

              {/* Visual Risk Gauge */}
              <div className="flex flex-row lg:flex-col items-center gap-6 lg:gap-4 bg-stone-900/5 dark:bg-black/40 p-4 sm:p-6 border border-black/5 dark:border-white/5 w-full lg:w-auto justify-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-stone-200 dark:text-stone-800" strokeWidth="2" />
                      <motion.circle 
                        cx="50" cy="50" r="45" fill="none" 
                        stroke={getRiskColor(diagnosis.risk_level)} 
                        strokeWidth="8" 
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * (diagnosis.risk_level === 'Critical' ? 1 : diagnosis.risk_level === 'High' ? 0.75 : diagnosis.risk_level === 'Moderate' ? 0.5 : 0.25)) }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm sm:text-lg md:text-xl font-black text-stone-900 dark:text-white italic">
                        {diagnosis.risk_level === 'Critical' ? '9.8' : diagnosis.risk_level === 'High' ? '7.5' : diagnosis.risk_level === 'Moderate' ? '4.2' : '1.5'}
                      </span>
                   </div>
                </div>
                <span className="label-tech m-0 lg:block hidden">Strain ID Index</span>
                <span className="label-tech m-0 lg:hidden block">Risk Index</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Data & Forensics */}
            <div className="lg:col-span-12 xl:col-span-5 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/5 space-y-8 md:space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <h3 className="label-tech m-0 text-stone-600 dark:text-stone-300">Diagnostic Forensics</h3>
                </div>
                <div className="bg-stone-500/5 dark:bg-white/2 p-6 sm:p-8 border border-black/5 dark:border-white/5 relative group">
                  <div className="absolute top-0 right-0 p-2 text-stone-300 dark:text-stone-700">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-400 font-light italic">
                    "{diagnosis.root_cause}"
                  </p>
                </div>

                {diagnosis.override_reason && (
                  <div className="p-4 sm:p-6 bg-orange-600/10 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 lithic-border border-l-orange-500">
                    <div className="flex items-center gap-2 mb-3">
                       <Zap className="w-3 h-3 text-orange-600 dark:text-orange-500 animate-pulse" />
                       <h3 className="text-[10px] mono text-orange-700 dark:text-orange-500 uppercase tracking-widest font-bold">Heuristic Override Logic</h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-orange-900 dark:text-orange-200/70 leading-relaxed italic">
                      {diagnosis.override_reason}
                    </p>
                  </div>
                )}
              </section>
              
              <section className="space-y-6">
                <h3 className="label-tech m-0 text-stone-400 dark:text-stone-500">Structural Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-200 dark:bg-white/5 p-px">
                   <div className="bg-stone-50 dark:bg-[#0C0A09] p-4 sm:p-5 transition-colors">
                      <p className="text-[8px] sm:text-[9px] mono text-stone-500 dark:text-stone-600 uppercase mb-1">Domain</p>
                      <p className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase">{questionnaire.location}</p>
                   </div>
                   <div className="bg-stone-50 dark:bg-[#0C0A09] p-4 sm:p-5 transition-colors">
                      <p className="text-[8px] sm:text-[9px] mono text-stone-500 dark:text-stone-600 uppercase mb-1">Visual Pattern</p>
                      <p className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase">{ai_classification.pattern}</p>
                   </div>
                   <div className="bg-stone-50 dark:bg-[#0C0A09] p-4 sm:p-5 transition-colors">
                      <p className="text-[8px] sm:text-[9px] mono text-stone-500 dark:text-stone-600 uppercase mb-1">Depth Metrics</p>
                      <p className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase">{ai_classification.severity}</p>
                   </div>
                   <div className="bg-stone-50 dark:bg-[#0C0A09] p-4 sm:p-5 transition-colors">
                      <p className="text-[8px] sm:text-[9px] mono text-stone-500 dark:text-stone-600 uppercase mb-1">Inception Point</p>
                      <p className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase">{ai_classification.kind}</p>
                   </div>
                </div>
              </section>
            </div>

            {/* Right Column: Treatment Roadmap */}
            <div className="lg:col-span-12 xl:col-span-7 p-6 md:p-10 bg-black/[0.02] dark:bg-white/[0.01]">
              <div className="flex items-center gap-4 mb-8 sm:mb-10 border-b border-black/5 dark:border-white/5 pb-6">
                <div className="bg-stone-900 dark:bg-white p-2 shrink-0">
                   <FileText className="w-5 h-5 text-white dark:text-stone-950" />
                </div>
                <div>
                   <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white uppercase tracking-widest">Remediation Blueprint</h3>
                   <p className="text-[9px] sm:text-[10px] mono text-stone-500 dark:text-stone-600 uppercase">Engineered Solutions Phase 1-3</p>
                </div>
              </div>

              <div className="space-y-8 sm:space-y-12">
                <div className="group relative">
                  <div className="flex items-center gap-4 sm:gap-6 mb-4">
                    <span className="text-3xl sm:text-5xl font-black text-stone-200 dark:text-white/5 group-hover:text-stone-300 dark:group-hover:text-white/10 transition-colors italic">01</span>
                    <h4 className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase tracking-widest border-l-2 border-stone-900 dark:border-white pl-3 sm:pl-4">Immediate:</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-light pl-10 sm:pl-[4.5rem]">
                    {diagnosis.action_plan.immediate}
                  </p>
                </div>

                <div className="group relative">
                  <div className="flex items-center gap-4 sm:gap-6 mb-4">
                    <span className="text-3xl sm:text-5xl font-black text-stone-200 dark:text-white/5 group-hover:text-stone-300 dark:group-hover:text-white/10 transition-colors italic">02</span>
                    <h4 className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase tracking-widest border-l-2 border-stone-900 dark:border-white pl-3 sm:pl-4">Repair:</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-light pl-10 sm:pl-[4.5rem]">
                    {diagnosis.action_plan.repair}
                  </p>
                </div>

                <div className="group relative">
                  <div className="flex items-center gap-4 sm:gap-6 mb-4">
                    <span className="text-3xl sm:text-5xl font-black text-stone-200 dark:text-white/5 group-hover:text-stone-300 dark:group-hover:text-white/10 transition-colors italic">03</span>
                    <h4 className="text-[10px] sm:text-xs font-bold text-stone-900 dark:text-white uppercase tracking-widest border-l-2 border-stone-900 dark:border-white pl-3 sm:pl-4">Prevention:</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-light pl-10 sm:pl-[4.5rem]">
                    {diagnosis.action_plan.prevention}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 border-t border-black/5 dark:border-white/5 bg-stone-50 dark:bg-black/20">
            <div className="flex gap-4 items-start mb-4">
              <ShieldCheck className="w-4 h-4 text-stone-400 mt-1" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-stone-900 dark:text-stone-300 uppercase tracking-widest">Technical Domain Research Reference</h4>
                <p className="text-[9px] mono text-stone-500 dark:text-stone-600 uppercase">Contextual validation based on {questionnaire.location} structural research</p>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed font-light italic border-l border-stone-200 dark:border-stone-800 pl-4 py-1">
              Current diagnostic research for the {questionnaire.location} domain prioritizes {diagnosis.type === 'Structural' ? 'load-path analysis and brittle failure prevention' : 'volumetric stability and environmental cycle mitigation'}. 
              The intersection of a {ai_classification.pattern} pattern with {questionnaire.location}-specific constraints suggests that {diagnosis.risk_level === 'Critical' ? 'immediate mechanical intervention is non-negotiable' : 'proactive monitoring and surface restoration are primary objectives'}.
            </p>
          </div>
          
          {/* Footer Bar */}
          <div className="bg-stone-100 dark:bg-[#111214] p-6 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
             <div className="flex items-center gap-3 w-full md:w-auto">
                <Activity className="w-4 h-4 text-stone-400 dark:text-stone-600 shrink-0" />
                <span className="text-[8px] sm:text-[10px] mono text-stone-400 dark:text-stone-600 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Structural Integrity Intelligence // System v3.1</span>
             </div>
             <div className="flex gap-8 w-full md:w-auto justify-end">
                <div className="text-right">
                   <p className="text-[8px] sm:text-[9px] mono text-stone-500 dark:text-stone-700 uppercase tracking-widest leading-none mb-1 text-center sm:text-right">Authorized Inspection Signature</p>
                   <p className="text-[10px] sm:text-[11px] font-bold text-stone-400 dark:text-stone-500 mono leading-none font-serif italic text-center sm:text-right">Digital_Cert_PX7</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

