import React, { useState } from 'react';
import { generateCustomScent } from '../services/geminiService';
import { CustomFormulaResult } from '../types';

interface CustomViewProps {
  onBack: () => void;
}

const getCategoryColor = (category: string = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('flor') || cat.includes('花')) return 'text-pink-300 bg-pink-500/20 border-pink-500/30';
  if (cat.includes('citr') || cat.includes('柑')) return 'text-yellow-200 bg-yellow-500/20 border-yellow-500/30';
  if (cat.includes('wood') || cat.includes('木')) return 'text-stone-300 bg-stone-500/20 border-stone-500/30';
  if (cat.includes('herb') || cat.includes('草')) return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30';
  return 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30';
};

const CustomView: React.FC<CustomViewProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomFormulaResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const data = await generateCustomScent(prompt);
      setResult(data);
    } catch (err) {
      alert("生成方案失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 animate-fade-in-up min-h-screen flex flex-col">
       <div className="mb-8">
            <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                返回首页
            </button>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Input Section */}
        <div className="glass-panel rounded-[2.5rem] p-10 h-full flex flex-col border border-white/5">
          <h2 className="text-3xl font-serif text-white mb-6">深度定制</h2>
          <p className="text-slate-400 mb-8 text-sm font-light leading-relaxed">
            请告诉我们您当下的状态、期望的疗愈功效（如安神助眠、冥想专注、缓解焦虑）或偏好的香调家族。AI调香师将为您构筑专属配方。
          </p>
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
            <textarea
              className="w-full flex-grow p-6 bg-slate-900/50 rounded-2xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none text-slate-200 placeholder-slate-600 mb-6 transition-all"
              rows={6}
              placeholder="例如：最近工作压力很大，经常失眠，希望能有一款木质调的精油帮助我放松入睡..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`w-full py-4 rounded-xl font-medium text-white tracking-wider transition-all ${
                loading || !prompt.trim() ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                  <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      正在调配...
                  </span>
              ) : '生成专属配方'}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="relative min-h-[500px] rounded-[2.5rem] overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900/80"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-1000"></div>

          {!result ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 z-10">
                <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                   </svg>
                </div>
               <p className="font-light tracking-widest text-sm uppercase">等待灵感降临</p>
            </div>
          ) : (
            <div className="absolute inset-0 p-10 flex flex-col z-20 animate-fade-in-up">
              <div className="mb-8">
                <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Custom Blend</span>
                <h3 className="text-4xl font-serif text-white mt-3 mb-2">{result.name}</h3>
                <p className="text-slate-300 mt-2 text-sm leading-relaxed font-light">{result.description}</p>
              </div>

              <div className="glass-panel rounded-3xl p-6 mb-8 flex-1 overflow-y-auto custom-scrollbar">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">配方详情</h4>
                 <ul className="space-y-4">
                    {result.oils.map((oil, idx) => (
                       <li key={idx} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-slate-200 text-lg">{oil.name}</span>
                              {oil.category && (
                                <span className={`ml-3 text-[10px] px-2 py-0.5 rounded border ${getCategoryColor(oil.category)}`}>
                                  {oil.category}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block mt-1 font-serif italic">{oil.englishName}</span>
                          </div>
                          <div className="text-right pl-2">
                             <span className="text-xs text-cyan-200/80 block">{oil.benefit}</span>
                          </div>
                       </li>
                    ))}
                 </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">使用建议</h4>
                <p className="text-slate-300 text-sm font-light">{result.usage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomView;