export type CardRarity = string;

export interface RarityConfig {
  id: string; 
  imageUrl: string;
  videoUrl?: string; // For animated cards
  textColorName?: string;
  textColorStatsLabel?: string;
  textColorStatsValue?: string;
  textColorOvr?: string;
}

export const DEFAULT_RARITY_CONFIGS: RarityConfig[] = [
  { id: 'BRONZE', imageUrl: 'https://i.imghippo.com/files/TmM6820WtQ.png', textColorName: '#F5E6C8', textColorStatsLabel: '#F5E6C8', textColorStatsValue: '#F5E6C8', textColorOvr: '#F5E6C8' },
  { id: 'SILVER', imageUrl: 'https://i.imghippo.com/files/zC9861peQ.png', textColorName: '#0a0a0a', textColorStatsLabel: '#5c4d3c', textColorStatsValue: '#0a0a0a', textColorOvr: '#FFFFFF' },
  { id: 'GOLD', imageUrl: 'https://i.imghippo.com/files/tUt8745JBc.png', textColorName: '#0a0a0a', textColorStatsLabel: '#5c4d3c', textColorStatsValue: '#0a0a0a', textColorOvr: '#F5E6C8' },
  { id: 'ROTM', imageUrl: 'https://i.imghippo.com/files/UGRy5126YM.png', textColorName: '#00FFFF', textColorStatsLabel: '#00FFFF', textColorStatsValue: '#00FFFF', textColorOvr: '#00FFFF' },
  { id: 'ICON', imageUrl: 'https://i.imghippo.com/files/jdCC2070F.png', textColorName: '#0a0a0a', textColorStatsLabel: '#5c4d3c', textColorStatsValue: '#0a0a0a', textColorOvr: '#000000' },
  { id: 'ROTY', imageUrl: 'https://res.cloudinary.com/dajbohgkl/image/upload/v1770131135/ROTY_xienje.webp', textColorName: '#FFFFFF', textColorStatsLabel: '#FFFFFF', textColorStatsValue: '#FFFFFF', textColorOvr: '#FFFFFF' },
  { id: 'ROTY ANIMATED', imageUrl: 'https://i.imghippo.com/files/PG9297qJ.png', videoUrl: 'https://res.cloudinary.com/dajbohgkl/video/upload/v1773042458/RealROTYanimation_vlgi2c.webm', textColorName: '#FFFFFF', textColorStatsLabel: '#FFFFFF', textColorStatsValue: '#FFFFFF', textColorOvr: '#FFFFFF' },
  { id: 'ROTY ICON', imageUrl: 'https://i.imghippo.com/files/iwZR6344ujs.png', textColorName: '#000000', textColorStatsLabel: '#000000', textColorStatsValue: '#000000', textColorOvr: '#000000' },
  { id: 'FIGHTERS', imageUrl: 'https://res.cloudinary.com/dajbohgkl/image/upload/v1769857631/Gemini_Generated_Image_1thov51thov51tho_1_ppjydc.png', textColorName: '#F5E6C8', textColorStatsLabel: '#F5E6C8', textColorStatsValue: '#F5E6C8', textColorOvr: '#F5E6C8' },
  { id: 'WATN', imageUrl: 'https://res.cloudinary.com/dajbohgkl/image/upload/v1769867674/Gemini_Generated_Image_ggfslsggfslsggfs_1_yyypqt.png', textColorName: '#FFD700', textColorStatsLabel: '#FFD700', textColorStatsValue: '#FFD700', textColorOvr: '#FFD700' },
  { id: 'HERO', imageUrl: 'https://res.cloudinary.com/dajbohgkl/image/upload/v1770318066/Gemini_Generated_Image_ni624cni624cni62_1_xpx30q.png', textColorName: '#FFD700', textColorStatsLabel: '#FFD700', textColorStatsValue: '#FFD700', textColorOvr: '#FFD700' }
];

export const CardRarityValues = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  ROTM: 'ROTM',
  ICON: 'ICON',
  ROTY: 'ROTY',
  ROTY_ANIMATED: 'ROTY ANIMATED',
  ROTY_ICON: 'ROTY ICON',
  FIGHTERS: 'FIGHTERS',
  WATN: 'WATN',
  HERO: 'HERO'
} as const;

export interface CardStats {
  ovr: number;
  lyricism: number;
  flow: number;
  sing: number;
  live: number;
  diss: number;
  charisma: number;
}

export interface SuperPower {
  id: string;
  name: string;
  iconUrl: string;
}

export interface RapperCardData {
  name: string;
  rarity: CardRarity;
  stats: CardStats;
  image: string | null; // Base64 or URL
  imagePosition: { x: number; y: number; scale: number };
  superpowers: SuperPower[];
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "2:3" | "3:2" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";

export const DEFAULT_SUPERPOWERS: SuperPower[] = [
  { id: 'rhymes', name: 'Rhymes Crafter', iconUrl: 'https://i.imghippo.com/files/vNrv7527Vlk.png' },
  { id: 'showmaker', name: 'ShowMaker', iconUrl: 'https://i.imghippo.com/files/RQb3623EB.png' },
  { id: 'artist', name: 'The Artist', iconUrl: 'https://i.imghippo.com/files/um8756xU.png' },
  { id: 'words', name: 'Words Bender', iconUrl: 'https://i.imghippo.com/files/phdJ6111L.png' },
  { id: 'story', name: 'Storyteller', iconUrl: 'https://i.imghippo.com/files/iCc6391Tg.png' },
  { id: 'battler', name: 'Battler', iconUrl: 'https://i.imghippo.com/files/KET1640s.png' },
  { id: 'career', name: 'Career Killer', iconUrl: 'https://i.imghippo.com/files/tev2511DrE.png' },
  { id: 'chopper', name: 'Chopper', iconUrl: 'https://i.imghippo.com/files/Fg5274pck.png' },
  { id: 'flow', name: 'Flow Switcher', iconUrl: 'https://i.imghippo.com/files/dHI7636jUs.png' },
  { id: 'freestyle', name: 'Freestyler', iconUrl: 'https://i.imghippo.com/files/Fkz1064WCk.png' },
  { id: 'notes', name: 'Notes Master', iconUrl: 'https://i.imghippo.com/files/em5378FZE.png' },
  { id: 'punchline', name: 'Punchline Machine', iconUrl: 'https://i.imghippo.com/files/EFHO4474cYk.png' },
];