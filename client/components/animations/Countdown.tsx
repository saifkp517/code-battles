// CountdownOverlay.jsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CountdownOverlay = ({ onComplete, isVisible = false }) => {
  const overlayRef = useRef(null);
  const timelineRef = useRef(null);
  
  useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);
  
  const startAnimation = () => {
    // Reset any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const tl = gsap.timeline({
      onComplete: () => {
        // Call the onComplete callback when animation finishes
        if (onComplete) onComplete();
      }
    });
    
    timelineRef.current = tl;
    
    // Reset visibility
    gsap.set(".countdown-number", { autoAlpha: 0, scale: 0.5 });
    gsap.set(".start-text", { autoAlpha: 0, scale: 0.5 });
    
    // Animate 3
    tl.to(".number-3", { 
      duration: 0.5, 
      autoAlpha: 1, 
      scale: 1.2, 
      ease: "back.out" 
    })
    .to(".number-3", { 
      duration: 0.5, 
      autoAlpha: 0, 
      scale: 1.5, 
      ease: "power2.in" 
    }, "+=0.2")
    
    // Animate 2
    .to(".number-2", { 
      duration: 0.5, 
      autoAlpha: 1, 
      scale: 1.2, 
      ease: "back.out" 
    })
    .to(".number-2", { 
      duration: 0.5, 
      autoAlpha: 0, 
      scale: 1.5, 
      ease: "power2.in" 
    }, "+=0.2")
    
    // Animate 1
    .to(".number-1", { 
      duration: 0.5, 
      autoAlpha: 1, 
      scale: 1.2, 
      ease: "back.out" 
    })
    .to(".number-1", { 
      duration: 0.5, 
      autoAlpha: 0, 
      scale: 1.5, 
      ease: "power2.in" 
    }, "+=0.2")
    
    // Animate START!
    .to(".start-text", { 
      duration: 0.7, 
      autoAlpha: 1, 
      scale: 1.3, 
      ease: "elastic.out(1, 0.3)" 
    })
    .to(".start-text", { 
      duration: 0.5, 
      autoAlpha: 0, 
      delay: 0.8, 
      ease: "power2.in" 
    });
  };

  // If not visible, don't render anything
  if (!isVisible) return null;

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
    >
      <div className="relative">
        <span className="countdown-number number-3 text-9xl font-bold text-yellow-400 absolute opacity-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">3</span>
        <span className="countdown-number number-2 text-9xl font-bold text-yellow-400 absolute opacity-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">2</span>
        <span className="countdown-number number-1 text-9xl font-bold text-yellow-400 absolute opacity-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">1</span>
        <span className="start-text text-8xl font-bold text-green-400 absolute opacity-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">START!</span>
      </div>
    </div>
  );
};


