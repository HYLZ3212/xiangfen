import React from 'react';
import { MusicTrack, MUSIC_TRACKS } from '../types';

interface SettingsViewProps {
  currentTrack: MusicTrack;
  isPlaying: boolean;
  onTrackSelect: (track: MusicTrack) => void;
  onTogglePlay: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onTogglePlay 
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-6 pb-safe-area animate-fade-in-up min-h-screen">
      <h2 className="text-3xl font-display font-light text-white mb-8 mt-4">设置</h2>
      
      <div className="glass-panel rounded-[2rem] p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">背景音乐</h3>
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isPlaying ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-500'}`}>
                    {isPlaying ? (
                         <div className="flex space-x-1 h-3">
                            <div className="w-0.5 bg-current animate-[breathe_1s_infinite]"></div>
                            <div className="w-0.5 bg-current animate-[breathe_1.2s_infinite]"></div>
                            <div className="w-0.5 bg-current animate-[breathe_0.8s_infinite]"></div>
                         </div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div>
                    <span className="block text-white font-medium">{isPlaying ? '正在播放' : '已暂停'}</span>
                    <span className="text-xs text-slate-400">{currentTrack.name}</span>
                </div>
            </div>
            <button 
                onClick={onTogglePlay}
                className={`w-12 h-7 rounded-full transition-colors relative ${isPlaying ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${isPlaying ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
        </div>

        <div className="space-y-3">
            {MUSIC_TRACKS.map(track => (
                <button
                    key={track.id}
                    onClick={() => onTrackSelect(track)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                        currentTrack.id === track.id 
                        ? 'bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30' 
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                >
                    <span className={`text-sm ${currentTrack.id === track.id ? 'text-cyan-200' : 'text-slate-300'}`}>
                        {track.name}
                    </span>
                    {currentTrack.id === track.id && (
                        <span className="text-cyan-400 text-xs">●</span>
                    )}
                </button>
            ))}
        </div>
      </div>
      
      <div className="text-center text-slate-600 text-xs font-light mt-12">
          <p>灵韵 Aura Scents v2.0</p>
      </div>
    </div>
  );
};

export default SettingsView;