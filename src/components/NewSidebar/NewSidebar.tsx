import React, { useState } from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const [activeIndex, setActiveIndex] = useState(2); // Patient Registration is active by default

  const menuItems = [
    { icon: <LayoutDashboard size={24} />, name: 'Dashboard' },
    { icon: <Package size={24} />, name: 'Orders' },
    { icon: <UserPlus size={24} />, name: 'Patient Registration' },
    { icon: <Beaker size={24} />, name: 'Phlebotomy' },
    { icon: <ClipboardList size={24} />, name: 'Work Queue' },
    { icon: <History size={24} />, name: 'Patient History' },
    { icon: <Settings size={24} />, name: 'Quality Control' },
  ];

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.logoContainer}>
        {/* You can add a small logo icon here */}
      </div>
      <nav className={styles.nav}>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} 
                className={`${styles.navItem} ${activeIndex === index ? styles.active : ''}`}
                onClick={() => handleItemClick(index)}
            >
              {/* Curved tab background */}
              {activeIndex === index && <div className={styles.curvedTab}></div>}
              {activeIndex === index && <span className={styles.active_indicator}></span>}
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