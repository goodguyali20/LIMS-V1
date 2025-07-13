import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { advancedVariants } from '../../styles/animations';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { motion, AnimatePresence } from 'framer-motion';

const PageContainer = styled.div`
  animation: ${advancedVariants.fadeIn} 0.5s ease-in-out;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  max-width: 1000px;
  margin: auto;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
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
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
    }

    setIsSubmitting(true);
    
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      toast.success("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast.error("Failed to update password. Check your current password.");
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
            <strong>{t('profile_displayName')}:</strong> <span>{user.displayName}</span>
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