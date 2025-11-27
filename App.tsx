import React, { useState, useRef, useEffect } from 'react';
import { AppView, MusicTrack, MUSIC_TRACKS } from './types';
import AnalysisView from './components/AnalysisView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.TEST_CENTER);
  
  // Global Music State
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt auto-play on first interaction logic is handled by user interaction now
    if (audioRef.current) {
        audioRef.current.volume = 0.3;
        if (isPlaying) {
            audioRef.current.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const selectTrack = (track: MusicTrack) => {
      setCurrentTrack(track);
      setIsPlaying(true);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.SETTINGS:
        return <SettingsView 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onTrackSelect={selectTrack}
            onTogglePlay={togglePlay}
        />;
      case AppView.PROFILE:
        return <ProfileView />;
      case AppView.TEST_CENTER:
      default:
        return <AnalysisView />;
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Global Audio Player (Hidden) */}
      <audio ref={audioRef} src={currentTrack.url} loop />

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
             <div className="glass-panel rounded-full backdrop-blur-xl bg-slate-900/80 border border-white/10 shadow-2xl flex justify-around items-center h-16 px-2">
                
                <button 
                    onClick={() => setView(AppView.SETTINGS)}
                    className={`flex flex-col items-center justify-center w-20 h-full transition-all ${view === AppView.SETTINGS ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-medium tracking-wide">设置</span>
                </button>

                <button 
                    onClick={() => setView(AppView.TEST_CENTER)}
                    className="relative -top-6"
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 border-4 border-[#0f172a] ${
                        view === AppView.TEST_CENTER 
                        ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                </button>

                <button 
                    onClick={() => setView(AppView.PROFILE)}
                    className={`flex flex-col items-center justify-center w-20 h-full transition-all ${view === AppView.PROFILE ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] font-medium tracking-wide">个人中心</span>
                </button>
                
             </div>
          </div>
      </div>
    </div>
  );
};

export default App;