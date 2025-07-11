import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { fadeIn } from '../../styles/animations';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

import AmendmentModal from '../../components/Modals/AmendmentModal';
import PrintableReport from '../../components/Report/PrintableReport';

const PageContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const DetailsCard = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem auto;
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: ${({ theme }) => theme.shadows.main};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  color: white;
  &:hover { opacity: 0.9; }
`;

const AmendButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.error};
`;

const ReportButton = styled(ActionButton)`
  background: ${({ theme }) => theme.colors.primary};
`;

// --- New Components for Notes ---
const NotesSection = styled.div`
  margin-top: 2rem;
`;

const NotesList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 1rem;
`;

const NoteItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  p { margin: 0; }
  
  small { 
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 0.5rem;
    display: block;
  }
`;

const NoteForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
`;

const Textarea = styled.textarea`
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 80px;
  font-family: inherit;
`;

const AddNoteButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.colors.primaryPlain};
  align-self: flex-end;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
// --- End of New Components ---


const OrderView = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth(); // <-- Get current user for notes
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [testToAmend, setTestToAmend] = useState(null); 
  const [newNote, setNewNote] = useState(""); // <-- State for the new note
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    const docRef = doc(db, 'testOrders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
      setOrder(orderData);
      if(orderData.tests && orderData.tests.length > 0) {
          setTestToAmend(orderData.tests[0]);
      }
    } else {
      console.log("No such document!");
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchOrder();
  }, [orderId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    const noteData = {
        noteText: newNote,
        author: currentUser.displayName || currentUser.email,
        createdAt: new Date(),
    };

    try {
        const orderRef = doc(db, "testOrders", order.id);
        await updateDoc(orderRef, {
            internalNotes: arrayUnion(noteData)
        });
        toast.success("Note added successfully!");
        setNewNote("");
        fetchOrder(); // Refresh order data to show the new note
    } catch (error) {
        toast.error("Failed to add note.");
        console.error("Error adding note:", error);
    } finally {
        setIsSubmittingNote(false);
    }
  };

  if (loading) return <p>Loading order details...</p>;
  if (!order) return <p>Order not found.</p>;

  const handleAmendClick = () => {
    if (!testToAmend) {
        alert("No test selected to amend.");
        return;
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setLoading(true);
    fetchOrder();
  }

  return (
    <>
      <PageContainer>
        <DetailsCard>
          <Header>
            <h2>Order Details #{order.id.substring(0, 6)}...</h2>
            <ButtonGroup>
              <ReportButton onClick={() => setShowReport(prev => !prev)}>
                {showReport ? 'Hide Report' : 'View Report'}
              </ReportButton>
              {(order.status === 'Completed' || order.status === 'Verified' || order.status === 'Amended') && (
                <AmendButton onClick={handleAmendClick}>Amend Report</AmendButton>
              )}
            </ButtonGroup>
          </Header>
          <div>
            <p><strong>Patient Name:</strong> {order.patientName}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Tests:</strong> {order.tests.join(', ')}</p>
          </div>
          
          {/* --- New Notes Section UI --- */}
          <NotesSection>
            <h3>Internal Notes</h3>
            <NotesList>
                {order.internalNotes && order.internalNotes.length > 0 ? (
                    order.internalNotes.slice().sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).map((note, index) => (
                        <NoteItem key={index}>
                            <p>{note.noteText}</p>
                            <small>
                                By {note.author} on {new Date(note.createdAt.seconds * 1000).toLocaleString()}
                            </small>
                        </NoteItem>
                    ))
                ) : (
                    <p>No internal notes for this order.</p>
                )}
            </NotesList>
            <NoteForm onSubmit={handleAddNote}>
                <Textarea 
                    placeholder="Add a new internal note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <AddNoteButton type="submit" disabled={isSubmittingNote}>
                    {isSubmittingNote ? 'Adding...' : 'Add Note'}
                </AddNoteButton>
            </NoteForm>
          </NotesSection>
          {/* --- End of New Notes Section UI --- */}

        </DetailsCard>
        
        {showReport && <PrintableReport order={order} />}
      </PageContainer>
      
      {isModalOpen && (
        <AmendmentModal 
          order={order}
          testToAmend={testToAmend}
          onClose={handleModalClose} 
        />
      )}
    </>
  );
};

export default OrderView;