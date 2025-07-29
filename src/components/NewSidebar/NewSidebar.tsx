import React from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  // Debug logging
  console.log('NewSidebar render - styles object:', styles);
  console.log('NewSidebar render - sidebar class:', styles.sidebar);
  console.log('NewSidebar render - isOpen:', isOpen);
  
  const menuItems = [
    { icon: <LayoutDashboard size={24} />, name: 'Dashboard' },
    { icon: <Package size={24} />, name: 'Orders' },
    { icon: <UserPlus size={24} />, name: 'Patient Registration', active: true },
    { icon: <Beaker size={24} />, name: 'Phlebotomy' },
    { icon: <ClipboardList size={24} />, name: 'Work Queue' },
    { icon: <History size={24} />, name: 'Patient History' },
  ];

  const sidebarClassName = `${styles.sidebar} ${isOpen ? styles.open : styles.closed}`;
  console.log('NewSidebar render - final className:', sidebarClassName);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebar_content}>
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