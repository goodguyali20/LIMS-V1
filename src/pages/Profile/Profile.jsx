import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  max-width: 1000px;
  margin: auto;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
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

const SubmitButton = styled.button`
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
  const { currentUser } = useAuth();
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
        <Card>
            <CardHeader>{t('profile_details_header')}</CardHeader>
            <InfoGrid>
                <p><strong>{t('profile_displayName')}:</strong> <span>{currentUser.displayName}</span></p>
                <p><strong>{t('profile_email')}:</strong> <span>{currentUser.email}</span></p>
                <p><strong>{t('profile_role')}:</strong> <span>{currentUser.role}</span></p>
            </InfoGrid>
        </Card>
        <Card>
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
                <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('profile_updating') : t('profile_update_button')}
                </SubmitButton>
            </Form>
        </Card>
    </PageContainer>
  );
};

export default Profile;