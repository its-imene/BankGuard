import { useRef, useCallback } from 'react';

/**
 * useNotificationSound
 *
 * Returns a `play()` function that plays the notification sound.
 * The Audio object is created once and reused — calling play() while it's
 * already playing rewinds it to the start so rapid notifications always fire.
 * Respects local storage 'notifMuted' and 'notifVolume' preferences.
 *
 * Usage:
 *   const playSound = useNotificationSound();
 *   playSound();           // plays using volume preference (or 0.7 default)
 *   playSound(0.5);        // plays at 50% volume overriding preference
 */
const useNotificationSound = (src = '/sounds/mixkit-bell-notification-933.wav') => {
  const audioRef = useRef(null);

  // Lazily create the Audio element on first call
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    return audioRef.current;
  }, [src]);

  const play = useCallback((overrideVolume = null) => {
    try {
      // 1. Check mute state
      const isMuted = localStorage.getItem('notifMuted') === 'true';
      if (isMuted && overrideVolume === null) {
        return; // Ignore playing if muted, unless specifically overridden for previewing
      }

      // 2. Resolve volume (defaulting to localStorage volume or 0.7 fallback)
      const storedVol = localStorage.getItem('notifVolume');
      const resolvedVolume = overrideVolume !== null 
        ? overrideVolume 
        : (storedVol !== null ? parseFloat(storedVol) : 0.7);

      const audio = getAudio();
      audio.volume = Math.min(1, Math.max(0, resolvedVolume));
      
      // Rewind so rapid notifications always play from the start
      audio.currentTime = 0;
      
      // play() returns a Promise — silently ignore AbortError from rapid calls
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('[NotificationSound] Could not play sound:', err.message);
        }
      });
    } catch (err) {
      console.warn('[NotificationSound] Audio error:', err.message);
    }
  }, [getAudio]);

  return play;
};

export default useNotificationSound;
