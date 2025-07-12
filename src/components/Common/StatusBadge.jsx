import React from 'react';
import styled from 'styled-components';

const Badge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #fff;
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'Pending':
        return theme.colors.warning;
      case 'In Progress':
        return theme.colors.info;
      case 'Completed':
        return theme.colors.success;
      case 'Verified':
        return theme.colors.primary;
      case 'Amended':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  }};
`;

const StatusBadge = ({ status }) => {
  return <Badge status={status}>{status}</Badge>;
};

export default StatusBadge;