export interface Oil {
  name: string;
  englishName: string;
  benefit: string;
  note: string; // Top, Middle, Base note
  category: string; // e.g., Floral, Citrus, Woody, Herbaceous, Spicy
}

export interface AnalysisResult {
  id?: string; // Unique ID for saving
  date?: string; // Date of creation
  atmosphere: string;
  facialFeatures: string;
  suggestedOils: Oil[];
  posterPrompt: string; 
  quote: string; 
}

export interface PosterData {
  imageUrl: string;
  result: AnalysisResult;
}

export interface CustomFormulaResult {
  name: string;
  description: string;
  oils: Oil[];
  usage: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  TEST_CENTER = 'TEST_CENTER',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
}

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'rain', name: '静谧雨声', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditative-rain-111533.mp3' },
  { id: 'zen', name: '禅意花园', url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1e37517cce.mp3?filename=zen-garden-124978.mp3' },
  { id: 'deep', name: '深海冥想', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3?filename=deep-meditation-1965.mp3' },
  { id: 'forest', name: '晨间森林', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_0316499691.mp3?filename=forest-lullaby-110624.mp3' }
];

export const TAG_OPTIONS = [
  { id: 'fatigue', label: '疲劳', icon: '😫' },
  { id: 'anxiety', label: '焦虑', icon: '🌪️' },
  { id: 'insomnia', label: '失眠', icon: '🌑' },
  { id: 'dryness', label: '干燥', icon: '🍂' },
  { id: 'stress', label: '压力', icon: '⚡' },
  { id: 'uninspired', label: '缺乏灵感', icon: '🌫️' },
  { id: 'focus', label: '难以专注', icon: '😵‍💫' },
  { id: 'mood', label: '情绪低落', icon: '🌧️' },
];