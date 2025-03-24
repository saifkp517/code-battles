import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Star } from 'lucide-react';


export const GameWinOverlay = ({ onComplete, isVisible = false, finalScore = 54 }) => {
    const containerRef = useRef(null);
    const starsRef = useRef([]);
    const timelineRef = useRef(null);
    const [score, setScore] = useState(0);
    
    useEffect(() => {
      if (isVisible) {
        startAnimation();
      } else {
        // Clean up if component hides
        cleanupStars();
      }
      
      return () => {
        cleanupStars();
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
      };
    }, [isVisible]);
    
    const cleanupStars = () => {
      starsRef.current.forEach(star => {
        if (star && star.parentNode) {
          star.parentNode.removeChild(star);
        }
      });
      starsRef.current = [];
    };
    
    const createStar = () => {
      if (!containerRef.current) return null;
      
      const star = document.createElement('div');
      star.className = 'absolute';
      star.innerHTML = `<svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>`;
      
      // Position the star randomly around the container
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 200;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      gsap.set(star, { 
        x: x,
        y: y,
        scale: 0,
        opacity: 0
      });
      
      containerRef.current.appendChild(star);
      starsRef.current.push(star);
      
      return star;
    };
    
    const startAnimation = () => {
      setScore(0);
      cleanupStars();
      
      // Kill previous timeline if exists
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      
      const tl = gsap.timeline({
        onComplete: () => {
          // Wait a bit before calling onComplete
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1500);
        }
      });
      
      timelineRef.current = tl;
      
      // Create the win text animation
      tl.to(".win-text", { 
        duration: 0.7, 
        scale: 1.2, 
        opacity: 1, 
        ease: "elastic.out(1, 0.3)" 
      });
      
      // Create and animate stars
      for (let i = 0; i < finalScore - 1; i++) {
        const star = createStar();
        if (!star) continue;
        
        // Stagger the star appearance
        tl.to(star, {
          duration: 0.3,
          scale: 1,
          opacity: 1,
          ease: "back.out",
          delay: i * 0.02
        }, "-=0.28");
        
        // Animate stars to the score counter
        tl.to(star, {
          duration: 0.7,
          x: 0,
          y: 0,
          opacity: 0,
          ease: "power1.in",
          onComplete: () => {
            // Increment score counter
            setScore(prev => Math.min(prev + 1, finalScore));
            
            // Remove the star
            if (star && star.parentNode) {
              star.parentNode.removeChild(star);
            }
          }
        }, "-=0.6");
      }
      
      // Animate the trophy stars
      tl.to(".trophy-star", {
        duration: 0.6,
        rotate: 360,
        scale: 1.2,
        stagger: 0.1,
        ease: "elastic.out(1, 0.3)"
      }, 0.5);
      
      // Animate the final score
      tl.to(".final-score", {
        duration: 0.8,
        scale: 1.1,
        ease: "elastic.out",
        onComplete: () => {
          // Final score animation
          gsap.to(".final-score", {
            duration: 0.4,
            y: -10,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut"
          });
        }
      }, "-=0.5");
    };
    
    // If not visible, don't render anything
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="text-center">
          <h2 className="win-text text-6xl font-bold text-yellow-300 opacity-0 scale-0 origin-center mb-8">
            YOU WIN!
          </h2>
          
          <div className="flex justify-center gap-6 mb-8">
            <div className="trophy-star scale-0">
              <Star className="w-16 h-16 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="trophy-star scale-0">
              <Star className="w-24 h-24 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="trophy-star scale-0">
              <Star className="w-16 h-16 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          
          <div 
            ref={containerRef} 
            className="w-full h-64 relative flex items-center justify-center"
          >
            <div className="final-score text-center p-8 bg-blue-900 rounded-xl">
              <div className="text-white font-bold text-xl">SCORE</div>
              <div className="text-6xl font-bold text-yellow-300">{score}</div>
              <div className="text-lg text-white opacity-80">of {finalScore} points</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  