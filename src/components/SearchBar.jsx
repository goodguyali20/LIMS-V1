import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

//--- STYLED COMPONENTS ---//

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 16px;
  color: ${({ theme }) => theme.text}99;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px; /* Add padding for icon */
  border: 1px solid ${({ theme }) => theme.borderColor};
  ${({ theme }) => theme.squircle(16)};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}4D;
  }
`;

const ResultsDropdown = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: ${({ theme }) => theme.cardBg};
  ${({ theme }) => theme.squircle(16)};
  box-shadow: ${({ theme }) => theme.shadow};
  border: 1px solid ${({ theme }) => theme.borderColor};
  z-index: 10;
  max-height: 400px;
  overflow-y: auto;
`;

const ResultItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }

  p {
    margin: 0;
    font-weight: 600;
  }

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text}99;
  }
`;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        return;
      }

      // Search patients by name
      const patientQuery = query(
        collection(db, 'patients'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      
      // Search orders by ID
      const orderQuery = query(
        collection(db, 'testOrders'),
        where('__name__', '>=', searchTerm),
        where('__name__', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );

      const [patientSnapshot, orderSnapshot] = await Promise.all([
        getDocs(patientQuery),
        getDocs(orderQuery)
      ]);

      const patientResults = patientSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'Patient',
        ...doc.data()
      }));

      const orderResults = orderSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'Order',
        ...doc.data()
      }));

      setResults([...patientResults, ...orderResults]);
    };

    const debounceSearch = setTimeout(() => {
      performSearch();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(debounceSearch);
  }, [searchTerm]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (item) => {
    setSearchTerm('');
    setResults([]);
    setIsFocused(false);
    if (item.type === 'Patient') {
      navigate(`/patient/${item.id}`);
    } else if (item.type === 'Order') {
      navigate(`/report/${item.id}`);
    }
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchInputWrapper>
        <SearchIcon />
        <Input
          type="text"
          placeholder="Search by Patient Name or Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </SearchInputWrapper>
      {isFocused && results.length > 0 && (
        <ResultsDropdown>
          {results.map(item => (
            <ResultItem key={item.id} onClick={() => handleResultClick(item)}>
              <p>{item.name || item.patientName}</p>
              <span>{item.type === 'Patient' ? `Patient ID: ${item.id.substring(0,8)}` : `Order ID: ${item.id}`}</span>
            </ResultItem>
          ))}
        </ResultsDropdown>
      )}
    </SearchContainer>
  );
};

export default SearchBar;