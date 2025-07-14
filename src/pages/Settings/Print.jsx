import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer,
  FileText,
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  FileImage,
  FileType,
  Palette,
  Type,
  Ruler,
  Paperclip,
  Image as ImageIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  Save as SaveIcon,
  RefreshCw as RefreshIcon,
  CheckCircle as CheckIcon,
  AlertCircle as AlertIcon,
  Info as InfoIcon,
  FileImage as FileImageIcon,
  FileType as FileTypeIcon,
  Palette as PaletteIcon,
  Type as TypeIcon,
  Ruler as RulerIcon,
  Paperclip as PaperclipIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlowCard, GlowButton, AnimatedModal, AnimatedNotification } from '../../components/common';
import { toast } from 'react-toastify';

// Styled Components
const PrintContainer = styled.div`
  padding: 2rem;
`;

const PrintHeader = styled.div`
  margin-bottom: 2rem;
`;

const PrintTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PrintDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SettingCard = styled(GlowCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  grid-column: 1 / -1;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.shapes.squircle};
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  margin-bottom: 1rem;
  grid-column: 1 / -1;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const TemplateCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceSecondary};
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.shapes.squircle};
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const TemplateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TemplateName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const TemplateActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  svg {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary};
    width: 1rem;
    height: 1rem;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const TemplatePreview = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: #666;
  min-height: 60px;
  margin-bottom: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  grid-column: 1 / -1;
`;

const SaveButton = styled(GlowButton)``;
const CancelButton = styled(GlowButton)`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Print = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formState, setFormState] = useState({
    defaultPrinter: '',
    printQuality: 'high',
    paperSize: 'A4',
    orientation: 'portrait',
    margins: 'normal',
    headerEnabled: true,
    footerEnabled: true,
    logoEnabled: true,
    watermarkEnabled: false,
    autoPrint: false,
    saveToPDF: true,
    reportHeader: '',
    reportFooter: ''
  });

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Standard Report',
      type: 'report',
      content: 'Standard laboratory report template with header and footer',
      active: true
    },
    {
      id: 2,
      name: 'Patient Slip',
      type: 'slip',
      content: 'Patient identification slip template',
      active: true
    },
    {
      id: 3,
      name: 'Test Results',
      type: 'results',
      content: 'Detailed test results template',
      active: false
    },
    {
      id: 4,
      name: 'Quality Control',
      type: 'qc',
      content: 'Quality control report template',
      active: false
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenModal = (template = null) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(false);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        setTemplates(prev => prev.map(template => 
          template.id === editingTemplate.id 
            ? { ...template, ...formState }
            : template
        ));
        toast.success(`Template "${formState.name}" updated successfully!`);
      } else {
        // Add new template
        const newTemplate = {
          id: Date.now(),
          ...formState,
          active: false
        };
        setTemplates(prev => [...prev, newTemplate]);
        toast.success(`Template "${formState.name}" added successfully!`);
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save template.");
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"? This cannot be undone.`)) {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast.success(`Template "${templateName}" deleted successfully!`);
    }
  };

  const handleToggleTemplate = (templateId) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, active: !template.active }
        : template
    ));
  };

  return (
    <PrintContainer>
      <PrintHeader>
        <PrintTitle>
          <Printer size={24} />
          Print Settings
        </PrintTitle>
        <PrintDescription>
          Configure report templates, slip configurations, and print options
        </PrintDescription>
      </PrintHeader>

      <SettingsGrid>
        <SettingCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          color="#3b82f6"
        >
          <CardHeader>
            <CardIcon color="#3b82f6">
              <SettingsIcon size={24} />
            </CardIcon>
            <CardInfo>
              <CardTitle>Printer Configuration</CardTitle>
              <CardDescription>Configure default printer and print settings</CardDescription>
            </CardInfo>
          </CardHeader>

          <Form>
            <InputGroup>
              <Label>
                <Printer size={16} />
                Default Printer
              </Label>
              <Select 
                name="defaultPrinter" 
                value={formState.defaultPrinter} 
                onChange={handleInputChange}
              >
                <option value="">Select Printer</option>
                <option value="printer1">HP LaserJet Pro</option>
                <option value="printer2">Canon PIXMA</option>
                <option value="printer3">Epson WorkForce</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>
                <FileImageIcon size={16} />
                Print Quality
              </Label>
              <Select 
                name="printQuality" 
                value={formState.printQuality} 
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="best">Best</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>
                <RulerIcon size={16} />
                Paper Size
              </Label>
              <Select 
                name="paperSize" 
                value={formState.paperSize} 
                onChange={handleInputChange}
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </Select>
            </InputGroup>

            <InputGroup>
              <Label>
                <TypeIcon size={16} />
                Orientation
              </Label>
              <Select 
                name="orientation" 
                value={formState.orientation} 
                onChange={handleInputChange}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </InputGroup>
          </Form>
        </SettingCard>

        <SettingCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          color="#10b981"
        >
          <CardHeader>
            <CardIcon color="#10b981">
              <FileTextIcon size={24} />
            </CardIcon>
            <CardInfo>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Customize report headers, footers, and content</CardDescription>
            </CardInfo>
          </CardHeader>

          <Form>
            <InputGroup>
              <Label>
                <TypeIcon size={16} />
                Report Header
              </Label>
              <TextArea 
                name="reportHeader" 
                value={formState.reportHeader} 
                onChange={handleInputChange} 
                placeholder="Enter custom report header text..."
              />
            </InputGroup>

            <InputGroup>
              <Label>
                <TypeIcon size={16} />
                Report Footer
              </Label>
              <TextArea 
                name="reportFooter" 
                value={formState.reportFooter} 
                onChange={handleInputChange} 
                placeholder="Enter custom report footer text..."
              />
            </InputGroup>
          </Form>

          <TemplatesGrid>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                $active={template.active}
                onClick={() => handleToggleTemplate(template.id)}
              >
                <TemplateHeader>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateActions>
                    <EyeIcon onClick={(e) => { e.stopPropagation(); handleOpenModal(template); }} title="Preview"/>
                    <EditIcon onClick={(e) => { e.stopPropagation(); handleOpenModal(template); }} title="Edit"/>
                    <TrashIcon onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id, template.name); }} title="Delete"/>
                  </TemplateActions>
                </TemplateHeader>
                <TemplatePreview>
                  {template.content}
                </TemplatePreview>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  Type: {template.type.toUpperCase()}
                </div>
              </TemplateCard>
            ))}
          </TemplatesGrid>

          <GlowButton 
            onClick={() => handleOpenModal()}
            style={{ marginTop: '1rem' }}
          >
            <PlusIcon size={16} />
            Add Template
          </GlowButton>
        </SettingCard>

        <SettingCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          color="#f59e0b"
        >
          <CardHeader>
            <CardIcon color="#f59e0b">
              <PaletteIcon size={24} />
            </CardIcon>
            <CardInfo>
              <CardTitle>Print Options</CardTitle>
              <CardDescription>Configure advanced print settings and features</CardDescription>
            </CardInfo>
          </CardHeader>

          <ToggleContainer>
            <ToggleLabel>
              <FileTextIcon size={16} />
              <div>
                <strong>Include Header</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Add header to all printed documents
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="headerEnabled"
                checked={formState.headerEnabled}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <FileTextIcon size={16} />
              <div>
                <strong>Include Footer</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Add footer to all printed documents
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="footerEnabled"
                checked={formState.footerEnabled}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <ImageIcon size={16} />
              <div>
                <strong>Include Logo</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Add hospital logo to printed documents
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="logoEnabled"
                checked={formState.logoEnabled}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <ImageIcon size={16} />
              <div>
                <strong>Watermark</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Add watermark to printed documents
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="watermarkEnabled"
                checked={formState.watermarkEnabled}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <Printer size={16} />
              <div>
                <strong>Auto Print</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Automatically print reports when generated
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="autoPrint"
                checked={formState.autoPrint}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <DownloadIcon size={16} />
              <div>
                <strong>Save to PDF</strong>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                  Automatically save reports as PDF files
                </p>
              </div>
            </ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                name="saveToPDF"
                checked={formState.saveToPDF}
                onChange={handleInputChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>
        </SettingCard>
      </SettingsGrid>

      <AnimatedModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingTemplate ? 'Edit Template' : 'Add New Template'}
      >
        <div>
          <InputGroup>
            <Label>
              <FileTextIcon size={16} />
              Template Name
            </Label>
            <Input 
              name="name" 
              value={formState.name || ''} 
              onChange={handleInputChange} 
              placeholder="Enter template name" 
              required 
            />
          </InputGroup>
          
          <InputGroup>
            <Label>
              <FileTypeIcon size={16} />
              Template Type
            </Label>
            <Select 
              name="type" 
              value={formState.type || 'report'} 
              onChange={handleInputChange}
            >
              <option value="report">Report</option>
              <option value="slip">Slip</option>
              <option value="results">Results</option>
              <option value="qc">Quality Control</option>
            </Select>
          </InputGroup>
          
          <InputGroup>
            <Label>
              <TypeIcon size={16} />
              Template Content
            </Label>
            <TextArea 
              name="content" 
              value={formState.content || ''} 
              onChange={handleInputChange} 
              placeholder="Enter template content or description..." 
            />
          </InputGroup>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCloseModal}>
              Cancel
            </CancelButton>
            <SaveButton type="button" onClick={handleSaveTemplate}>
              <SaveIcon size={16} />
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </SaveButton>
          </ButtonContainer>
        </div>
      </AnimatedModal>
    </PrintContainer>
  );
};

export default Print; 