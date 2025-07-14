import React from 'react';
// import { motion } from 'framer-motion'; // Unused import
import { useTheme } from '../contexts/ThemeContext';
// import { GlowCard, GlowButton } from './common'; // Unused import
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target,
  Download,
  Settings,
  Bell,
  Star
} from 'lucide-react';

const TestVisualEffects = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      } 
    },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 300 
      } 
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: theme.colors.background }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '2rem',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            Visual Effects Test
          </h1>
          
          <GlowButton 
            onClick={toggleTheme}
                            $variant="primary"
            style={{ marginBottom: '2rem' }}
          >
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </GlowButton>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Test Card 1 */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <GlowCard glowColor="primary" className="p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Total Tests</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.text }}>
                    12,470
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Test Card 2 */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <GlowCard glowColor="success" className="p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Revenue</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.text }}>
                    $456,800
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #00d4aa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Test Card 3 */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <GlowCard glowColor="warning" className="p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Efficiency</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.text }}>
                    94.2%
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b, #ffd93d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Target style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* Test Card 4 */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <GlowCard glowColor="danger" className="p-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>Growth</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.text }}>
                    +12.5%
                  </p>
                </div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #ff6b6b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp style={{ color: 'white', width: '1.5rem', height: '1.5rem' }} />
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Test Buttons */}
        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <GlowButton $variant="primary" glowColor="primary">
            <Download style={{ width: '1rem', height: '1rem' }} />
            Primary Button
          </GlowButton>
          
          <GlowButton $variant="success" glowColor="success">
            <Star style={{ width: '1rem', height: '1rem' }} />
            Success Button
          </GlowButton>
          
          <GlowButton $variant="warning" glowColor="warning">
            <Bell style={{ width: '1rem', height: '1rem' }} />
            Warning Button
          </GlowButton>
          
          <GlowButton $variant="danger" glowColor="danger">
            <Settings style={{ width: '1rem', height: '1rem' }} />
            Danger Button
          </GlowButton>
          
          <GlowButton $variant="ghost">
            Ghost Button
          </GlowButton>
        </div>

        {/* Theme Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            color: theme.colors.text
          }}
        >
          <h3>Theme Information</h3>
          <p>Current Mode: {isDarkMode ? 'Dark' : 'Light'}</p>
          <p>Primary Color: {theme.colors.primary}</p>
          <p>Background: {theme.colors.background}</p>
          <p>Surface: {theme.colors.surface}</p>
          <p>Text: {theme.colors.text}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TestVisualEffects; 