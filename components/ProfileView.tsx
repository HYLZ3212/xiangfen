import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';

interface SavedItem extends AnalysisResult {
    savedAt: number;
    posterImage: string; // Base64 of the generated poster
}

const ProfileView: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem('aura_saved_results');
    if (loaded) {
        try {
            setSavedItems(JSON.parse(loaded));
        } catch (e) {
            console.error("Failed to load saved results");
        }
    }
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 animate-fade-in-up min-h-screen pb-safe-area">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h2 className="text-3xl font-display font-light text-white">灵感中心</h2>
        <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">{savedItems.length} Saved</span>
      </div>

      {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
              </div>
              <p>暂无保存的香氛方案</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedItems.map((item, idx) => (
                  <div key={idx} className="glass-panel rounded-[2rem] overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
                      <div className="h-64 relative">
                          <img src={item.posterImage} alt={item.atmosphere} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-6">
                              <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider">{item.date}</p>
                              <h3 className="text-xl font-display text-white">{item.atmosphere}</h3>
                          </div>
                      </div>
                      <div className="p-6">
                          <p className="text-sm text-slate-300 mb-4 line-clamp-2 font-light">"{item.quote}"</p>
                          <div className="flex flex-wrap gap-2">
                              {item.suggestedOils.slice(0, 2).map((oil, oIdx) => (
                                  <span key={oIdx} className="text-xs border border-white/20 px-2 py-1 rounded-full text-white/70">
                                      {oil.name}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ProfileView;