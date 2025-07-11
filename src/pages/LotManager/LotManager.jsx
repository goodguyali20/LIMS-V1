import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, doc, addDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
    a {
        text-decoration: none;
        color: ${({ theme }) => theme.colors.primaryPlain};
        &:hover { text-decoration: underline; }
    }
    h1 { margin-top: 0.5rem; }
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

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
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
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  color: white;
  background: ${({ theme }) => theme.colors.primary};
  height: fit-content;
`;

const LotTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const LotManager = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [lotNumber, setLotNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch the main item's details
    const itemDocRef = doc(db, 'inventoryItems', itemId);
    getDoc(itemDocRef).then(docSnap => {
        if(docSnap.exists()){
            setItem({ id: docSnap.id, ...docSnap.data() });
        }
    });

    // Listen for real-time updates to the lots for this item
    const lotsCollectionRef = collection(db, 'inventoryItems', itemId, 'lots');
    const unsubscribe = onSnapshot(lotsCollectionRef, (snapshot) => {
      const lotsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLots(lotsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lotNumber || !quantity || !expiryDate) {
      toast.error("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const lotsCollectionRef = collection(db, 'inventoryItems', itemId, 'lots');
      await addDoc(lotsCollectionRef, {
        lotNumber,
        quantity: Number(quantity),
        expiryDate: new Date(expiryDate),
        createdAt: new Date(),
      });
      toast.success(`New lot for ${item.name} added.`);
      setLotNumber('');
      setQuantity('');
      setExpiryDate('');
    } catch (error) {
      toast.error("Failed to add lot.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading lot details...</p>;

  return (
    <PageContainer>
        <PageHeader>
            <Link to="/inventory">&larr; Back to All Inventory</Link>
            <h1>Lot Manager for {item?.name || 'Item'}</h1>
        </PageHeader>
      <Card>
        <CardHeader>Check-In New Lot</CardHeader>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Lot Number</label>
            <Input value={lotNumber} onChange={e => setLotNumber(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>Quantity Received</label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>Expiry Date</label>
            <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
          </InputGroup>
          <SubmitButton type="submit" disabled={isSubmitting}>Add Lot</SubmitButton>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>Current Lots</CardHeader>
        <LotTable>
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Quantity on Hand</th>
              <th>Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {lots.length > 0 ? (
              lots.map(lot => (
                <tr key={lot.id}>
                  <td>{lot.lotNumber}</td>
                  <td>{lot.quantity}</td>
                  <td>{lot.expiryDate.toDate().toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
                <tr><td colSpan="3">No lots checked in for this item yet.</td></tr>
            )}
          </tbody>
        </LotTable>
      </Card>
    </PageContainer>
  );
};

export default LotManager;