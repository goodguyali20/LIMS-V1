import React from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={24} />, name: 'Dashboard' },
    { icon: <Package size={24} />, name: 'Orders' },
    { icon: <UserPlus size={24} />, name: 'Patient Registration', active: true },
    { icon: <Beaker size={24} />, name: 'Phlebotomy' },
    { icon: <ClipboardList size={24} />, name: 'Work Queue' },
    { icon: <History size={24} />, name: 'Patient History' },
    { icon: <Settings size={24} />, name: 'Quality Control' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
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
    </aside>
  );
};

export default NewSidebar; 