import React from 'react';
import styled from 'styled-components';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status, theme }) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return `${theme.colors.success}20`;
      case 'in progress':
      case 'inprogress':
        return `${theme.colors.warning}20`;
      case 'pending':
        return `${theme.colors.info}20`;
      case 'rejected':
        return `${theme.colors.error}20`;
      case 'urgent':
        return `${theme.colors.urgent}20`;
      default:
        return `${theme.colors.textSecondary}20`;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return theme.colors.success;
      case 'in progress':
      case 'inprogress':
        return theme.colors.warning;
      case 'pending':
        return theme.colors.info;
      case 'rejected':
        return theme.colors.error;
      case 'urgent':
        return theme.colors.urgent;
      default:
        return theme.colors.textSecondary;
    }
  }};
  border: 1px solid ${({ status, theme }) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return `${theme.colors.success}40`;
      case 'in progress':
      case 'inprogress':
        return `${theme.colors.warning}40`;
      case 'pending':
        return `${theme.colors.info}40`;
      case 'rejected':
        return `${theme.colors.error}40`;
      case 'urgent':
        return `${theme.colors.urgent}40`;
      default:
        return `${theme.colors.textSecondary}40`;
    }
  }};
`;

const StatusBadge = React.memo(({ status, children }) => {
  return (
    <Badge status={status}>
      {children || status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;