import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './NavigationRail.css';

// Import your actual icons here. These are just examples.
import { Home, FileText, User, TestTube, Users, BarChart2, Shield, Settings, LogOut } from 'lucide-react';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: Home },
  { path: '/app/orders', label: 'Orders', icon: FileText },
  { path: '/app/registration', label: 'Patient Registration', icon: User },
  { path: '/app/phlebotomy', label: 'Phlebotomy', icon: TestTube },
  { path: '/app/work-queue', label: 'Work Queue', icon: Users },
  { path: '/app/history', label: 'Patient History', icon: BarChart2 },
  { path: '/app/quality-control', label: 'Quality Control', icon: Shield },
  { path: '/app/inventory', label: 'Inventory', icon: Settings },
];

function NavigationRail() {
  const location = useLocation();

  useEffect(() => {
    const sidebar = document.querySelector('.c-navigation-rail');
    const page = document.body;
    if (sidebar) {
      const sidebarBg = getComputedStyle(sidebar).background;
      console.log('Sidebar computed background:', sidebarBg);
    }
    if (page) {
      const pageBg = getComputedStyle(page).background;
      console.log('Page computed background:', pageBg);
    }
  }, []);

  console.log('Rendering NavigationRail, location:', location.pathname);

  return (
    <nav className="c-navigation-rail">
      <div className="c-navigation-rail-inner">
        <div className="nav-group-main">
          <ul>
            {navItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              if (isActive) {
                console.log('Active nav item:', item.label, item.path);
              }
              return (
                <li key={item.path} className={isActive ? 'is-active' : ''}>
                  <a
                    href={item.path}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <item.icon size={24} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Remove nav-group-footer and logout button */}
      </div>
    </nav>
  );
}

export default NavigationRail;