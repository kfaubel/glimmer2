export interface ScreenItem {
  enabled?: boolean;
  month?: string; // blank or "1:5" for Jan - May
  friendlyName: string;
  nextUpdate?: number;
  resource: string;
  displaySecs: number;
  refreshMinutes: number;
  image?: HTMLImageElement | null;
  imageUri: string;
  message: string;
  timeBug: string;
}

export interface ScreenState {
  screen: ScreenItem;
  fade: 'fadeIn' | 'fadeOut' | '';
}

export interface AppProps {
  sequencer: any; // Will be properly typed when Sequence is imported
}

export interface MessageProps {
  message: string;
}

export interface TimeBugProps {
  location: string;
}

export type TimeBugLocation =
  | 'lower-right-light'
  | 'lower-right-dark'
  | 'upper-right-light'
  | 'upper-right-dark'
  | '';
