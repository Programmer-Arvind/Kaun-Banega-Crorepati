import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "../styles/SplashScreen.css";
import logoImage from "../assets/logo.png";
import { audioFiles } from "../utils/audio";

const SplashScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Audio Source:", audioFiles.kbcIntro); // Debugging audio path

    if (!audioRef.current) {
      audioRef.current = new Audio(audioFiles.kbcIntro);
    }

    // Autoplay the audio when the component loads
    audioRef.current.play().catch((error) => console.error("Error playing audio:", error));

    gsap.to("#logo", { opacity: 1, duration: 2, delay: 0.5 });
    gsap.to("#button", { y: 0, opacity: 1, duration: 1.5, ease: "bounce.out", delay: 2 });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => console.error("Error playing audio:", error));
    }
    navigate("/game");
  };

  return (
    <div className="splash-screen">
      <div id="logo" className="logo">
        <img src={logoImage} alt="KBC Logo" />
      </div>

      <div id="button" className="play-button">
        <button onClick={handlePlay}>PLAY</button>
      </div>
    </div>
  );
};

export default SplashScreen;
