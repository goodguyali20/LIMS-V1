import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  Minus,
  Plus as PlusIcon,
  Eye,
  BarChart3,
  Calendar,
  Tag,
  DollarSign,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

// Styled Components
const InventoryContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const InventoryHeader = styled(motion.div)`
  margin-bottom: 2rem;
`;

const InventoryTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const InventoryDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const StatContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatInfo = styled.div``;

const StatLabelText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
`;

const StatValueText = styled.p`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
`;

const SearchAndFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const AddButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InventoryCard = styled(motion.div)`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardContent = styled(GlowCard)`
  padding: 1.5rem;
  height: 100%;
  border: ${({ $critical, theme }) => $critical ? `2px solid ${theme.colors.error}` : 'none'};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ItemIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
`;

const ItemDetails = styled.div``;

const ItemName = styled.h3`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const ItemCategory = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'in-stock': return theme.colors.success + '20';
      case 'low-stock': return theme.colors.warning + '20';
      case 'critical': return theme.colors.error + '20';
      case 'out-of-stock': return theme.colors.textSecondary + '20';
      default: return theme.colors.textSecondary + '20';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'in-stock': return theme.colors.success;
      case 'low-stock': return theme.colors.warning;
      case 'critical': return theme.colors.error;
      case 'out-of-stock': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const ItemStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s ease;
  background: ${({ $percentage, theme }) => {
    if ($percentage <= 20) return theme.colors.error;
    if ($percentage <= 50) return theme.colors.warning;
    return theme.colors.success;
  }};
  width: ${({ $percentage }) => $percentage}%;
`;

const CriticalAlert = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.error}10;
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  border-radius: 8px;
`;

const AlertContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.error};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const QuantityControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const QuantityButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const DeleteButton = styled(GlowButton)`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.error}20;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error}30;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const EmptyIcon = styled.div`
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const Inventory = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    const mockInventory = [
      {
        id: 1,
        name: 'Blood Collection Tubes',
        category: 'Consumables',
        quantity: 1500,
        minQuantity: 100,
        maxQuantity: 2000,
        unit: 'pieces',
        price: 2.50,
        supplier: 'MedSupply Co.',
        expiryDate: '2025-06-15',
        status: 'in-stock',
        location: 'Storage Room A',
        lastUpdated: '2024-01-15',
        critical: false
      },
      {
        id: 2,
        name: 'Reagent Kit A',
        category: 'Reagents',
        quantity: 45,
        minQuantity: 50,
        maxQuantity: 200,
        unit: 'kits',
        price: 150.00,
        supplier: 'LabTech Solutions',
        expiryDate: '2024-08-20',
        status: 'low-stock',
        location: 'Refrigerator B',
        lastUpdated: '2024-01-14',
        critical: true
      },
      {
        id: 3,
        name: 'Centrifuge Machine',
        category: 'Equipment',
        quantity: 3,
        minQuantity: 2,
        maxQuantity: 5,
        unit: 'units',
        price: 2500.00,
        supplier: 'LabEquipment Pro',
        expiryDate: null,
        status: 'in-stock',
        location: 'Lab Room 1',
        lastUpdated: '2024-01-10',
        critical: false
      },
      {
        id: 4,
        name: 'Disposable Gloves',
        category: 'Consumables',
        quantity: 5000,
        minQuantity: 1000,
        maxQuantity: 10000,
        unit: 'pairs',
        price: 0.15,
        supplier: 'SafetyFirst Inc.',
        expiryDate: '2026-03-10',
        status: 'in-stock',
        location: 'Storage Room B',
        lastUpdated: '2024-01-12',
        critical: false
      },
      {
        id: 5,
        name: 'Calibration Standard',
        category: 'Reagents',
        quantity: 12,
        minQuantity: 20,
        maxQuantity: 100,
        unit: 'vials',
        price: 85.00,
        supplier: 'Precision Labs',
        expiryDate: '2024-05-30',
        status: 'critical',
        location: 'Refrigerator A',
        lastUpdated: '2024-01-13',
        critical: true
      }
    ];
    
    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (formData) => {
    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } : item));
      showNotification({
        type: 'success',
        message: t('inventory.itemUpdatedSuccessfully'),
      });
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: formData.quantity <= formData.minQuantity ? 'low-stock' : 'in-stock',
        critical: formData.quantity <= formData.minQuantity
      };
      setInventory(prev => [newItem, ...prev]);
      showNotification({
        type: 'success',
        message: t('inventory.itemAddedSuccessfully'),
      });
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
    showNotification({
      type: 'success',
      message: t('inventory.itemDeletedSuccessfully'),
    });
  };

  const handleQuantityChange = (itemId, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        const newStatus = newQuantity === 0 ? 'out-of-stock' : 
                         newQuantity <= item.minQuantity ? 'low-stock' : 'in-stock';
        return {
          ...item,
          quantity: newQuantity,
          status: newStatus,
          critical: newQuantity <= item.minQuantity,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getQuantityPercentage = (item) => {
    return Math.min(100, (item.quantity / item.maxQuantity) * 100);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Consumables': return '#3B82F6';
      case 'Reagents': return '#10B981';
      case 'Equipment': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    lowStockItems: inventory.filter(item => item.status === 'low-stock').length,
    criticalItems: inventory.filter(item => item.status === 'critical').length
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

  if (loading) {
    return (
      <InventoryContainer>
        <InventoryHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <InventoryTitle>{t('inventory.title')}</InventoryTitle>
          <InventoryDescription>{t('inventory.description')}</InventoryDescription>
        </InventoryHeader>
        
        <StatsGrid>
          {[1, 2, 3, 4].map(i => (
            <StatCard key={i} color="#3B82F6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ height: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginBottom: '0.5rem', width: '60%' }}></div>
                  <div style={{ height: '2rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', width: '40%' }}></div>
                </div>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}></div>
              </div>
            </StatCard>
          ))}
        </StatsGrid>
        
        <InventoryGrid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <StatCard key={i} color="#3B82F6">
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Loading...
              </div>
            </StatCard>
          ))}
        </InventoryGrid>
      </InventoryContainer>
    );
  }

  return (
    <InventoryContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <InventoryHeader>
        <InventoryTitle>{t('inventory.title')}</InventoryTitle>
        <InventoryDescription>{t('inventory.description')}</InventoryDescription>
      </InventoryHeader>

      <StatsGrid>
        <StatCard color="#3B82F6">
          <StatContent>
                         <StatInfo>
               <StatLabelText>{t('inventory.stats.totalItems')}</StatLabelText>
               <StatValueText>{stats.totalItems}</StatValueText>
             </StatInfo>
            <StatIcon color="#3B82F6">
              <Package size={24} />
            </StatIcon>
          </StatContent>
        </StatCard>

        <StatCard color="#10B981">
          <StatContent>
                         <StatInfo>
               <StatLabelText>{t('inventory.stats.totalValue')}</StatLabelText>
               <StatValueText>${stats.totalValue.toLocaleString()}</StatValueText>
             </StatInfo>
            <StatIcon color="#10B981">
              <DollarSign size={24} />
            </StatIcon>
          </StatContent>
        </StatCard>

        <StatCard color="#EF4444">
          <StatContent>
                         <StatInfo>
               <StatLabelText>{t('inventory.stats.lowStockItems')}</StatLabelText>
               <StatValueText>{stats.lowStockItems}</StatValueText>
             </StatInfo>
            <StatIcon color="#EF4444">
              <AlertTriangle size={24} />
            </StatIcon>
          </StatContent>
        </StatCard>

        <StatCard color="#F59E0B">
          <StatContent>
                         <StatInfo>
               <StatLabelText>{t('inventory.stats.criticalItems')}</StatLabelText>
               <StatValueText>{stats.criticalItems}</StatValueText>
             </StatInfo>
            <StatIcon color="#F59E0B">
              <TrendingDown size={24} />
            </StatIcon>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <SearchAndFilterContainer>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder={t('inventory.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FilterSelect
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">{t('inventory.filters.allCategories')}</option>
          <option value="Consumables">{t('inventory.filters.consumables')}</option>
          <option value="Reagents">{t('inventory.filters.reagents')}</option>
          <option value="Equipment">{t('inventory.filters.equipment')}</option>
        </FilterSelect>

        <FilterSelect
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t('inventory.filters.allStatus')}</option>
          <option value="in-stock">{t('inventory.filters.inStock')}</option>
          <option value="low-stock">{t('inventory.filters.lowStock')}</option>
          <option value="critical">{t('inventory.filters.critical')}</option>
          <option value="out-of-stock">{t('inventory.filters.outOfStock')}</option>
        </FilterSelect>

        <AddButtonContainer>
          <GlowButton
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} />
            {t('inventory.addItem')}
          </GlowButton>
        </AddButtonContainer>
      </SearchAndFilterContainer>

      <InventoryGrid>
        {filteredInventory.map((item) => (
          <InventoryCard
            key={item.id}
            variants={cardVariants}
            whileHover="hover"
          >
            <CardContent $critical={item.critical}>
              <CardHeader>
                <ItemInfo>
                  <ItemIcon color={getCategoryColor(item.category)}>
                    <Package size={24} />
                  </ItemIcon>
                  <ItemDetails>
                    <ItemName>{item.name}</ItemName>
                    <ItemCategory>{item.category}</ItemCategory>
                  </ItemDetails>
                </ItemInfo>
                <StatusBadge $status={item.status}>
                  {t(`inventory.status.${item.status}`)}
                </StatusBadge>
              </CardHeader>

              <ItemStats>
                <StatRow>
                  <StatLabel>{t('inventory.quantity')}:</StatLabel>
                  <StatValue>
                    {item.quantity} {item.unit}
                  </StatValue>
                </StatRow>

                <ProgressBar>
                  <ProgressFill $percentage={getQuantityPercentage(item)} />
                </ProgressBar>

                <StatRow>
                  <StatLabel>{t('inventory.price')}:</StatLabel>
                  <StatValue>${item.price.toFixed(2)}</StatValue>
                </StatRow>

                <StatRow>
                  <StatLabel>{t('inventory.location')}:</StatLabel>
                  <StatValue>{item.location}</StatValue>
                </StatRow>

                <StatRow>
                  <StatLabel>{t('inventory.expiryDate')}:</StatLabel>
                  <StatValue>{item.expiryDate || t('inventory.noExpiry')}</StatValue>
                </StatRow>
              </ItemStats>

              {item.critical && (
                <CriticalAlert>
                  <AlertContent>
                    <AlertCircle size={16} />
                    <AlertText>{t('inventory.criticalStock')}</AlertText>
                  </AlertContent>
                </CriticalAlert>
              )}

              <QuantityControls>
                <QuantityButton
                  size="small"
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={item.quantity <= 0}
                >
                  <Minus size={16} />
                </QuantityButton>
                <QuantityButton
                  size="small"
                  onClick={() => handleQuantityChange(item.id, 1)}
                >
                  <PlusIcon size={16} />
                </QuantityButton>
              </QuantityControls>

              <CardActions>
                <ActionButton
                  size="small"
                  $variant="primary"
                  onClick={() => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                >
                  <Edit size={16} />
                  {t('inventory.edit')}
                </ActionButton>
                <DeleteButton
                  size="small"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                  {t('inventory.delete')}
                </DeleteButton>
              </CardActions>
            </CardContent>
          </InventoryCard>
        ))}
      </InventoryGrid>

      {filteredInventory.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <Package size={48} />
          </EmptyIcon>
          <EmptyTitle>{t('inventory.noItems')}</EmptyTitle>
          <EmptyDescription>{t('inventory.noItemsDescription')}</EmptyDescription>
        </EmptyState>
      )}

      <AnimatePresence>
        {showModal && (
          <AnimatedModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            title={editingItem ? t('inventory.editItem') : t('inventory.addItem')}
          >
            <InventoryForm
              item={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowModal(false);
                setEditingItem(null);
              }}
            />
          </AnimatedModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Removed AnimatedNotification usage */}
      </AnimatePresence>
    </InventoryContainer>
  );
};

// Inventory Form Component
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const InventoryForm = ({ item, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Consumables',
    quantity: item?.quantity || 0,
    minQuantity: item?.minQuantity || 0,
    maxQuantity: item?.maxQuantity || 0,
    unit: item?.unit || 'pieces',
    price: item?.price || 0,
    supplier: item?.supplier || '',
    expiryDate: item?.expiryDate || '',
    location: item?.location || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer>
        <FormGroup>
          <FormLabel>{t('inventory.form.name')}</FormLabel>
          <FormInput
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.category')}</FormLabel>
          <FormSelect
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="Consumables">{t('inventory.filters.consumables')}</option>
            <option value="Reagents">{t('inventory.filters.reagents')}</option>
            <option value="Equipment">{t('inventory.filters.equipment')}</option>
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.quantity')}</FormLabel>
          <FormInput
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.minQuantity')}</FormLabel>
          <FormInput
            type="number"
            value={formData.minQuantity}
            onChange={(e) => handleChange('minQuantity', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.maxQuantity')}</FormLabel>
          <FormInput
            type="number"
            value={formData.maxQuantity}
            onChange={(e) => handleChange('maxQuantity', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.unit')}</FormLabel>
          <FormInput
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.price')}</FormLabel>
          <FormInput
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            min="0"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.supplier')}</FormLabel>
          <FormInput
            type="text"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.expiryDate')}</FormLabel>
          <FormInput
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{t('inventory.form.location')}</FormLabel>
          <FormInput
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
          />
        </FormGroup>

        <FormActions>
          <GlowButton type="submit" $variant="primary">
            {item ? t('inventory.update') : t('inventory.add')}
          </GlowButton>
          <GlowButton type="button" onClick={onCancel}>
            {t('inventory.cancel')}
          </GlowButton>
        </FormActions>
      </FormContainer>
    </form>
  );
};

export default Inventory;