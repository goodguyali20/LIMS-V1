import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings, Database } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={24} />, name: 'Dashboard', path: '/app/dashboard' },
    { icon: <Package size={24} />, name: 'Orders', path: '/app/orders' },
    { icon: <UserPlus size={24} />, name: 'Patient Registration', path: '/app/register' },
    { icon: <Beaker size={24} />, name: 'Phlebotomy', path: '/app/phlebotomy' },
    { icon: <ClipboardList size={24} />, name: 'Work Queue', path: '/app/work-queue' },
    { icon: <History size={24} />, name: 'Patient History', path: '/app/patient-history' },
    { icon: <Database size={24} />, name: 'Inventory', path: '/app/inventory' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div ref={sidebarRef} className={styles.sidebar_content}>
        {/* New Adobe Illustrator SVG Shape */}
        <svg 
          viewBox="0 0 120 500" 
          preserveAspectRatio="none" 
          className={styles.sidebar_svg}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="sidebarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: 'rgba(255, 255, 255, 0.1)', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: 'rgba(255, 255, 255, 0.05)', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: 'rgba(102, 126, 234, 0.1)', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: 'rgba(118, 75, 162, 0.05)', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          {/* Main shape with glassmorphism gradient */}
          <path 
            className="cls-1"
            d="M0,459.51V0c5.6,14.81,17.76,25.14,31.25,32.69,24.6,13.79,50.36,16.64,50.75,50.59,1.14,97.94,0.24,196,0.56,293.99-0.64,27.3-30.71,35.24-50.3,46.5-15,8.64-26.26,19.09-32.26,35.75Z"
            fill="url(#sidebarGradient)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        </svg>

        <div className={styles.logoContainer}>
          {/* You can add a small logo icon here */}
        </div>
        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isGradient = 
                item.path === '/app/register' ||
                item.path === '/app/phlebotomy' ||
                item.path === '/app/work-queue';
              
              return (
                <li key={index} className={isActive ? styles.active : ''}>
                  {isActive && <span className={styles.active_indicator}></span>}
                  <Link to={item.path} title={item.name}>
                    <span className={`${styles.icon} ${isGradient ? styles.gradientIcon : ''}`}>
                      {item.icon}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default NewSidebar; 