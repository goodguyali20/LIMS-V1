import React, { useState, useEffect } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import styled from 'styled-components';

const AnimationContainer = styled.div`
  width: 100%;
  height: 600px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#e2e8f0'};
    transform: translateY(-1px);
  }
`;

const MathematicalAnimations = () => {
  const [animationType, setAnimationType] = useState('fourier');
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.02);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const fourierSketch = (p5) => {
    let points = [];
    let fourierX = [];
    let fourierY = [];
    let path = [];
    let time = 0;
    let drawing = false;

    p5.setup = () => {
      p5.createCanvas(800, 600);
      p5.background(0);
      p5.stroke(255);
      p5.noFill();
    };

    p5.draw = () => {
      p5.background(0);
      p5.translate(200, 200);

      if (p5.mouseIsPressed && !drawing) {
        drawing = true;
        points = [];
        path = [];
        time = 0;
      }

      if (drawing) {
        let point = p5.createVector(p5.mouseX - 200, p5.mouseY - 200);
        points.push(point);
      }

      if (points.length > 0 && !drawing) {
        // Calculate Fourier series
        fourierX = dft(points.map(p => p.x));
        fourierY = dft(points.map(p => p.y));

        // Draw the path
        let v = epicycles(400, 200, 0, fourierX);
        let w = epicycles(200, 200, p5.PI / 2, fourierY);
        let x = v.x;
        let y = w.y;

        path.push(p5.createVector(x, y));

        p5.stroke(255, 255, 0);
        p5.beginShape();
        for (let i = 0; i < path.length; i++) {
          p5.vertex(path[i].x, path[i].y);
        }
        p5.endShape();

        time += p5.TWO_PI / fourierX.length;
        if (time > p5.TWO_PI) {
          time = 0;
          path = [];
        }
      }

      // Draw the drawing area
      p5.stroke(255);
      p5.noFill();
      p5.rect(-150, -150, 300, 300);
    };

    function dft(x) {
      let X = [];
      let N = x.length;
      for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
          let phi = (p5.TWO_PI * k * n) / N;
          re += x[n] * p5.cos(phi);
          im -= x[n] * p5.sin(phi);
        }
        re = re / N;
        im = im / N;
        let freq = k;
        let amp = p5.sqrt(re * re + im * im);
        let phase = p5.atan2(im, re);
        X[k] = { re, im, freq, amp, phase };
      }
      return X;
    }

    function epicycles(x, y, rotation, fourier) {
      for (let i = 0; i < fourier.length; i++) {
        let prevx = x;
        let prevy = y;
        let freq = fourier[i].freq;
        let radius = fourier[i].amp;
        let phase = fourier[i].phase;
        x += radius * p5.cos(freq * time + phase + rotation);
        y += radius * p5.sin(freq * time + phase + rotation);

        p5.stroke(255, 100);
        p5.noFill();
        p5.ellipse(prevx, prevy, radius * 2);
        p5.stroke(255);
        p5.line(prevx, prevy, x, y);
      }
      return p5.createVector(x, y);
    }
  };

  const spiralSketch = (p5) => {
    let angle = 0;
    let radius = 0;

    p5.setup = () => {
      p5.createCanvas(800, 600);
      p5.background(0);
      p5.stroke(255);
      p5.noFill();
    };

    p5.draw = () => {
      p5.translate(p5.width / 2, p5.height / 2);
      
      let x = radius * p5.cos(angle);
      let y = radius * p5.sin(angle);
      
      p5.point(x, y);
      
      angle += 0.1;
      radius += 0.5;
      
      if (radius > 200) {
        radius = 0;
        p5.background(0);
      }
    };
  };

  const waveSketch = (p5) => {
    let time = 0;

    p5.setup = () => {
      p5.createCanvas(800, 600);
      p5.background(0);
    };

    p5.draw = () => {
      p5.background(0, 10);
      p5.translate(0, p5.height / 2);
      
      p5.stroke(255);
      p5.noFill();
      p5.beginShape();
      
      for (let x = 0; x < p5.width; x++) {
        let y = p5.sin(x * 0.01 + time) * 100 + 
                p5.sin(x * 0.02 + time * 2) * 50 +
                p5.sin(x * 0.03 + time * 3) * 25;
        p5.vertex(x, y);
      }
      
      p5.endShape();
      time += 0.05;
    };
  };

  const particleSystemSketch = (p5) => {
    let particles = [];

    p5.setup = () => {
      p5.createCanvas(800, 600);
      p5.background(0);
    };

    p5.draw = () => {
      p5.background(0, 20);
      
      // Add new particles
      if (p5.frameCount % 5 === 0) {
        particles.push(new Particle(p5));
      }
      
      // Update and display particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        
        if (particles[i].isDead()) {
          particles.splice(i, 1);
        }
      }
    };

    class Particle {
      constructor(p5) {
        this.p5 = p5;
        this.x = p5.random(p5.width);
        this.y = p5.height;
        this.vx = p5.random(-2, 2);
        this.vy = p5.random(-5, -1);
        this.life = 255;
        this.decay = p5.random(2, 5);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= this.decay;
      }

      display() {
        this.p5.stroke(255, this.life);
        this.p5.point(this.x, this.y);
      }

      isDead() {
        return this.life <= 0;
      }
    }
  };

  const getSketch = () => {
    switch (animationType) {
      case 'fourier':
        return fourierSketch;
      case 'spiral':
        return spiralSketch;
      case 'wave':
        return waveSketch;
      case 'particles':
        return particleSystemSketch;
      default:
        return fourierSketch;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
        Mathematical Animations
      </h2>
      
      <Controls>
        <Button 
          active={animationType === 'fourier'} 
          onClick={() => setAnimationType('fourier')}
        >
          Fourier Series
        </Button>
        <Button 
          active={animationType === 'spiral'} 
          onClick={() => setAnimationType('spiral')}
        >
          Spiral
        </Button>
        <Button 
          active={animationType === 'wave'} 
          onClick={() => setAnimationType('wave')}
        >
          Wave Function
        </Button>
        <Button 
          active={animationType === 'particles'} 
          onClick={() => setAnimationType('particles')}
        >
          Particle System
        </Button>
      </Controls>

      <AnimationContainer>
        <ReactP5Wrapper sketch={getSketch()} />
      </AnimationContainer>

      <div style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
        {animationType === 'fourier' && (
          <p>Draw with your mouse to create a shape, then watch it be reconstructed using Fourier series!</p>
        )}
        {animationType === 'spiral' && (
          <p>Watch as points trace out a beautiful spiral pattern using polar coordinates.</p>
        )}
        {animationType === 'wave' && (
          <p>Complex wave patterns created by combining multiple sine waves with different frequencies.</p>
        )}
        {animationType === 'particles' && (
          <p>A particle system demonstrating physics simulation with gravity and decay.</p>
        )}
      </div>
    </div>
  );
};

export default MathematicalAnimations; 