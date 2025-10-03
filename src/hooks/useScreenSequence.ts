import { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenItem, ScreenState } from '../types';
import { Sequence } from '../utils/Sequence';
import { APP_CONFIG } from '../constants';

export const useScreenSequence = (sequencer: Sequence) => {
  const [screenState, setScreenState] = useState<ScreenState>({
    screen: sequencer.getFirst(),
    fade: '',
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fadeOut = useCallback((screen: ScreenItem) => {
    setScreenState({ screen, fade: 'fadeOut' });
    setTimeout(fadeInNew, APP_CONFIG.FADE_OUT_DELAY_MS, screen);
  }, []);

  const fadeInNew = useCallback((currentScreen: ScreenItem) => {
    const newScreen = sequencer.getNext();
    setScreenState({ screen: newScreen, fade: 'fadeIn' });

    let displayTimeMs = newScreen.displaySecs * 1000;
    if (newScreen.image === null) {
      displayTimeMs = APP_CONFIG.NULL_IMAGE_DISPLAY_TIME_MS;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(fadeOut, displayTimeMs, newScreen);
  }, [sequencer, fadeOut]);

  useEffect(() => {
    if (screenState.fade === '') {
      console.log('First time, setting fadeOut timeout');
      timeoutRef.current = setTimeout(
        fadeOut,
        APP_CONFIG.INITIAL_DISPLAY_TIME_MS,
        screenState.screen
      );
    }

    if (screenState.fade === 'fadeIn') {
      console.log(`App: showing screen: ${screenState.screen.friendlyName}`);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [screenState, fadeOut]);

  return screenState;
};
