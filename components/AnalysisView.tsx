import React, { useState, useRef, useEffect } from 'react';
import { analyzeUserContext, getNextInterviewQuestion, generatePosterBackground } from '../services/geminiService';
import { AnalysisResult, TAG_OPTIONS, ChatMessage } from '../types';

const getCategoryStyle = (category: string = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('flor') || cat.includes('花')) return { bg: 'bg-pink-500/20', text: 'text-pink-200', border: 'border-pink-500/30', icon: '🌸', label: 'Floral' };
  if (cat.includes('citr') || cat.includes('fruit') || cat.includes('柑') || cat.includes('果')) return { bg: 'bg-yellow-500/20', text: 'text-yellow-200', border: 'border-yellow-500/30', icon: '🍋', label: 'Citrus' };
  if (cat.includes('wood') || cat.includes('tree') || cat.includes('木')) return { bg: 'bg-stone-500/20', text: 'text-stone-300', border: 'border-stone-500/30', icon: '🌲', label: 'Woody' };
  if (cat.includes('herb') || cat.includes('leaf') || cat.includes('grass') || cat.includes('草')) return { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-500/30', icon: '🌿', label: 'Herbaceous' };
  if (cat.includes('spic') || cat.includes('辛')) return { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-500/30', icon: '🌶️', label: 'Spicy' };
  return { bg: 'bg-cyan-500/20', text: 'text-cyan-200', border: 'border-cyan-500/30', icon: '💧', label: 'Other' };
};

type Step = 'tags' | 'chat' | 'upload' | 'analyzing' | 'result';

const AnalysisView: React.FC = () => {
  // Global State
  const [step, setStep] = useState<Step>('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [posterBg, setPosterBg] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Chat Input State
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // --- Effects ---

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Initialize Chat when entering chat step
  useEffect(() => {
      if (step === 'chat' && chatHistory.length === 0) {
          initializeChat();
      }
  }, [step]);

  // --- Logic ---

  const toggleTag = (label: string) => {
      if (selectedTags.includes(label)) {
          setSelectedTags(prev => prev.filter(t => t !== label));
      } else {
          if (selectedTags.length < 5) {
              setSelectedTags(prev => [...prev, label]);
          }
      }
  };

  const initializeChat = async () => {
      setIsTyping(true);
      const firstQ = await getNextInterviewQuestion(selectedTags, [], 0);
      setChatHistory([{ role: 'model', text: firstQ }]);
      setIsTyping(false);
      setQuestionCount(1);
  };

  const handleSendMessage = async () => {
      if (!userInput.trim()) return;
      
      const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userInput }];
      setChatHistory(newHistory);
      setUserInput('');
      
      // Check if we reached question limit
      if (questionCount >= 5) {
           setIsTyping(true);
           // Slight delay for realism
           setTimeout(() => {
               setChatHistory(prev => [...prev, { role: 'model', text: "感谢您的分享。我已经大致了解了您的能量状态。最后，请上传一张您的照片，让我为您完成最终的氛围定调。" }]);
               setIsTyping(false);
               setTimeout(() => setStep('upload'), 2000);
           }, 800);
           return;
      }

      setIsTyping(true);
      const nextQ = await getNextInterviewQuestion(selectedTags, newHistory, questionCount);
      setChatHistory(prev => [...prev, { role: 'model', text: nextQ }]);
      setIsTyping(false);
      setQuestionCount(prev => prev + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
      if (!image) return;
      setStep('analyzing');
      try {
          // 1. Analyze with Context
          const result = await analyzeUserContext(image.split(',')[1], selectedTags, chatHistory);
          setAnalysis(result);
          
          // 2. Generate Poster
          const poster = await generatePosterBackground(result.posterPrompt);
          setPosterBg(poster);
          
          // 3. Save Result
          saveResult(result, poster);

          setStep('result');
      } catch (e) {
          alert("Analysis Failed");
          setStep('upload');
      }
  };

  const saveResult = (result: AnalysisResult, poster: string) => {
      const item = {
          ...result,
          savedAt: Date.now(),
          date: new Date().toLocaleDateString(),
          posterImage: poster
      };
      const existing = localStorage.getItem('aura_saved_results');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('aura_saved_results', JSON.stringify([item, ...list]));
  };

  // --- Renders ---

  // 1. Tag Selection View
  if (step === 'tags') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up pb-safe-area">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-display font-light text-white mb-4">当下的困扰</h2>
                  <p className="text-slate-400 font-light">请选择 1-5 个最符合您当下状态的词汇</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
                  {TAG_OPTIONS.map(tag => {
                      const active = selectedTags.includes(tag.label);
                      return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.label)}
                            className={`px-6 py-4 rounded-full text-lg transition-all duration-300 flex items-center gap-3 backdrop-blur-md border ${
                                active 
                                ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transform scale-105' 
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                              <span>{tag.icon}</span>
                              {tag.label}
                          </button>
                      );
                  })}
              </div>

              <div className="mt-16 h-12">
                  {selectedTags.length > 0 && (
                      <button 
                        onClick={() => setStep('chat')}
                        className="px-12 py-3 bg-white text-slate-900 rounded-full font-display tracking-widest hover:scale-105 transition-transform animate-fade-in-up"
                      >
                          进入对话
                      </button>
                  )}
              </div>
          </div>
      );
  }

  // 2. Chat Interview View
  if (step === 'chat') {
      return (
          <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-3xl mx-auto pb-safe-area">
              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-1 mb-8 mt-4">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(questionCount / 5) * 100}%` }}
                  ></div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-24">
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-5 rounded-2xl backdrop-blur-md border animate-fade-in-up ${
                              msg.role === 'user' 
                              ? 'bg-indigo-500/20 border-indigo-500/30 text-white rounded-br-none'
                              : 'bg-white/5 border-white/10 text-slate-200 rounded-bl-none'
                          }`}>
                              <p className="leading-relaxed font-light">{msg.text}</p>
                          </div>
                      </div>
                  ))}
                  {isTyping && (
                       <div className="flex justify-start animate-fade-in-up">
                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none flex space-x-2">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                       </div>
                  )}
                  <div ref={chatBottomRef}></div>
              </div>

              {/* Input Area */}
              <div className="fixed bottom-[80px] left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
                  <div className="max-w-3xl mx-auto relative">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="输入您的回答..."
                        className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-cyan-400/50 backdrop-blur-md placeholder-slate-500"
                        autoFocus
                      />
                      <button 
                        onClick={handleSendMessage}
                        disabled={!userInput.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-white rounded-full text-slate-900 disabled:opacity-50 hover:bg-cyan-50 transition-colors"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // 3. Upload View
  if (step === 'upload') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in-up pb-safe-area">
            <h2 className="text-3xl font-display text-white mb-8 text-center">最后一步：视觉感知</h2>
            
            <div 
                className="group w-full max-w-md aspect-[3/4] border-2 border-dashed border-white/20 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
            >
                {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="User" />
                ) : (
                    <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-400">上传照片，完成灵韵拼图</p>
                    </div>
                )}
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            {image && (
                <button 
                  onClick={startAnalysis}
                  className="mt-8 px-12 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-full text-white font-display tracking-widest shadow-lg shadow-cyan-900/40 hover:scale-105 transition-transform"
                >
                    生成专属方案
                </button>
            )}
        </div>
      );
  }

  // 4. Analyzing State
  if (step === 'analyzing') {
       return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-aurora-intense pb-safe-area">
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-64 bg-cyan-500/20 rounded-full blur-[60px] animate-breathe"></div>
                 <div className="absolute w-48 h-48 bg-indigo-500/20 rounded-full blur-[40px] animate-breathe" style={{animationDelay: '1s'}}></div>
             </div>
             <div className="relative z-10 text-center glass-panel px-12 py-16 rounded-[3rem]">
                 <div className="w-24 h-24 border-t-2 border-r-2 border-white/20 rounded-full animate-spin mx-auto mb-8"></div>
                 <h3 className="text-2xl font-display text-white mb-2">正在调配灵韵...</h3>
                 <p className="text-cyan-200/60 font-light text-sm tracking-widest">ANALYZING AURA</p>
             </div>
        </div>
    );
  }

  // 5. Result Story View
  return (
      <div className="fixed inset-0 bg-[#0f172a] overflow-hidden flex flex-col animate-fade-in-up">
        {/* Navigation */}
       <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
           <div className="flex space-x-2">
               {[0, 1, 2].map(idx => (
                   <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}></div>
               ))}
           </div>
           <button onClick={() => setStep('tags')} className="text-white/70 hover:text-white">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
           </button>
       </div>

       <div className="flex-1 relative w-full h-full flex flex-col justify-center">
            {/* Slide 0: Atmosphere */}
           <div className={`absolute inset-0 transition-all duration-700 transform ${currentSlide === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
               <div className="h-full flex flex-col items-center justify-center p-8 text-center relative">
                   <div className="absolute top-0 left-0 w-full h-[70%] z-0">
                       <img src={image!} className="w-full h-full object-cover opacity-60 mask-gradient-b" style={{filter: 'blur(2px)'}} alt="User Aura" />
                   </div>
                   <div className="relative z-10 mt-[40vh]">
                        <h2 className="text-6xl md:text-8xl font-display font-light text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-transparent mb-6 drop-shadow-lg tracking-tight">
                            {analysis?.atmosphere.split(' ')[0]}
                        </h2>
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-6"></div>
                        <p className="text-xl font-light text-cyan-100/90 leading-relaxed font-display max-w-md mx-auto">
                            "{analysis?.quote}"
                        </p>
                        <div className="mt-8 text-sm text-slate-400 font-sans tracking-widest uppercase animate-pulse">滑动查看分析</div>
                   </div>
               </div>
           </div>

           {/* Slide 1: Details */}
           <div className={`absolute inset-0 transition-all duration-700 transform ${currentSlide === 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
               <div className="h-full flex flex-col p-8 pt-24 pb-32 relative overflow-y-auto">
                    <div className="glass-panel p-8 rounded-[2rem] mb-6">
                        <h4 className="text-white font-display text-lg mb-4">面相与能量</h4>
                        <p className="text-lg text-slate-200 leading-relaxed font-light">
                            {analysis?.facialFeatures}
                        </p>
                    </div>
                    <div className="glass-panel p-8 rounded-[2rem] mb-6">
                        <h4 className="text-white font-display text-lg mb-4">核心诉求</h4>
                        <div className="flex flex-wrap gap-2">
                             {selectedTags.map(t => (
                                 <span key={t} className="px-3 py-1 bg-white/10 rounded-full text-sm text-cyan-200">{t}</span>
                             ))}
                        </div>
                    </div>
               </div>
           </div>

           {/* Slide 2: Product */}
           <div className={`absolute inset-0 transition-all duration-700 transform ${currentSlide === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
               <div className="h-full flex flex-col relative">
                   <div className="absolute top-0 w-full h-[50%] mask-gradient-b z-0">
                       <img src={posterBg!} className="w-full h-full object-cover opacity-80" alt="Product" />
                   </div>
                   <div className="flex-1 flex flex-col justify-end p-8 pb-32 z-10">
                        <div className="glass-panel rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl border border-white/10 bg-slate-900/60">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-xs text-cyan-400 font-bold tracking-[0.2em] uppercase mb-2">Recommended</p>
                                    <h2 className="text-3xl font-display text-white">{analysis?.suggestedOils[0]?.name}</h2>
                                    <p className="text-slate-400 text-sm italic">{analysis?.suggestedOils[0]?.englishName}</p>
                                </div>
                                <div className="text-4xl">
                                    {getCategoryStyle(analysis?.suggestedOils[0]?.category).icon}
                                </div>
                            </div>
                            <div className="space-y-4 mb-6">
                                {analysis?.suggestedOils.map((oil, idx) => {
                                    const style = getCategoryStyle(oil.category);
                                    return (
                                        <div key={idx} className={`flex items-center p-3 rounded-2xl ${style.bg} ${style.border} border`}>
                                            <span className="mr-3 text-lg">{style.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className={`text-sm font-medium ${style.text}`}>{oil.name}</span>
                                                    <span className="text-[10px] text-white/50 border border-white/10 px-1 rounded">{oil.note} Note</span>
                                                </div>
                                                <span className="text-xs text-white/60 block">{oil.benefit}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-medium hover:bg-cyan-50 transition-colors">
                                已保存至灵感中心
                            </button>
                        </div>
                   </div>
               </div>
           </div>

           {/* Arrows */}
           <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-w-resize opacity-0 hover:opacity-100 flex items-center justify-start pl-4" onClick={() => currentSlide > 0 && setCurrentSlide(p => p - 1)}>
               {currentSlide > 0 && <div className="p-2 bg-white/10 rounded-full"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></div>}
           </div>
           <div className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-e-resize opacity-0 hover:opacity-100 flex items-center justify-end pr-4" onClick={() => currentSlide < 2 && setCurrentSlide(p => p + 1)}>
               {currentSlide < 2 && <div className="p-2 bg-white/10 rounded-full"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>}
           </div>
       </div>
      </div>
  );
};

export default AnalysisView;