import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { audioFiles } from "../utils/audio";

interface AITimerProps {
  onClose: () => void;
}

export function AITimer({ onClose }: AITimerProps) {
  const [time, setTime] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio(audioFiles.aiAsk)); // Create audio once

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      onClose();
    }
    return () => clearInterval(interval);
  }, [isRunning, time, onClose]);

  const startTimer = () => {
    setIsRunning(true);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((error) => console.error("Error playing AI ask audio:", error));
  };

  const pauseTimer = () => {
    setIsRunning(false);
    audioRef.current.pause();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(20);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return (
    <div className="ai-timer-overlay">
      <div className="ai-timer-popup">
        <div className="google-assistant">
          <svg className="assistant-logo" viewBox="0 0 24 24" width="40" height="40">
            <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <circle fill="#34A853" cx="12" cy="12" r="4"/>
          </svg>
          <span>Google Assistant</span>
        </div>
        <div className="ai-timer-display">{time}</div>
        <div className="ai-timer-controls">
          <button onClick={isRunning ? pauseTimer : startTimer} className="ai-timer-button">
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button onClick={resetTimer} className="ai-timer-button">
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
        <button onClick={onClose} className="ai-timer-close">
          Close
        </button>
      </div>
    </div>
  );
}
