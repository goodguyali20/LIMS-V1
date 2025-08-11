import styled from 'styled-components';
import { motion } from 'framer-motion';

// Helper function to create styled motion components that filter out animation props
export const createStyledMotion = (motionComponent) => {
  // Add debugging to check what's being created
  if (process.env.NODE_ENV === 'development') {
    console.log('=== createStyledMotion called ===');
    console.log('motionComponent:', motionComponent);
    console.log('motionComponent type:', typeof motionComponent);
    console.log('motionComponent.$$typeof:', motionComponent.$$typeof);
  }
  
  const styledComponent = styled(motionComponent).withConfig({
    shouldForwardProp: (prop) => !['variants', 'initial', 'animate', 'transition'].includes(prop)
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Created styled component:', styledComponent);
    console.log('styledComponent type:', typeof styledComponent);
    console.log('styledComponent.styledComponentId:', styledComponent.styledComponentId);
    console.log('styledComponent.$$typeof:', styledComponent.$$typeof);
    
    // CRITICAL CHECK: This should NOT have $$typeof
    if (styledComponent.$$typeof) {
      console.error('🚨 CRITICAL ERROR: Styled component has $$typeof! This will cause rendering errors!');
    }
    
    console.log('=== End createStyledMotion ===');
  }
  
  return styledComponent;
};

// Common styled motion components
export const StyledMotionDiv = createStyledMotion(motion.div);
export const StyledMotionButton = createStyledMotion(motion.button);
export const StyledMotionSpan = createStyledMotion(motion.span);
export const StyledMotionSection = createStyledMotion(motion.section);
export const StyledMotionHeader = createStyledMotion(motion.header);
export const StyledMotionH1 = createStyledMotion(motion.h1);
export const StyledMotionP = createStyledMotion(motion.p);
export const StyledMotionForm = createStyledMotion(motion.form);

// Add debugging for exports
if (process.env.NODE_ENV === 'development') {
  console.log('=== styledMotion exports ===');
  console.log('StyledMotionDiv:', StyledMotionDiv);
  console.log('StyledMotionDiv type:', typeof StyledMotionDiv);
  console.log('StyledMotionDiv.styledComponentId:', StyledMotionDiv.styledComponentId);
  console.log('StyledMotionDiv.$$typeof:', StyledMotionDiv.$$typeof);
  
  // CRITICAL CHECK: Exported components should NOT have $$typeof
  if (StyledMotionDiv.$$typeof) {
    console.error('🚨 CRITICAL ERROR: Exported StyledMotionDiv has $$typeof! This will cause rendering errors!');
  }
  
  console.log('=== End styledMotion exports ===');
}
