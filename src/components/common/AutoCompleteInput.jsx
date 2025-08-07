import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaTimes } from 'react-icons/fa';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${({ theme, $hasError, $isFocused }) => 
    $hasError ? theme.colors.error : 
    $isFocused ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  background: #fff;
  color: #23263a;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  width: 100%;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.5);
    background: #fff;
    box-shadow: 
      0 8px 32px rgba(102, 126, 234, 0.15),
      0 4px 16px rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    transform: scale(1.02);
    background: #fff;
    color: #23263a;
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const SuggestionsContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background-color: rgba(102, 126, 234, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoSuggestions = styled.div`
  padding: 0.75rem 1rem;
  color: #6b7280;
  font-style: italic;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  color: #6b7280;
  
  &::after {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 8px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const AutoCompleteInput = React.forwardRef(({
  value,
  onChange,
  onBlur,
  placeholder,
  suggestions = [],
  isLoading = false,
  error,
  name,
  id,
  type = 'text',
  disabled = false,
  required = false,
  autoComplete = 'off',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    setShowSuggestions(newValue.length >= 2);
    setHighlightedIndex(-1);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    onChange({ target: { name, value: suggestion } });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (value.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 200);
    onBlur?.();
  };

  // Clear input
  const handleClear = () => {
    onChange({ target: { name, value: '' } });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Scroll highlighted suggestion into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <InputContainer>
      <StyledInput
        ref={ref || inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        name={name}
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        $hasError={!!error}
        $isFocused={isFocused}
        {...props}
      />
      
      {value && (
        <ClearButton onClick={handleClear} type="button">
          <FaTimes size={12} />
        </ClearButton>
      )}

      <AnimatePresence>
        {showSuggestions && (
          <SuggestionsContainer
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <LoadingSpinner>
                Loading suggestions...
              </LoadingSpinner>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    backgroundColor: index === highlightedIndex ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                  }}
                >
                  {suggestion}
                </SuggestionItem>
              ))
            ) : (
              <NoSuggestions>
                No suggestions found
              </NoSuggestions>
            )}
          </SuggestionsContainer>
        )}
      </AnimatePresence>
    </InputContainer>
  );
});

export default AutoCompleteInput; 