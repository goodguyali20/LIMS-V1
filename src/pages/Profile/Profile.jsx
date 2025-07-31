import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { showFlashMessage } from '../../contexts/NotificationContext';
import { advancedVariants } from '../../styles/animations';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const PageContainer = styled.div`
  animation: ${advancedVariants.fadeIn} 0.5s ease-in-out;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  max-width: 1000px;
  margin: auto;
  min-height: 100vh;
  background: ${({ theme }) => theme.isDarkMode 
    ? `linear-gradient(135deg, ${theme.colors.dark.background} 0%, #1a1a2e 50%, #16213e 100%)`
    : `linear-gradient(135deg, ${theme.colors.background} 0%, #f1f5f9 50%, #e2e8f0 100%)`
  };
  background-attachment: fixed;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 16px 16px 0 0;
  }
`;

const SkeletonCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 2rem;
  min-height: 200px;
  margin-bottom: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.main};
  opacity: 0.7;
  animation: pulse 1.5s infinite alternate;
  @keyframes pulse {
    0% { background: ${({ theme }) => theme.colors.surface}; }
    100% { background: ${({ theme }) => theme.colors.surfaceSecondary}; }
  }
`;

const CardHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
`;

const InfoGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    p { margin: 0; }
    strong { color: ${({ theme }) => theme.colors.text}; }
    span { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SubmitButton = styled(motion.button)`
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
  align-self: flex-end;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Profile = () => {
  const { t } = useTranslation(); // <-- Add this
  const { user, updateUserDisplayName } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for display name editing
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Update displayName state when user changes
  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  // Handle display name update
  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showFlashMessage({ type: 'error', title: 'Error', message: "Display name cannot be empty." });
      return;
    }

    setIsUpdatingName(true);
    
    try {
      await updateUserDisplayName(displayName.trim());
      showFlashMessage({ type: 'success', title: 'Success', message: "Display name updated successfully!" });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      showFlashMessage({ type: 'error', title: 'Error', message: "Failed to update display name. Please try again." });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFlashMessage({ type: 'error', title: 'Error', message: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
        showFlashMessage({ type: 'error', title: 'Error', message: "New password must be at least 6 characters long." });
        return;
    }

    setIsSubmitting(true);
    
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      showFlashMessage({ type: 'success', title: 'Success', message: "Password updated successfully!" });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      showFlashMessage({ type: 'error', title: 'Error', message: "Failed to update password. Check your current password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <CardHeader>{t('profile_details_header')}</CardHeader>
        <InfoGrid>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <strong>{t('profile_displayName')}:</strong> 
            {isEditingName ? (
              <form onSubmit={handleUpdateDisplayName} style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                <Input 
                  type="text" 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)}
                  style={{ width: '200px', margin: 0 }}
                  autoFocus
                />
                <motion.button
                  type="submit"
                  disabled={isUpdatingName}
                  style={{
                    padding: '0.3rem 0.8rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#667eea',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isUpdatingName ? 'Saving...' : 'Save'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setDisplayName(user?.displayName || '');
                  }}
                  style={{
                    padding: '0.3rem 0.8rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </form>
            ) : (
              <span>
                {user.displayName || 'Not set'} 
                <motion.button
                  onClick={() => setIsEditingName(true)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
              </span>
            )}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <strong>{t('profile_email')}:</strong> <span>{user.email}</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <strong>{t('profile_role')}:</strong> <span>{user.role}</span>
          </motion.p>
        </InfoGrid>
      </Card>
      <Card
        as={motion.div}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <CardHeader>{t('profile_changePassword_header')}</CardHeader>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>{t('profile_currentPassword')}</label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>{t('profile_newPassword')}</label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>{t('profile_confirmNewPassword')}</label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </InputGroup>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t('profile_updating') : t('profile_update_button')}
            </SubmitButton>
          </motion.div>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default Profile;