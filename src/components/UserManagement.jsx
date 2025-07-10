import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, auth } from '../firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

//--- STYLED COMPONENTS (Vivid Design) ---//
const ManagementContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(24)};
  padding: 24px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  ${({ theme }) => theme.squircle(16)};
  background: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.borderColor};
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
    span { font-weight: 500; }
    small { display: block; color: ${({ theme }) => theme.text}99; text-transform: capitalize; }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${({ theme }) => theme.danger};
`;

const AddForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  &.full-width { grid-column: 1 / -1; }
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(12)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

const AddButton = styled.button`
  grid-column: 1 / -1;
  padding: 12px;
  background: ${({ theme }) => theme.primaryGradient};
  color: white;
  border: none;
  ${({ theme }) => theme.squircle(12)};
  cursor: pointer;
  font-weight: 600;
`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('receptionist');

    const fetchUsers = async () => {
        const data = await getDocs(collection(db, 'users'));
        setUsers(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword) {
            toast.warn("Please provide an email and password.");
            return;
        }
        const managerEmail = auth.currentUser.email;
        const managerPassword = prompt("For security, please re-enter your manager password:");
        if (!managerPassword) {
            toast.info("User creation cancelled.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
            await setDoc(doc(db, 'users', userCredential.user.uid), { email: newUserEmail, role: newUserRole });
            toast.success(`User ${newUserEmail} created successfully!`);
            await signInWithEmailAndPassword(auth, managerEmail, managerPassword);
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error(`Failed to create user: ${error.message}`);
            await signInWithEmailAndPassword(auth, managerEmail, managerPassword).catch(err => console.error("Failed to re-login manager:", err));
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (userId === auth.currentUser.uid) {
            toast.error("You cannot delete your own account.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the user record for ${userEmail}?`)) {
            await deleteDoc(doc(db, 'users', userId));
            fetchUsers();
            toast.info("User record deleted.");
        }
    };

    return (
        <ManagementContainer>
            <Title>Manage Users</Title>
            <div>
                {users.map(user => (
                    <UserCard key={user.id}>
                        <UserInfo><span>{user.email}</span><small>{user.role}</small></UserInfo>
                        <DeleteButton onClick={() => handleDeleteUser(user.id, user.email)}><FaTrash /></DeleteButton>
                    </UserCard>
                ))}
            </div>
            <AddForm onSubmit={handleAddUser}>
                <InputGroup className="full-width"><Label>New User Email</Label><Input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="user@lab.com" required /></InputGroup>
                <InputGroup><Label>Temporary Password</Label><Input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="••••••••" required /></InputGroup>
                <InputGroup><Label>Role</Label><Select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}><option value="receptionist">Receptionist</option><option value="phlebotomist">Phlebotomist</option><option value="technologist">Technologist</option><option value="manager">Manager</option></Select></InputGroup>
                <AddButton type="submit">Add New User</AddButton>
            </AddForm>
        </ManagementContainer>
    );
};

export default UserManagement;