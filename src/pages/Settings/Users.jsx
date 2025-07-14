import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Key,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Crown,
  User,
  Settings,
  Database,
  FileText,
  Printer,
  FlaskConical,
  BarChart3,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  MoreVertical as MoreVerticalIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Building as BuildingIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  CheckCircle as CheckIcon,
  AlertCircle as AlertIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  Crown as CrownIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  Database as DatabaseIcon,
  FileText as FileTextIcon,
  Printer as PrinterIcon,
  FlaskConical as FlaskIcon,
  BarChart3 as BarChartIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { toast } from 'react-toastify';

// Styled Components
const UsersContainer = styled.div`
  padding: 2rem;
`;

const UsersHeader = styled.div`
  margin-bottom: 2rem;
`;

const UsersTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UsersDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
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

const StyledSearchIcon = styled(SearchIcon)`
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

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const UserCard = styled(GlowCard)`
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
    background: ${({ roleColor }) => roleColor};
  }
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const UserEmail = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const UserRole = styled.span`
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  svg {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    width: 1.25rem;
    height: 1.25rem;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const UserDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PermissionBadge = styled.span`
  background: ${({ $active, theme }) => $active ? theme.colors.success + '20' : theme.colors.surfaceSecondary};
  color: ${({ $active, theme }) => $active ? theme.colors.success : theme.colors.textSecondary};
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  margin-bottom: 1rem;
  grid-column: 1 / -1;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  grid-column: 1 / -1;
`;

const SaveButton = styled(GlowButton)``;
const CancelButton = styled(GlowButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const UsersManagement = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormState, setUserFormState] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    phone: '',
    isActive: true,
    permissions: {
      dashboard: true,
      patients: true,
      orders: true,
      tests: false,
      inventory: false,
      reports: false,
      settings: false,
      users: false
    }
  });

  // Mock user data - in real app this would come from context/API
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Dr. Ahmed Hassan',
      email: 'ahmed.hassan@hospital.com',
      role: 'admin',
      department: 'Laboratory',
      phone: '+964 750 123 4567',
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      permissions: {
        dashboard: true,
        patients: true,
        orders: true,
        tests: true,
        inventory: true,
        reports: true,
        settings: true,
        users: true
      }
    },
    {
      id: 2,
      name: 'Nurse Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      role: 'nurse',
      department: 'Phlebotomy',
      phone: '+964 750 234 5678',
      isActive: true,
      lastLogin: '2024-01-15T09:15:00Z',
      permissions: {
        dashboard: true,
        patients: true,
        orders: true,
        tests: false,
        inventory: false,
        reports: false,
        settings: false,
        users: false
      }
    },
    {
      id: 3,
      name: 'Lab Tech Mohammed Ali',
      email: 'mohammed.ali@hospital.com',
      role: 'technician',
      department: 'Chemistry',
      phone: '+964 750 345 6789',
      isActive: true,
      lastLogin: '2024-01-15T08:45:00Z',
      permissions: {
        dashboard: true,
        patients: false,
        orders: true,
        tests: true,
        inventory: true,
        reports: true,
        settings: false,
        users: false
      }
    },
    {
      id: 4,
      name: 'Dr. Fatima Al-Zahra',
      email: 'fatima.alzahra@hospital.com',
      role: 'doctor',
      department: 'Hematology',
      phone: '+964 750 456 7890',
      isActive: false,
      lastLogin: '2024-01-10T14:20:00Z',
      permissions: {
        dashboard: true,
        patients: true,
        orders: true,
        tests: true,
        inventory: false,
        reports: true,
        settings: false,
        users: false
      }
    }
  ]);

  const roleConfig = {
    admin: {
      label: 'Administrator',
      color: '#dc2626',
      icon: Crown
    },
    doctor: {
      label: 'Doctor',
      color: '#3b82f6',
      icon: User
    },
    nurse: {
      label: 'Nurse',
      color: '#10b981',
      icon: UserCheck
    },
    technician: {
      label: 'Lab Technician',
      color: '#f59e0b',
      icon: FlaskIcon
    },
    user: {
      label: 'User',
      color: '#6b7280',
      icon: User
    }
  };

  const permissionConfig = {
    dashboard: { label: 'Dashboard', icon: BarChartIcon },
    patients: { label: 'Patients', icon: UserIcon },
    orders: { label: 'Orders', icon: FileTextIcon },
    tests: { label: 'Tests', icon: FlaskIcon },
    inventory: { label: 'Inventory', icon: DatabaseIcon },
    reports: { label: 'Reports', icon: PrinterIcon },
    settings: { label: 'Settings', icon: SettingsIcon },
    users: { label: 'Users', icon: Users }
  };

  useEffect(() => {
    if (editingUser) {
      setUserFormState({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'user',
        department: editingUser.department || '',
        phone: editingUser.phone || '',
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true,
        permissions: editingUser.permissions || {
          dashboard: true,
          patients: true,
          orders: true,
          tests: false,
          inventory: false,
          reports: false,
          settings: false,
          users: false
        }
      });
    } else {
      setUserFormState({
        name: '',
        email: '',
        role: 'user',
        department: '',
        phone: '',
        isActive: true,
        permissions: {
          dashboard: true,
          patients: true,
          orders: true,
          tests: false,
          inventory: false,
          reports: false,
          settings: false,
          users: false
        }
      });
    }
  }, [editingUser, isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('permissions.')) {
      const permission = name.split('.')[1];
      setUserFormState(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked
        }
      }));
    } else {
      setUserFormState(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (!userFormState.name || !userFormState.email) {
        toast.warn('Name and Email are required.');
        return;
      }

      if (editingUser) {
        // Update existing user
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...userFormState }
            : user
        ));
        toast.success(`User "${userFormState.name}" updated successfully!`);
      } else {
        // Add new user
        const newUser = {
          id: Date.now(),
          ...userFormState,
          lastLogin: null
        };
        setUsers(prev => [...prev, newUser]);
        toast.success(`User "${userFormState.name}" added successfully!`);
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save user.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This cannot be undone.`)) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success(`User "${userName}" deleted successfully!`);
    }
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <UsersContainer>
      <UsersHeader>
        <UsersTitle>
          <Users size={24} />
          User Management
        </UsersTitle>
        <UsersDescription>
          Manage user accounts, roles, permissions, and access control
        </UsersDescription>
      </UsersHeader>

      <SearchAndFilterContainer>
        <SearchContainer>
          <StyledSearchIcon />
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <FilterSelect
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="doctor">Doctors</option>
          <option value="nurse">Nurses</option>
          <option value="technician">Technicians</option>
          <option value="user">Users</option>
        </FilterSelect>
        <GlowButton onClick={() => handleOpenModal()}>
          <UserPlus size={16} />
          Add User
        </GlowButton>
      </SearchAndFilterContainer>

      <UsersGrid>
        {filteredUsers.map((user, index) => {
          const roleInfo = roleConfig[user.role];
          const RoleIcon = roleInfo.icon;
          
          return (
            <UserCard
              key={user.id}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              roleColor={roleInfo.color}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserHeader>
                <UserAvatar color={roleInfo.color}>
                  {getInitials(user.name)}
                </UserAvatar>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserInfo>
                <UserRole color={roleInfo.color}>
                  <RoleIcon size={12} />
                  {roleInfo.label}
                </UserRole>
                <UserActions>
                  <EditIcon onClick={() => handleOpenModal(user)} title="Edit User"/>
                  {user.isActive ? (
                    <LockIcon onClick={() => handleToggleUserStatus(user.id)} title="Deactivate User"/>
                  ) : (
                    <UnlockIcon onClick={() => handleToggleUserStatus(user.id)} title="Activate User"/>
                  )}
                  <TrashIcon onClick={() => handleDeleteUser(user.id, user.name)} title="Delete User"/>
                </UserActions>
              </UserHeader>

              <UserDetails>
                <DetailItem>
                  <BuildingIcon size={16} />
                  {user.department}
                </DetailItem>
                <DetailItem>
                  <PhoneIcon size={16} />
                  {user.phone}
                </DetailItem>
                <DetailItem>
                  <ClockIcon size={16} />
                  {formatLastLogin(user.lastLogin)}
                </DetailItem>
                <DetailItem>
                  {user.isActive ? (
                    <CheckIcon size={16} style={{ color: '#10b981' }} />
                  ) : (
                    <AlertIcon size={16} style={{ color: '#ef4444' }} />
                  )}
                  {user.isActive ? 'Active' : 'Inactive'}
                </DetailItem>
              </UserDetails>

              <PermissionsGrid>
                {Object.entries(user.permissions).map(([key, value]) => {
                  const permInfo = permissionConfig[key];
                  const PermIcon = permInfo.icon;
                  
                  return (
                    <PermissionBadge key={key} $active={value}>
                      <PermIcon size={12} />
                      {permInfo.label}
                    </PermissionBadge>
                  );
                })}
              </PermissionsGrid>
            </UserCard>
          );
        })}
      </UsersGrid>

      <AnimatedModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <ModalForm onSubmit={handleSaveUser}>
          <InputGroup>
            <Label>
              <UserIcon size={16} />
              Full Name
            </Label>
            <Input 
              name="name" 
              value={userFormState.name} 
              onChange={handleInputChange} 
              placeholder="Enter full name" 
              required 
            />
          </InputGroup>
          
          <InputGroup>
            <Label>
              <MailIcon size={16} />
              Email
            </Label>
            <Input 
              name="email" 
              type="email"
              value={userFormState.email} 
              onChange={handleInputChange} 
              placeholder="Enter email address" 
              required 
            />
          </InputGroup>
          
          <InputGroup>
            <Label>
              <ShieldIcon size={16} />
              Role
            </Label>
            <Select 
              name="role" 
              value={userFormState.role} 
              onChange={handleInputChange}
            >
              <option value="user">User</option>
              <option value="technician">Lab Technician</option>
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Administrator</option>
            </Select>
          </InputGroup>
          
          <InputGroup>
            <Label>
              <BuildingIcon size={16} />
              Department
            </Label>
            <Input 
              name="department" 
              value={userFormState.department} 
              onChange={handleInputChange} 
              placeholder="Enter department" 
            />
          </InputGroup>
          
          <InputGroup>
            <Label>
              <PhoneIcon size={16} />
              Phone
            </Label>
            <Input 
              name="phone" 
              value={userFormState.phone} 
              onChange={handleInputChange} 
              placeholder="Enter phone number" 
            />
          </InputGroup>
          
          <ToggleContainer>
            <ToggleLabel>
              {userFormState.isActive ? <CheckIcon size={16} /> : <AlertIcon size={16} />}
              <div>
                <strong>Active Account</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Allow this user to access the system
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="isActive"
                checked={userFormState.isActive}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <div style={{ gridColumn: '1 / -1' }}>
            <Label style={{ marginBottom: '1rem' }}>
              <KeyIcon size={16} />
              Permissions
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(permissionConfig).map(([key, permInfo]) => {
                const PermIcon = permInfo.icon;
                
                return (
                  <ToggleContainer key={key} style={{ margin: 0 }}>
                    <ToggleLabel>
                      <PermIcon size={16} />
                      <div>
                        <strong>{permInfo.label}</strong>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          Access to {permInfo.label.toLowerCase()} features
                        </p>
                      </div>
                    </ToggleLabel>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        name={`permissions.${key}`}
                        checked={userFormState.permissions[key]}
                        onChange={handleInputChange}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </ToggleContainer>
                );
              })}
            </div>
          </div>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SaveButton type="submit">
              <CheckIcon size={16} />
              {editingUser ? 'Update User' : 'Create User'}
            </SaveButton>
          </ButtonContainer>
        </ModalForm>
      </AnimatedModal>
    </UsersContainer>
  );
};

export default UsersManagement; 