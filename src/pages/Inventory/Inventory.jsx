import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { fadeIn } from '../../styles/animations';
import { Link } from 'react-router-dom';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  tbody tr {
      cursor: pointer;
      &:hover {
          background-color: ${({ theme }) => theme.colors.background};
      }
  }
`;

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [itemName, setItemName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10); // Default threshold
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventoryItems"), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName) {
      toast.error("Item Name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "inventoryItems"), {
        name: itemName,
        manufacturer: manufacturer,
        lowStockThreshold: Number(lowStockThreshold),
        createdAt: new Date(),
      });
      toast.success(`${itemName} added to inventory.`);
      setItemName('');
      setManufacturer('');
      setLowStockThreshold(10);
    } catch (error) {
      toast.error("Failed to add item.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>Add New Inventory Item</CardHeader>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label>Item Name</label>
            <Input value={itemName} onChange={e => setItemName(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <label>Manufacturer</label>
            <Input value={manufacturer} onChange={e => setManufacturer(e.target.value)} />
          </InputGroup>
          <InputGroup>
            <label>Low Stock Threshold</label>
            <Input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} required />
          </InputGroup>
          <SubmitButton type="submit" disabled={isSubmitting}>Add Item</SubmitButton>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>Current Inventory Items</CardHeader>
        <ItemTable>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Manufacturer</th>
              <th>Low Stock Threshold</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3">Loading...</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/inventory/${item.id}`} style={{textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', height: '100%'}}>
                        {item.name}
                    </Link>
                  </td>
                  <td>{item.manufacturer}</td>
                  <td>{item.lowStockThreshold}</td>
                </tr>
              ))
            )}
          </tbody>
        </ItemTable>
      </Card>
    </PageContainer>
  );
};

export default Inventory;