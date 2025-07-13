// Framer Motion animations and variants

// Premium Animation Variants
export const advancedVariants = {
  // Staggered entrance animations with premium timing
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  // Premium card entrance with enhanced spring physics
  card: {
    hidden: { opacity: 0, y: 30, scale: 0.9, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  },
  
  // Enhanced floating animation with subtle rotation
  float: {
    animate: {
      y: [-5, 5, -5],
      rotate: [-1, 1, -1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Premium pulse with enhanced glow
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(0, 170, 255, 0.4)",
        "0 0 0 15px rgba(0, 170, 255, 0)",
        "0 0 0 0 rgba(0, 170, 255, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Urgent pulse for critical items
  urgentPulse: {
    animate: {
      scale: [1, 1.08, 1],
      boxShadow: [
        "0 0 0 0 rgba(220, 38, 38, 0.6)",
        "0 0 0 20px rgba(220, 38, 38, 0)",
        "0 0 0 0 rgba(220, 38, 38, 0)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Slide in from different directions with premium easing
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  slideInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  // Enhanced scale and fade with bounce
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  },
  
  // Premium rotate in with elastic bounce
  rotateIn: {
    hidden: { opacity: 0, rotate: -180, scale: 0.5 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "elastic",
        stiffness: 200,
        damping: 15
      }
    }
  },
  
  // Enhanced bounce entrance
  bounce: {
    hidden: { opacity: 0, scale: 0.3, y: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        duration: 0.8
      }
    }
  },
  
  // Fade in with delay
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  // Premium roadmap animation
  roadmap: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  },
  

  
  // Status change animation
  statusChange: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }
};

// Premium Roadmap animations
export const roadmapVariants = {
  // Stage entrance
  stage: {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  
  // Flow animation between stages
  flow: {
    animate: {
      x: [0, 10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Count animation
  count: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },
  
  // Urgent stage animation
  urgent: {
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 0 rgba(220, 38, 38, 0.4)",
        "0 0 0 10px rgba(220, 38, 38, 0)",
        "0 0 0 0 rgba(220, 38, 38, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Container animation
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Arrow animation
  arrow: {
    animate: {
      x: [0, 5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Premium Micro-interaction variants
export const microInteractions = {
  // Enhanced button hover effects
  buttonHover: {
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  },
  
  // Premium card hover effects
  cardHover: {
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  },
  
  // Enhanced input focus effects
  inputFocus: {
    focus: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  },
  
  // Premium icon animations
  iconHover: {
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  
  // Enhanced notification animations
  notification: {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.8 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

// Advanced Glow Effects
export const glowEffects = {
  // Primary glow with pulsing
  primaryGlow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(0, 170, 255, 0.3), 0 0 40px rgba(0, 170, 255, 0.1)",
        "0 0 30px rgba(0, 170, 255, 0.5), 0 0 60px rgba(0, 170, 255, 0.2)",
        "0 0 20px rgba(0, 170, 255, 0.3), 0 0 40px rgba(0, 170, 255, 0.1)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Success glow
  successGlow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)",
        "0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.2)",
        "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Danger glow
  dangerGlow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(255, 0, 85, 0.3), 0 0 40px rgba(255, 0, 85, 0.1)",
        "0 0 30px rgba(255, 0, 85, 0.5), 0 0 60px rgba(255, 0, 85, 0.2)",
        "0 0 20px rgba(255, 0, 85, 0.3), 0 0 40px rgba(255, 0, 85, 0.1)"
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Warning glow
  warningGlow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(255, 170, 0, 0.3), 0 0 40px rgba(255, 170, 0, 0.1)",
        "0 0 30px rgba(255, 170, 0, 0.5), 0 0 60px rgba(255, 170, 0, 0.2)",
        "0 0 20px rgba(255, 170, 0, 0.3), 0 0 40px rgba(255, 170, 0, 0.1)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Particle System Animations
export const particleEffects = {
  // Floating particles
  floatingParticles: {
    animate: {
      y: [0, -20, 0],
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Sparkle effect
  sparkle: {
    animate: {
      rotate: [0, 360],
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Morphing shapes
  morph: {
    animate: {
      borderRadius: ["50%", "20%", "50%"],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Advanced Page Transitions
export const pageTransitions = {
  // Slide transition
  slide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  
  // Fade transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  
  // Scale transition
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  },
  
  // Premium morphing transition
  morph: {
    initial: { opacity: 0, scale: 0.8, rotateY: -90 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.8, rotateY: 90 },
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

// Loading Animations
export const loadingAnimations = {
  // Spinning loader
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  
  // Pulsing dots
  dots: {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Wave loader
  wave: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Skeleton loading
  skeleton: {
    animate: {
      background: [
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)"
      ],
      backgroundSize: ["200% 100%", "200% 100%", "200% 100%"],
      backgroundPosition: ["-200% 0", "200% 0", "-200% 0"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

// Interactive Hover Effects
export const hoverEffects = {
  // Lift effect
  lift: {
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  
  // Glow on hover
  glow: {
    hover: {
      boxShadow: "0 0 30px rgba(0, 170, 255, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  
  // Scale on hover
  scale: {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  },
  
  // Rotate on hover
  rotate: {
    hover: {
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }
};

// Utility function to create custom hover animations
export const createHoverAnimation = (scale = 1.05, y = -2) => ({
  hover: {
    scale,
    y,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: scale * 0.95,
    transition: {
      duration: 0.1
    }
  }
});

// Utility function to create staggered animations
export const createStaggeredAnimation = (delay = 0.1) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }
});

// Advanced morphing animations
export const morphingAnimations = {
  // Shape morphing
  shapeMorph: {
    animate: {
      borderRadius: ["50%", "20%", "50%", "0%", "50%"],
      scale: [1, 1.1, 0.9, 1.2, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Color morphing
  colorMorph: {
    animate: {
      backgroundColor: [
        "rgba(0, 170, 255, 0.1)",
        "rgba(0, 255, 136, 0.1)",
        "rgba(255, 170, 0, 0.1)",
        "rgba(255, 0, 85, 0.1)",
        "rgba(0, 170, 255, 0.1)"
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// Premium entrance animations
export const entranceAnimations = {
  // Slide up with fade
  slideUpFade: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  
  // Scale with bounce
  scaleBounce: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.6
    }
  },
  
  // Rotate in
  rotateIn: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

