import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaTrash, FaSearch, FaSpinner, FaPlus } from 'react-icons/fa';
import Modal from '../../components/Common/Modal';

const UsersContainer = styled.div`
  padding: 2rem;
  animation: fadeIn 0.3s ease-in-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border-radius: ${({ theme }) => theme.shapes.squircle};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  svg {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserEmail = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ role, theme }) => {
    switch (role) {
      case 'admin': return `${theme.colors.error}20`;
      case 'manager': return `${theme.colors.warning}20`;
      case 'technician': return `${theme.colors.info}20`;
      case 'phlebotomist': return `${theme.colors.success}20`;
      default: return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ role, theme }) => {
    switch (role) {
      case 'admin': return theme.colors.error;
      case 'manager': return theme.colors.warning;
      case 'technician': return theme.colors.info;
      case 'phlebotomist': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  }};
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ $variant, theme }) => 
    $variant === 'danger' ? theme.colors.error : 
    $variant === 'secondary' ? theme.colors.surface : 
    theme.colors.primary};
  color: ${({ $variant, theme }) => 
    $variant === 'danger' ? 'white' : 
    $variant === 'secondary' ? theme.colors.textSecondary : 
    'white'};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const UserDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
  
  span:last-child {
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ModalForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const SaveButton = styled(ActionButton)``;
const CancelButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormState, setUserFormState] = useState({
    displayName: '',
    email: '',
    role: 'technician',
    department: '',
    phone: ''
  });

  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    if (editingUser) {
      setUserFormState({
        displayName: editingUser.displayName || '',
        email: editingUser.email || '',
        role: editingUser.role || 'technician',
        department: editingUser.department || '',
        phone: editingUser.phone || ''
      });
    } else {
      setUserFormState({
        displayName: '',
        email: '',
        role: 'technician',
        department: '',
        phone: ''
      });
    }
  }, [editingUser, isModalOpen]);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (!userFormState.displayName || !userFormState.email) {
        toast.warn('Name and Email are required.');
        return;
      }

      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), userFormState);
        toast.success(`User "${userFormState.displayName}" updated successfully!`);
      } else {
        // For now, we'll just show a message since user creation requires Firebase Auth
        toast.info('User creation requires Firebase Authentication setup.');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error("Failed to save user.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        toast.success(`User "${userName}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Failed to delete user.");
      }
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'technician': return 'Technician';
      case 'phlebotomist': return 'Phlebotomist';
      default: return role;
    }
  };

  if (loading) {
    return (
      <UsersContainer>
        <LoadingContainer>
          <FaSpinner className="fa-spin" size={24} />
          <span>Loading users...</span>
        </LoadingContainer>
      </UsersContainer>
    );
  }

  return (
    <UsersContainer>
      <Header>
        <div>
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <AddButton onClick={() => handleOpenModal()}>
          <FaPlus /> Add New User
        </AddButton>
      </Header>

      <SearchContainer>
        <FaSearch />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {filteredUsers.length === 0 ? (
        <EmptyState>
          <h3>No Users Found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'No users have been added yet.'
            }
          </p>
        </EmptyState>
      ) : (
        <UsersGrid>
          {filteredUsers.map((user) => (
            <UserCard key={user.id}>
              <UserHeader>
                <UserInfo>
                  <UserName>
                    <FaUser />
                    {user.displayName}
                  </UserName>
                  <UserEmail>
                    <FaEnvelope />
                    {user.email}
                  </UserEmail>
                </UserInfo>
                <UserActions>
                  <ActionButton
                    $variant="secondary"
                    onClick={() => handleOpenModal(user)}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                  <ActionButton
                    $variant="danger"
                    onClick={() => handleDeleteUser(user.id, user.displayName)}
                  >
                    <FaTrash /> Delete
                  </ActionButton>
                </UserActions>
              </UserHeader>
              
              <UserDetails>
                <DetailItem>
                  <span>Role:</span>
                  <RoleBadge role={user.role}>
                    {getRoleDisplayName(user.role)}
                  </RoleBadge>
                </DetailItem>
                
                {user.department && (
                  <DetailItem>
                    <span>Department:</span>
                    <span>{user.department}</span>
                  </DetailItem>
                )}
                
                {user.phone && (
                  <DetailItem>
                    <span>Phone:</span>
                    <span>{user.phone}</span>
                  </DetailItem>
                )}
                
                <DetailItem>
                  <span>Status:</span>
                  <span style={{ color: user.disabled ? '#e74c3c' : '#27ae60' }}>
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
                </DetailItem>
              </UserDetails>
            </UserCard>
          ))}
        </UsersGrid>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add New User'}>
        <ModalForm onSubmit={handleSaveUser}>
          <FormGroup>
            <Label>Full Name *</Label>
            <Input
              name="displayName"
              value={userFormState.displayName}
              onChange={handleFormChange}
              placeholder="Enter full name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email *</Label>
            <Input
              name="email"
              type="email"
              value={userFormState.email}
              onChange={handleFormChange}
              placeholder="user@hospital.com"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Role *</Label>
            <Select
              name="role"
              value={userFormState.role}
              onChange={handleFormChange}
              required
            >
              <option value="technician">Technician</option>
              <option value="phlebotomist">Phlebotomist</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Department</Label>
            <Input
              name="department"
              value={userFormState.department}
              onChange={handleFormChange}
              placeholder="e.g., Chemistry Lab"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={userFormState.phone}
              onChange={handleFormChange}
              placeholder="+964 XXX XXX XXXX"
            />
          </FormGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SaveButton type="submit">
              {editingUser ? 'Update User' : 'Add User'}
            </SaveButton>
          </ButtonContainer>
        </ModalForm>
      </Modal>
    </UsersContainer>
  );
};

export default Users; 