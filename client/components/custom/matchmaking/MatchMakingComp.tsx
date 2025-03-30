import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const tips = [
  "🔥 Stay cool, stay sharp. The clock is your real enemy!",
  "🎯 Read fast, think faster. Every second counts.",
  "⚡ Speed is key, but clean code wins wars.",
  "💀 Bugs are your downfall—debug like a champion!",
  "🧠 Plan before you type. Smart moves win duels.",
  "⚔️ Great coders don’t reinvent the wheel—use what works!",
  "⏳ Lag won’t save you—only optimized code will.",
  "👀 Your opponent sees your comments. Play mind games wisely.",
  "🔓 Think like a hacker, code like a pro.",
  "🚫 One syntax error could cost you the match. Stay sharp!"
];


export default function MatchmakingScreen() {
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [searchTime, setSearchTime] = useState(0);
  
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 5000);
    
    const timerInterval = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(tipInterval);
      clearInterval(timerInterval);
    };
  }, []);
  
  // Format the search time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cyber-black text-white overflow-hidden relative">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30"></div>
      
      {/* Scanline effect */}
      <div className="cyber-scanline"></div>
      
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-cyber-blue/5 animate-neon-pulse pointer-events-none"></div>
      
      {/* Content container */}
      <motion.div 
        className="cyber-border p-12 relative z-10 w-full max-w-xl bg-cyber-black/80 cyber-clip-corner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="font-display text-3xl mb-8 text-cyber-blue cyber-text-shadow">MATCHMAKING IN PROGRESS</h2>
          
          {/* VS animation */}
          <div className="relative mb-8 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute w-40 h-40 border border-cyber-blue rounded-full opacity-20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute w-48 h-48 border border-cyber-pink rounded-full opacity-10"
            />
            
            <motion.div
              animate={{ 
                boxShadow: ["0 0 20px rgba(0, 240, 255, 0.5)", "0 0 40px rgba(0, 240, 255, 0.8)", "0 0 20px rgba(0, 240, 255, 0.5)"]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative h-24 w-24 rounded-full bg-cyber-black border-2 border-cyber-blue flex items-center justify-center z-10"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: ["#00f0ff", "#ff003c", "#00f0ff"] 
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-2xl font-display font-bold"
              >
                VS
              </motion.div>
            </motion.div>
          </div>
          
          {/* Searching text */}
          <div className="mb-6 relative">
            <motion.p 
              className="text-xl font-cyber text-cyber-blue"
              animate={{ textShadow: ["0 0 5px #00f0ff", "0 0 15px #00f0ff", "0 0 5px #00f0ff"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              SCANNING NETWORK FOR OPPONENTS
            </motion.p>
            
            {/* Loading dots */}
            <motion.div 
              className="flex justify-center mt-2"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
            >
              <div className="flex space-x-2">
                <span className="h-2 w-2 bg-cyber-blue rounded-full"></span>
                <span className="h-2 w-2 bg-cyber-blue rounded-full"></span>
                <span className="h-2 w-2 bg-cyber-blue rounded-full"></span>
              </div>
            </motion.div>
          </div>
          
          {/* Search time */}
          <p className="text-sm font-cyber text-cyber-pink mb-4">
            SEARCH TIME: <span className="text-cyber-yellow">{formatTime(searchTime)}</span>
          </p>
          
          {/* Estimated wait */}
          <div className="w-full h-2 bg-cyber-black border border-cyber-blue mb-8">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-pink"
              initial={{ width: "10%" }}
              animate={{ width: ["10%", "70%", "40%", "90%", "60%"] }}
              transition={{ 
                repeat: Infinity, 
                duration: 15, 
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeInOut" 
              }}
            />
          </div>
          
          {/* Tip display */}
          <div className="h-16 flex items-center justify-center">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <p className="text-cyber-green font-cyber">
                <span className="text-cyber-yellow">[TIP]</span> {currentTip}
              </p>
            </motion.div>
          </div>
          
          {/* Cancel button */}
          <div className="mt-8">
            <button 
              className="cyber-border border-cyber-pink bg-cyber-black px-6 py-2 font-cyber text-cyber-pink hover:bg-cyber-pink/10 transition-all cyber-clip-corner"
            >
              CANCEL SEARCH
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Player stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute bottom-6 left-6 cyber-border p-3 bg-cyber-black/80 cyber-clip-corner"
      >
        <p className="text-sm font-cyber">
          <span className="text-cyber-blue">PLAYERS ONLINE:</span> <span className="text-cyber-yellow">342</span>
        </p>
        <p className="text-sm font-cyber">
          <span className="text-cyber-blue">MATCHES IN PROGRESS:</span> <span className="text-cyber-yellow">48</span>
        </p>
      </motion.div>
      
      {/* Skill range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-6 right-6 cyber-border p-3 bg-cyber-black/80 cyber-clip-corner"
      >
        <p className="text-sm font-cyber">
          <span className="text-cyber-blue">SKILL RANGE:</span> <span className="text-cyber-yellow">1200-1450</span>
        </p>
        <p className="text-sm font-cyber">
          <span className="text-cyber-blue">YOUR RATING:</span> <span className="text-cyber-yellow">1337</span>
        </p>
      </motion.div>
    </div>
  );
}