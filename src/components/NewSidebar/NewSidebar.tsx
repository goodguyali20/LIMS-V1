import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: <LayoutDashboard size={24} />, name: 'Dashboard' },
    { icon: <Package size={24} />, name: 'Orders' },
    { icon: <UserPlus size={24} />, name: 'Patient Registration', active: true },
    { icon: <Beaker size={24} />, name: 'Phlebotomy' },
    { icon: <ClipboardList size={24} />, name: 'Work Queue' },
    { icon: <History size={24} />, name: 'Patient History' },
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
          <path 
            className="cls-1"
            d="M0,459.51V0c5.6,14.81,17.76,25.14,31.25,32.69,24.6,13.79,50.36,16.64,50.75,50.59,1.14,97.94,0.24,196,0.56,293.99-0.64,27.3-30.71,35.24-50.3,46.5-15,8.64-26.26,19.09-32.26,35.75Z"
            fill="#161b22" 
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
          />
        </svg>

        <div className={styles.logoContainer}>
          {/* You can add a small logo icon here */}
        </div>
        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className={item.active ? styles.active : ''}>
                {item.active && <span className={styles.active_indicator}></span>}
                <a href="#" title={item.name}>
                  <span className={styles.icon}>{item.icon}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default NewSidebar; 