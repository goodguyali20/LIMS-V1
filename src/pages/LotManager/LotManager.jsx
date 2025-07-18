import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Unused import
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
  Calendar,
  Tag,
  DollarSign,
  AlertCircle,
  RefreshCw,
  QrCode,
  Barcode,
  FileText,
  Download,
  Upload,
  Settings,
  Users,
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const LotManager = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Unused variable, comment out or remove
  const { showNotification } = useNotifications();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    const mockLots = [
      {
        id: 1,
        lotNumber: 'LOT-2024-001',
        productName: 'Blood Collection Tubes',
        type: 'Consumables',
        quantity: 5000,
        receivedDate: '2024-01-15',
        expiryDate: '2026-01-15',
        supplier: 'MedSupply Co.',
        status: 'active',
        location: 'Storage Room A',
        temperature: 'Room Temp',
        humidity: '45%',
        qualityStatus: 'passed',
        lastInspection: '2024-01-20',
        nextInspection: '2024-04-20',
        critical: false,
        notes: 'Standard quality lot, all parameters within range'
      },
      {
        id: 2,
        lotNumber: 'LOT-2024-002',
        productName: 'Reagent Kit A',
        type: 'Reagents',
        quantity: 200,
        receivedDate: '2024-01-10',
        expiryDate: '2024-08-20',
        supplier: 'LabTech Solutions',
        status: 'active',
        location: 'Refrigerator B',
        temperature: '2-8°C',
        humidity: '60%',
        qualityStatus: 'passed',
        lastInspection: '2024-01-18',
        nextInspection: '2024-03-18',
        critical: true,
        notes: 'Critical lot - monitor closely due to short expiry'
      },
      {
        id: 3,
        lotNumber: 'LOT-2024-003',
        productName: 'Calibration Standard',
        type: 'Reagents',
        quantity: 50,
        receivedDate: '2024-01-05',
        expiryDate: '2024-05-30',
        supplier: 'Precision Labs',
        status: 'quarantine',
        location: 'Quarantine Area',
        temperature: '2-8°C',
        humidity: '60%',
        qualityStatus: 'pending',
        lastInspection: '2024-01-12',
        nextInspection: '2024-02-12',
        critical: true,
        notes: 'Under investigation - potential quality issues detected'
      },
      {
        id: 4,
        lotNumber: 'LOT-2024-004',
        productName: 'Disposable Gloves',
        type: 'Consumables',
        quantity: 10000,
        receivedDate: '2024-01-08',
        expiryDate: '2027-01-08',
        supplier: 'SafetyFirst Inc.',
        status: 'active',
        location: 'Storage Room B',
        temperature: 'Room Temp',
        humidity: '45%',
        qualityStatus: 'passed',
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15',
        critical: false,
        notes: 'Large quantity lot, good for long-term use'
      },
      {
        id: 5,
        lotNumber: 'LOT-2024-005',
        productName: 'Centrifuge Machine',
        type: 'Equipment',
        quantity: 2,
        receivedDate: '2024-01-12',
        expiryDate: null,
        supplier: 'LabEquipment Pro',
        status: 'active',
        location: 'Lab Room 1',
        temperature: 'Room Temp',
        humidity: '45%',
        qualityStatus: 'passed',
        lastInspection: '2024-01-19',
        nextInspection: '2024-07-19',
        critical: false,
        notes: 'High-value equipment, regular maintenance required'
      }
    ];
    
    setTimeout(() => {
      setLots(mockLots);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (formData) => {
    if (editingLot) {
      setLots(prev => prev.map(lot => lot.id === editingLot.id ? { ...lot, ...formData } : lot));
      showNotification({
        type: 'success',
        message: t('lotManager.lotUpdatedSuccessfully'),
      });
    } else {
      const newLot = {
        id: Date.now(),
        ...formData,
        lotNumber: `LOT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
        receivedDate: new Date().toISOString().split('T')[0],
        status: 'active',
        qualityStatus: 'pending',
        lastInspection: new Date().toISOString().split('T')[0],
        nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        critical: false
      };
      setLots(prev => [newLot, ...prev]);
      showNotification({
        type: 'success',
        message: t('lotManager.lotAddedSuccessfully'),
      });
    }
    setShowModal(false);
    setEditingLot(null);
  };

  const handleDelete = (lotId) => {
    setLots(prev => prev.filter(lot => lot.id !== lotId));
    showNotification({
      type: 'success',
      message: t('lotManager.lotDeletedSuccessfully'),
    });
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lot.status === filterStatus;
    const matchesType = filterType === 'all' || lot.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'quarantine': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'disposed': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getQualityStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
              {t('lotManager.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {t('lotManager.description')}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                variants={statCardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.1 }}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.1 }}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50"
              >
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeLots = lots.filter(lot => lot.status === 'active').length;
  const quarantineLots = lots.filter(lot => lot.status === 'quarantine').length;
  const expiredLots = lots.filter(lot => lot.status === 'expired').length;
  const totalLots = lots.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
            {t('lotManager.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t('lotManager.description')}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={statCardVariants}>
            <GlowCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {t('lotManager.totalLots')}
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {totalLots}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlowCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {t('lotManager.activeLots')}
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {activeLots}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlowCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {t('lotManager.quarantineLots')}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {quarantineLots}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div variants={statCardVariants}>
            <GlowCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                    {t('lotManager.expiredLots')}
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {expiredLots}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <Clock className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('lotManager.searchLots')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">{t('lotManager.allStatus')}</option>
            <option value="active">{t('lotManager.active')}</option>
            <option value="quarantine">{t('lotManager.quarantine')}</option>
            <option value="expired">{t('lotManager.expired')}</option>
            <option value="disposed">{t('lotManager.disposed')}</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">{t('lotManager.allTypes')}</option>
            <option value="Consumables">{t('lotManager.consumables')}</option>
            <option value="Reagents">{t('lotManager.reagents')}</option>
            <option value="Equipment">{t('lotManager.equipment')}</option>
          </select>
          
          <GlowButton
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('lotManager.addLot')}
          </GlowButton>
        </motion.div>

        {/* Lots Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredLots.map((lot) => {
              const daysUntilExpiry = getDaysUntilExpiry(lot.expiryDate);
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;
              
              return (
                <motion.div
                  key={lot.id}
                  variants={cardVariants}
                  layout
                  className="group"
                >
                  <GlowCard className={`p-6 h-full ${lot.critical ? 'ring-2 ring-red-500/50' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          lot.critical 
                            ? 'bg-gradient-to-br from-red-500 to-red-600' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-white">
                            {lot.lotNumber}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {lot.productName}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lot.status)}`}>
                        {lot.status}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('lotManager.quantity')}:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {lot.quantity.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('lotManager.type')}:</span>
                        <span className="text-slate-800 dark:text-white">{lot.type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('lotManager.supplier')}:</span>
                        <span className="text-slate-800 dark:text-white">{lot.supplier}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('lotManager.location')}:</span>
                        <span className="text-slate-800 dark:text-white">{lot.location}</span>
                      </div>
                      
                      {lot.expiryDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">{t('lotManager.expiryDate')}:</span>
                          <span className={`font-semibold ${
                            daysUntilExpiry <= 0 ? 'text-red-600 dark:text-red-400' :
                            daysUntilExpiry <= 30 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-slate-800 dark:text-white'
                          }`}>
                            {lot.expiryDate}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('lotManager.qualityStatus')}:</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityStatusColor(lot.qualityStatus)}`}>
                          {lot.qualityStatus}
                        </div>
                      </div>
                    </div>

                    {lot.critical && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            {t('lotManager.criticalLot')}
                          </span>
                        </div>
                      </div>
                    )}

                    {isExpiringSoon && daysUntilExpiry > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {t('lotManager.expiringSoon', { days: daysUntilExpiry })}
                          </span>
                        </div>
                      </div>
                    )}

                    {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            {t('lotManager.expired')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <GlowButton
                        $variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingLot(lot);
                          setShowModal(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4" />
                      </GlowButton>
                      <GlowButton
                        $variant="outline"
                        size="sm"
                        onClick={() => handleDelete(lot.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </GlowButton>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredLots.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              {t('lotManager.noLotsFound')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('lotManager.noLotsDescription')}
            </p>
            <GlowButton onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              {t('lotManager.addFirstLot')}
            </GlowButton>
          </motion.div>
        )}
      </div>

      {/* Lot Form Modal */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLot(null);
        }}
        title={editingLot ? t('lotManager.editLot') : t('lotManager.addLot')}
      >
        <LotForm
          lot={editingLot}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingLot(null);
          }}
        />
      </AnimatedModal>

      {/* Notification */}
      {/* AnimatedNotification is removed as per edit hint */}
    </div>
  );
};

const LotForm = ({ lot, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    productName: lot?.productName || '',
    type: lot?.type || 'Consumables',
    quantity: lot?.quantity || 0,
    supplier: lot?.supplier || '',
    expiryDate: lot?.expiryDate || '',
    location: lot?.location || '',
    temperature: lot?.temperature || 'Room Temp',
    humidity: lot?.humidity || '45%',
    notes: lot?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.productName')}
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.type')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="Consumables">{t('lotManager.consumables')}</option>
            <option value="Reagents">{t('lotManager.reagents')}</option>
            <option value="Equipment">{t('lotManager.equipment')}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.quantity')}
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            min="0"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.supplier')}
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.expiryDate')}
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.location')}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.temperature')}
          </label>
          <input
            type="text"
            value={formData.temperature}
            onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="e.g., Room Temp, 2-8°C"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.humidity')}
          </label>
          <input
            type="text"
            value={formData.humidity}
            onChange={(e) => setFormData(prev => ({ ...prev, humidity: e.target.value }))}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="e.g., 45%"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('lotManager.notes')}
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder={t('lotManager.notesPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <GlowButton type="submit" className="flex-1">
          {lot ? t('lotManager.updateLot') : t('lotManager.addLot')}
        </GlowButton>
        <GlowButton type="button" $variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </GlowButton>
      </div>
    </form>
  );
};

export default LotManager;