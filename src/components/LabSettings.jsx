import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

//--- STYLED COMPONENTS ---//
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
  padding: 10px;
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

const LabSettings = () => {
    const [labInfo, setLabInfo] = useState({ name: '', address: '', phone: '' });
    const settingsDocRef = doc(db, 'settings', 'labInfo');

    useEffect(() => {
        const fetchLabInfo = async () => {
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                setLabInfo(docSnap.data());
            } else {
                setLabInfo({ name: 'مستشفى العزيزية العام', address: 'Kut, Wasit Governorate, Iraq', phone: '' });
            }
        };
        fetchLabInfo();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLabInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await setDoc(settingsDocRef, labInfo, { merge: true });
            toast.success("Lab information updated successfully!");
        } catch (error) {
            console.error("Error updating lab info:", error);
            toast.error("Failed to update lab information.");
        }
    };

    return (
        <>
            <Title>Report Customization</Title>
            <Form onSubmit={handleSave}>
                <InputGroup>
                    <Label>Lab Name</Label>
                    <Input type="text" name="name" value={labInfo.name} onChange={handleInputChange} />
                </InputGroup>
                <InputGroup>
                    <Label>Address</Label>
                    <Input type="text" name="address" value={labInfo.address} onChange={handleInputChange} />
                </InputGroup>
                <InputGroup>
                    <Label>Phone Number</Label>
                    <Input type="text" name="phone" value={labInfo.phone} onChange={handleInputChange} />
                </InputGroup>
                <SaveButton type="submit">Save Report Info</SaveButton>
            </Form>
        </>
    );
};

export default LabSettings;