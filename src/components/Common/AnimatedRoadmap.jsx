import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { roadmapVariants } from '../../styles/animations';
import { 
  FaVial, FaTruck, FaFlask, FaCheckCircle, FaExclamationTriangle,
  FaArrowRight, FaClock, FaSpinner, FaTimes
} from 'react-icons/fa';

const RoadmapContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.effects.borderGradient};
    background-size: 400% 100%;
    animation: gradientShift 3s ease infinite;
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const RoadmapHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const RoadmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StageCard = styled(motion.div)`
  background: ${({ theme, $active }) => $active ? theme.colors.primary + '10' : theme.colors.surfaceSecondary};
  border: 2px solid ${({ theme, $active, $status }) => {
    if ($active) return theme.colors.primary;
    switch ($status) {
      case 'pending': return theme.colors.status.pending;
      case 'inProgress': return theme.colors.status.inProgress;
      case 'completed': return theme.colors.status.completed;
      case 'urgent': return theme.colors.status.urgent;
      default: return theme.colors.border;
    }
  }};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme, $status }) => {
      switch ($status) {
        case 'urgent': return theme.colors.status.urgent + '10';
        case 'pending': return theme.colors.status.pending + '10';
        case 'inProgress': return theme.colors.status.inProgress + '10';
        case 'completed': return theme.colors.status.completed + '10';
        default: return 'transparent';
      }
    }};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
  
  ${({ $urgent, theme }) => $urgent && `
    animation: urgentPulse 2s ease-in-out infinite;
    
    @keyframes urgentPulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
      }
    }
  `}
`;

const StageIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'pending': return theme.colors.status.pending;
      case 'inProgress': return theme.colors.status.inProgress;
      case 'completed': return theme.colors.status.completed;
      case 'urgent': return theme.colors.status.urgent;
      default: return theme.colors.primary;
    }
  }};
  margin-bottom: 1rem;
`;

const StageTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const StageCount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'pending': return theme.colors.status.pending;
      case 'inProgress': return theme.colors.status.inProgress;
      case 'completed': return theme.colors.status.completed;
      case 'urgent': return theme.colors.status.urgent;
      default: return theme.colors.primary;
    }
  }};
  margin-bottom: 0.5rem;
`;

const StageSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const FlowArrow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

const UrgentBadge = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${({ theme }) => theme.colors.status.urgent};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: ${({ theme }) => theme.shadows.status.urgent};
`;

const FilterButton = styled(motion.button)`
  background: ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => $active ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.hover};
    transform: translateY(-1px);
  }
`;

const AnimatedRoadmap = ({ 
  data = {}, 
  onStageClick, 
  activeFilter = null,
  onFilterChange 
}) => {
  const { theme } = useTheme();
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const stages = [
    {
      key: 'pending',
      title: 'To Be Collected',
      icon: <FaVial />,
      status: 'pending',
      count: localData.pending || 0,
      urgent: localData.urgent || 0
    },
    {
      key: 'inTransit',
      title: 'In Transit',
      icon: <FaTruck />,
      status: 'inProgress',
      count: localData.inTransit || 0
    },
    {
      key: 'inLab',
      title: 'In Lab',
      icon: <FaFlask />,
      status: 'inProgress',
      count: localData.inLab || 0
    },
    {
      key: 'completed',
      title: 'Completed',
      icon: <FaCheckCircle />,
      status: 'completed',
      count: localData.completed || 0
    }
  ];

  const handleStageClick = (stageKey) => {
    if (onStageClick) {
      onStageClick(stageKey);
    }
    if (onFilterChange) {
      onFilterChange(activeFilter === stageKey ? null : stageKey);
    }
  };

  return (
    <RoadmapContainer
      variants={roadmapVariants.roadmap}
      initial="hidden"
      animate="visible"
    >
      <RoadmapHeader>
        <motion.h2
          variants={roadmapVariants.stage}
          initial="hidden"
          animate="visible"
        >
          <FaChartLine />
          Sample Journey Overview
        </motion.h2>
        
        <motion.div
          style={{ display: 'flex', gap: '0.5rem' }}
          variants={roadmapVariants.stage}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <FilterButton
            $active={activeFilter === null}
            onClick={() => onFilterChange?.(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All
          </FilterButton>
          {stages.map((stage, index) => (
            <FilterButton
              key={stage.key}
              $active={activeFilter === stage.key}
              onClick={() => onFilterChange?.(activeFilter === stage.key ? null : stage.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {stage.title}
            </FilterButton>
          ))}
        </motion.div>
      </RoadmapHeader>

      <RoadmapGrid>
        <AnimatePresence mode="wait">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.key}>
              <StageCard
                $active={activeFilter === stage.key}
                $status={stage.status}
                $urgent={stage.urgent > 0}
                onClick={() => handleStageClick(stage.key)}
                variants={roadmapVariants.stage}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {stage.urgent > 0 && (
                  <UrgentBadge
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {stage.urgent}
                  </UrgentBadge>
                )}
                
                <StageIcon $status={stage.status}>
                  {stage.icon}
                </StageIcon>
                
                <StageTitle>{stage.title}</StageTitle>
                
                <motion.div
                  variants={roadmapVariants.count}
                  initial="initial"
                  animate="animate"
                  key={stage.count}
                >
                  <StageCount $status={stage.status}>
                    {stage.count}
                  </StageCount>
                </motion.div>
                
                <StageSubtitle>
                  {stage.urgent > 0 ? `${stage.urgent} urgent` : 'samples'}
                </StageSubtitle>
              </StageCard>
              
              {index < stages.length - 1 && (
                <FlowArrow
                  variants={roadmapVariants.flow}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <FaArrowRight />
                </FlowArrow>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </RoadmapGrid>
    </RoadmapContainer>
  );
};

export default AnimatedRoadmap; 