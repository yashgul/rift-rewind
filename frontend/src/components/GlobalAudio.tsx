import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";

const GlobalAudio = () => {
  const [isMuted, setIsMuted] = useState(false); // Start unmuted by default
  const [volume, setVolume] = useState(0.3); // Default volume
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Initialize audio on mount
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.volume = volume;
      audio.muted = false; // Try unmuted first
      
      // Try to play unmuted
      audio.play().catch((error) => {
        console.log("Autoplay unmuted blocked, trying muted:", error);
        // If autoplay is blocked, mute and try again
        audio.muted = true;
        setIsMuted(true);
        audio.play().catch((err) => {
          console.log("Autoplay completely blocked:", err);
          // Still blocked, user will need to interact first
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update muted state when isMuted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    // If unmuting, try to play the audio
    if (!newMutedState && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Play failed:", error);
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    // Unmute if volume is increased from 0
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      // Try to play when unmuting via volume slider
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.log("Play failed:", error);
        });
      }
    }
    // Mute if volume is set to 0
    if (newVolume === 0) {
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/orb_of_winter.mp3" type="audio/mpeg" />
      </audio>

      {/* Volume Controls */}
      <div 
        className="fixed top-6 right-6 z-50 flex items-center gap-3"
        onMouseEnter={() => setShowVolumeSlider(true)}
        onMouseLeave={() => setShowVolumeSlider(false)}
      >
        {/* Volume Slider */}
        {showVolumeSlider && (
          <div className="bg-card/80 backdrop-blur-md border border-lol-gold/30 rounded-lg px-4 py-3 shadow-lg">
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.01}
              className="w-32"
            />
          </div>
        )}
        
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-card/40 backdrop-blur-md border border-lol-gold/30 hover:bg-card/60 hover:border-lol-gold transition-all duration-300 hover:shadow-gold group"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-lol-gold" />
          ) : (
            <Volume2 className="w-5 h-5 text-lol-gold group-hover:animate-pulse" />
          )}
        </button>
      </div>
    </>
  );
};

export default GlobalAudio;

