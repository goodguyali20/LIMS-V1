# Mathematical Animations Guide

## Overview

We've successfully integrated mathematical animation capabilities into your LIMS project using **p5.js** and **@p5-wrapper/react**. This provides JavaScript-based mathematical animations similar to what Manim offers, but optimized for web applications.

## What's Installed

- **p5.js**: A JavaScript library for creative coding and mathematical visualizations
- **@p5-wrapper/react**: React wrapper for p5.js, making it easy to use in React components

## Available Animations

### 1. Fourier Series Visualization
- **Interactive**: Draw shapes with your mouse
- **Mathematical**: Watch as your drawing is reconstructed using Fourier series
- **Educational**: Demonstrates how complex shapes can be broken down into simple sine waves

### 2. Spiral Patterns
- **Polar Coordinates**: Beautiful spiral patterns using polar coordinate systems
- **Continuous**: Smooth animation showing mathematical beauty
- **Reset**: Automatically resets when the spiral reaches maximum size

### 3. Wave Function Visualization
- **Complex Waves**: Combines multiple sine waves with different frequencies
- **Real-time**: Continuous animation showing wave interference patterns
- **Mathematical**: Demonstrates wave superposition principles

### 4. Particle System
- **Physics Simulation**: Particles with gravity and decay
- **Dynamic**: Continuous particle generation and removal
- **Visual**: Demonstrates mathematical modeling of physical systems

## How to Access

### Option 1: Through Showcase
1. Navigate to `/app/showcase`
2. Scroll down to the "Mathematical Animations & Visualizations" section
3. Use the control buttons to switch between different animations

### Option 2: Direct Access
1. Navigate to `/app/math-animations`
2. This takes you directly to the mathematical animations component

## Usage Examples

### Basic Usage in React Components

```jsx
import { ReactP5Wrapper } from '@p5-wrapper/react';

const MyAnimation = () => {
  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(400, 400);
    };

    p5.draw = () => {
      p5.background(0);
      // Your animation code here
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};
```

### Creating Custom Mathematical Animations

```jsx
const customSketch = (p5) => {
  let time = 0;

  p5.setup = () => {
    p5.createCanvas(800, 600);
  };

  p5.draw = () => {
    p5.background(0);
    p5.translate(p5.width / 2, p5.height / 2);
    
    // Create a Lissajous curve
    let x = 200 * p5.cos(2 * time);
    let y = 200 * p5.sin(3 * time);
    
    p5.stroke(255);
    p5.point(x, y);
    
    time += 0.02;
  };
};
```

## Mathematical Concepts Demonstrated

### Fourier Series
- **Principle**: Any periodic function can be represented as a sum of sine and cosine functions
- **Application**: Shape reconstruction, signal processing, data compression
- **Visual**: Shows how complex shapes emerge from simple circular motions

### Polar Coordinates
- **Principle**: Points defined by distance from origin and angle
- **Application**: Spiral patterns, circular motion, complex number visualization
- **Visual**: Demonstrates the relationship between radius and angle

### Wave Interference
- **Principle**: When waves combine, they create interference patterns
- **Application**: Sound waves, light waves, quantum mechanics
- **Visual**: Shows how multiple frequencies create complex patterns

### Particle Systems
- **Principle**: Mathematical modeling of physical systems
- **Application**: Physics simulations, game development, scientific visualization
- **Visual**: Demonstrates forces like gravity and decay

## Customization Options

### Styling
The animations are wrapped in styled components that match your LIMS theme:
- Gradient backgrounds
- Consistent color scheme
- Responsive design
- Smooth transitions

### Performance
- Optimized for 60fps animations
- Efficient rendering using p5.js
- Memory management for particle systems
- Responsive canvas sizing

## Integration with LIMS

These mathematical animations can be used for:
- **Educational Content**: Teaching mathematical concepts to lab staff
- **Data Visualization**: Creating custom charts and graphs
- **Quality Control**: Visualizing statistical data and trends
- **Training**: Interactive demonstrations of lab procedures

## Future Enhancements

Potential additions could include:
- 3D mathematical visualizations using Three.js
- Interactive statistical plots
- Real-time data streaming animations
- Custom mathematical function plotting
- Export capabilities for presentations

## Technical Notes

- **Dependencies**: p5.js, @p5-wrapper/react, styled-components
- **Browser Support**: Modern browsers with Canvas API support
- **Performance**: Optimized for smooth 60fps animations
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## Troubleshooting

### Common Issues
1. **Canvas not rendering**: Check if the container has proper dimensions
2. **Performance issues**: Reduce animation complexity or frame rate
3. **Styling conflicts**: Ensure proper CSS isolation

### Debug Mode
Enable debug mode by adding console logs in your sketch functions:
```jsx
p5.draw = () => {
  console.log('Frame:', p5.frameCount);
  // Your animation code
};
```

## Conclusion

The mathematical animations feature provides a powerful tool for creating engaging, educational content within your LIMS system. Whether for training, data visualization, or simply adding visual appeal, these animations demonstrate the mathematical beauty underlying many scientific processes. 