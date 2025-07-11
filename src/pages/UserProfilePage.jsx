import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext.jsx';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { toast } from 'react-toastify';

//--- STYLED COMPONENTS ---//
const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const ContentBox = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 32px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

const SaveButton = styled.button`
  padding: 12px;
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  cursor: pointer;
  font-weight: 600;
  margin-top: 8px;
`;

const UserProfilePage = () => {
    const { currentUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

        setLoading(true);

        try {
            // Re-authenticate the user first for security
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // If re-authentication is successful, update the password
            await updatePassword(currentUser, newPassword);

            toast.success("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error("Incorrect current password.");
            } else {
                toast.error("Failed to update password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <ProfileContainer>
                <ContentBox>
                    <Title>Change Your Password</Title>
                    <Form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </InputGroup>
                        <SaveButton type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </SaveButton>
                    </Form>
                </ContentBox>
            </ProfileContainer>
        </div>
    );
};

export default UserProfilePage;