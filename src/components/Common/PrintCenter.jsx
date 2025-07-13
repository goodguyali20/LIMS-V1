import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPrint, FaDownload, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(20, 20, 30, 0.65);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  box-shadow: 0 8px 40px rgba(0,0,0,0.25);
  max-width: 900px;
  width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  @media (max-width: 600px) {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h2`
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.error}; }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const PreviewPane = styled.div`
  flex: 2;
  background: ${({ theme }) => theme.colors.background};
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 1rem;
  }
`;

const SettingsPane = styled.div`
  flex: 1;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DocItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ selected, theme }) => selected ? theme.colors.primary + '22' : theme.colors.input};
  color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.text};
  cursor: pointer;
  font-weight: 500;
  border: 2px solid transparent;
  transition: background 0.2s, color 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.primary + '18'}; }
`;

const SettingsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.7rem;
  border: none;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  font-size: 1.1rem;
  font-weight: 700;
  background: ${({ $variant, theme }) => $variant === 'primary' ? theme.colors.primary : theme.colors.secondary};
  color: white;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.primary}22;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover { background: ${({ $variant, theme }) => $variant === 'primary' ? theme.colors.secondary : theme.colors.primary}; }
`;

const Feedback = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  color: ${({ $type, theme }) => $type === 'success' ? theme.colors.success : $type === 'error' ? theme.colors.error : theme.colors.primary};
`;

const PrintCenter = ({ open, onClose, documents = [], onPrint, onDownloadPDF, loading, feedback, selectedDocIndex = 0, onSelectDoc, printSettings, onChangeSettings }) => {
  const modalRef = useRef();

  // Focus trap
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  // Keyboard shortcut: P to open/close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'p' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-label="Close print center"
      >
        <Modal
          ref={modalRef}
          tabIndex={-1}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Print Center"
        >
          <Header>
            <Title>Print Center</Title>
            <CloseButton onClick={onClose} aria-label="Close">
              <FaTimes />
            </CloseButton>
          </Header>
          <Content>
            <PreviewPane>
              {/* Animated preview of the selected document */}
              {documents.length > 0 ? (
                <motion.div
                  key={selectedDocIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', maxWidth: 600 }}
                >
                  {documents[selectedDocIndex]?.preview || <div style={{height: 400, display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa'}}>No Preview</div>}
                </motion.div>
              ) : (
                <div style={{height: 400, display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa'}}>No Documents</div>
              )}
              {loading && (
                <Feedback $type="primary"><FaSpinner className="spin" /> Generating preview...</Feedback>
              )}
              {feedback && feedback.type && (
                <Feedback $type={feedback.type}>
                  {feedback.type === 'success' && <FaCheckCircle />}
                  {feedback.type === 'error' && <FaExclamationCircle />}
                  {feedback.message}
                </Feedback>
              )}
            </PreviewPane>
            <SettingsPane>
              <DocumentList>
                {documents.map((doc, idx) => (
                  <DocItem
                    key={doc.id || idx}
                    selected={idx === selectedDocIndex}
                    onClick={() => onSelectDoc && onSelectDoc(idx)}
                  >
                    {doc.icon && <span>{doc.icon}</span>}
                    <span>{doc.title || `Document ${idx+1}`}</span>
                  </DocItem>
                ))}
              </DocumentList>
              <SettingsGroup>
                <Label htmlFor="paperSize">Paper Size</Label>
                <Select id="paperSize" value={printSettings?.paperSize || 'A4'} onChange={e => onChangeSettings && onChangeSettings({ ...printSettings, paperSize: e.target.value })}>
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </Select>
              </SettingsGroup>
              <SettingsGroup>
                <Label htmlFor="orientation">Orientation</Label>
                <Select id="orientation" value={printSettings?.orientation || 'portrait'} onChange={e => onChangeSettings && onChangeSettings({ ...printSettings, orientation: e.target.value })}>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </Select>
              </SettingsGroup>
              <SettingsGroup>
                <Label htmlFor="colorMode">Color Mode</Label>
                <Select id="colorMode" value={printSettings?.colorMode || 'color'} onChange={e => onChangeSettings && onChangeSettings({ ...printSettings, colorMode: e.target.value })}>
                  <option value="color">Color</option>
                  <option value="bw">Black & White</option>
                </Select>
              </SettingsGroup>
              <ButtonRow>
                <ActionButton $variant="primary" onClick={onPrint} disabled={loading} aria-label="Print">
                  <FaPrint /> Print
                </ActionButton>
                <ActionButton $variant="secondary" onClick={onDownloadPDF} disabled={loading} aria-label="Download PDF">
                  <FaDownload /> PDF
                </ActionButton>
              </ButtonRow>
            </SettingsPane>
          </Content>
        </Modal>
      </Backdrop>
    </AnimatePresence>
  );
};

export default PrintCenter; 