# SmartLab Project Structure

## Overview
This document outlines the organized structure of the SmartLab LIMS project, designed for maintainability, scalability, and developer experience.

## Directory Structure

```
smartlab-vite/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components used across the app
│   │   ├── Layout/          # Layout-related components
│   │   ├── Auth/            # Authentication components
│   │   ├── Analytics/       # Analytics and chart components
│   │   ├── Modals/          # Modal components
│   │   ├── PatientRegistration/ # Patient registration components
│   │   ├── Print/           # Print-related components
│   │   ├── Report/          # Report components
│   │   ├── WorkQueue/       # Work queue components
│   │   ├── showcase/        # Demo and showcase components
│   │   └── index.js         # Centralized component exports
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard/       # Dashboard pages
│   │   ├── Login/           # Authentication pages
│   │   ├── PatientRegistration/ # Patient-related pages
│   │   ├── OrderView/       # Order management pages
│   │   ├── WorkQueue/       # Workflow pages
│   │   ├── QualityControl/  # Quality control pages
│   │   ├── Inventory/       # Inventory management
│   │   ├── ResultEntry/     # Laboratory result entry
│   │   ├── Phlebotomist/    # Phlebotomy workflow
│   │   ├── Scanner/         # Barcode/QR scanning
│   │   ├── Settings/        # Application settings
│   │   ├── Profile/         # User profile pages
│   │   ├── AuditLog/        # Audit logging
│   │   ├── NotFound/        # Error pages
│   │   └── index.js         # Centralized page exports
│   │
│   ├── utils/               # Utility functions and helpers
│   │   ├── core/            # Core utilities (dates, validation, auth)
│   │   ├── security/        # Security-related utilities
│   │   ├── pdf/             # PDF generation utilities
│   │   ├── performance/     # Performance optimization utilities
│   │   ├── data/            # Data handling utilities
│   │   ├── patient/         # Patient-related utilities
│   │   ├── monitoring/      # Monitoring and logging utilities
│   │   ├── services/        # External service integrations
│   │   ├── testing/         # Testing utilities
│   │   └── index.js         # Centralized utility exports
│   │
│   ├── contexts/            # React contexts for state management
│   ├── hooks/               # Custom React hooks
│   ├── firebase/            # Firebase configuration
│   ├── locales/             # Internationalization files
│   ├── styles/              # Global styles and themes
│   ├── types/               # TypeScript type definitions
│   ├── test/                # Test files
│   ├── pdf/                 # PDF templates
│   ├── demos/               # Demo and example components
│   └── assets/              # Static assets
│
├── public/                  # Public static files
├── docs/                    # Documentation files
└── scripts/                 # Build and utility scripts
```

## Key Organizational Principles

### 1. **Feature-Based Organization**
- Components and pages are organized by feature/domain
- Related functionality is grouped together
- Clear separation between UI components and business logic

### 2. **Utility Organization**
- Utilities are categorized by purpose (core, security, pdf, etc.)
- Each category has a specific responsibility
- Centralized exports through index files

### 3. **Component Hierarchy**
- Common components are shared across the application
- Feature-specific components are isolated
- Clear distinction between layout, business, and presentation components

### 4. **Import/Export Strategy**
- Centralized index files for easy imports
- Consistent naming conventions
- Clear separation of concerns

## File Naming Conventions

### Components
- Use PascalCase for component files: `PatientRegistration.jsx`
- Use descriptive names that indicate the component's purpose
- Group related components in subdirectories

### Utilities
- Use camelCase for utility files: `dateUtils.js`
- Use descriptive names that indicate the utility's function
- Group by category in subdirectories

### Pages
- Use PascalCase for page components: `PatientRegistration.jsx`
- Match the route structure where possible
- Group by feature domain

## Import Patterns

### Before (Scattered imports)
```javascript
import { PatientRegistration } from './pages/PatientRegistration/PatientRegistration.jsx';
import { dateUtils } from './utils/dateUtils.js';
import { GlowButton } from './components/common/GlowButton.jsx';
```

### After (Organized imports)
```javascript
import { PatientRegistration } from './pages';
import { dateUtils } from './utils';
import { GlowButton } from './components';
```

## Benefits of This Structure

1. **Maintainability**: Related code is grouped together
2. **Scalability**: Easy to add new features without cluttering
3. **Discoverability**: Clear organization makes it easy to find code
4. **Reusability**: Centralized exports make components easy to import
5. **Consistency**: Standardized patterns across the codebase
6. **Performance**: Better tree-shaking and code splitting opportunities

## Migration Notes

- Old utility files have been moved to categorized subdirectories
- Demo files moved to dedicated `demos/` directory
- Duplicate showcase components consolidated
- All imports updated to use new index files
- Maintained backward compatibility where possible

## Future Improvements

1. **Type Safety**: Consider migrating more files to TypeScript
2. **Testing**: Add comprehensive test coverage for utilities
3. **Documentation**: Add JSDoc comments to all utilities
4. **Performance**: Implement lazy loading for large components
5. **Accessibility**: Add ARIA labels and keyboard navigation
