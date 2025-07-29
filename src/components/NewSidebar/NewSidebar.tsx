import React, { useState } from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings, User, LogOut } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const [activeIndex, setActiveIndex] = useState(2); // Patient Registration is active by default

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', path: '/dashboard' },
    { icon: <Package size={20} />, name: 'Orders', path: '/orders' },
    { icon: <UserPlus size={20} />, name: 'Patient Registration', path: '/patient-registration' },
    { icon: <Beaker size={20} />, name: 'Phlebotomy', path: '/phlebotomy' },
    { icon: <ClipboardList size={20} />, name: 'Work Queue', path: '/work-queue' },
    { icon: <History size={20} />, name: 'Patient History', path: '/patient-history' },
    { icon: <Settings size={20} />, name: 'Quality Control', path: '/quality-control' },
  ];

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Background gradient overlay */}
      <div className={styles.backgroundGradient}></div>
      
      {/* Logo container */}
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <span className={styles.logoText}>SL</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`${styles.navItem} ${activeIndex === index ? styles.active : ''}`}
              onClick={() => handleItemClick(index)}
            >
              {/* Tab background with curved shape */}
              <div className={styles.tabBackground}>
                <div className={styles.tabCurve}></div>
              </div>
              
              {/* Tab content */}
              <a href={item.path} className={styles.tabLink}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.name}</span>
              </a>

              {/* Active indicator with glow effect */}
              {activeIndex === index && (
                <div className={styles.activeIndicator}>
                  <div className={styles.glowEffect}></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section with profile */}
      <div className={styles.bottomSection}>
        <div className={styles.profileSection}>
          <div className={styles.profileTab}>
            <a href="/profile" className={styles.profileLink}>
              <User size={20} />
              <span className={styles.profileLabel}>Profile</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NewSidebar; 