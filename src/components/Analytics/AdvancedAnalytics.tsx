import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  DollarSign,
  Target,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../common';

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// Fixed animation variants with proper TypeScript types
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

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Mock data for demonstration
  const mockData = {
    orders: {
      total: 1247,
      pending: 89,
      completed: 1123,
      cancelled: 35
    },
    revenue: {
      daily: 15420,
      weekly: 98750,
      monthly: 425000
    },
    tests: {
      total: 5678,
      byDepartment: {
        Chemistry: 2340,
        Hematology: 1890,
        Serology: 890,
        Virology: 320,
        Microbiology: 238
      }
    },
    performance: {
      accuracy: 99.2,
      turnaroundTime: 2.4,
      customerSatisfaction: 4.8
    }
  };

  const handleExport = () => {
    setNotification({
      type: 'success',
      title: t('analytics.exportSuccess'),
      message: t('analytics.exportSuccess')
    });
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    setNotification({
      type: 'info',
      title: isFullscreen ? t('analytics.exitFullscreen') : t('analytics.enterFullscreen'),
      message: isFullscreen ? t('analytics.exitFullscreen') : t('analytics.enterFullscreen')
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <>
      <AnimatedModal isOpen={isOpen} onClose={onClose} size="xl" title={t('analytics.title')}>
        <div className="p-6 space-y-6">
          {/* Header with controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics.advancedAnalytics')}
            </h2>
            <div className="flex gap-2">
              <GlowButton
                variant="outline"
                onClick={handleFullscreenToggle}
                glowColor="primary"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? t('analytics.exitFullscreen') : t('analytics.fullscreen')}
              </GlowButton>
              <GlowButton
                variant="primary"
                onClick={handleExport}
                glowColor="success"
              >
                <Download className="w-4 h-4" />
                {t('analytics.export')}
              </GlowButton>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Orders Overview */}
            <GlowCard
              glowColor="primary"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('analytics.orders')}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {mockData.orders.total.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.pending')}</span>
                  <span className="font-medium text-orange-600">{mockData.orders.pending}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.completed')}</span>
                  <span className="font-medium text-green-600">{mockData.orders.completed}</span>
                </div>
              </div>
            </GlowCard>

            {/* Revenue Overview */}
            <GlowCard
              glowColor="success"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('analytics.revenue')}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${mockData.revenue.monthly.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.daily')}</span>
                  <span className="font-medium text-green-600">${mockData.revenue.daily.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.weekly')}</span>
                  <span className="font-medium text-green-600">${mockData.revenue.weekly.toLocaleString()}</span>
                </div>
              </div>
            </GlowCard>

            {/* Performance Metrics */}
            <GlowCard
              glowColor="info"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('analytics.performance')}
                  </h3>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {mockData.performance.accuracy}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.turnaroundTime')}</span>
                  <span className="font-medium text-cyan-600">{mockData.performance.turnaroundTime}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('analytics.satisfaction')}</span>
                  <span className="font-medium text-cyan-600">{mockData.performance.customerSatisfaction}/5</span>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Tests by Department */}
          <GlowCard
            glowColor="warning"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.testsByDepartment')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(mockData.tests.byDepartment).map(([dept, count]) => (
                <div key={dept} className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {dept}
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </AnimatedModal>

      {/* Notification */}
      {notification && (
        <AnimatedNotification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </>
  );
};

export default AdvancedAnalytics; 