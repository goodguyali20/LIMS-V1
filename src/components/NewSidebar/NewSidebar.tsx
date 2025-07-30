import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, Package, UserPlus, Beaker, ClipboardList, History, Settings } from 'lucide-react';
import styles from './NewSidebar.module.css';

interface NewSidebarProps {
  isOpen: boolean;
}

const NewSidebar: React.FC<NewSidebarProps> = ({ isOpen }) => {
  const topSvgRef = useRef<SVGSVGElement>(null);
  const bottomSvgRef = useRef<SVGSVGElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debug SVG positioning and dimensions
    if (topSvgRef.current && bottomSvgRef.current && sidebarRef.current) {
      const topSvg = topSvgRef.current;
      const bottomSvg = bottomSvgRef.current;
      const sidebar = sidebarRef.current;
      
      console.log('=== DETAILED DEBUG INFO ===');
      
      // Sidebar positioning
      const sidebarRect = sidebar.getBoundingClientRect();
      console.log('Sidebar positioning:', {
        left: sidebarRect.left,
        right: sidebarRect.right,
        width: sidebarRect.width,
        top: sidebarRect.top,
        bottom: sidebarRect.bottom,
        height: sidebarRect.height
      });
      
      // SVG container positioning
      const topContainer = topSvg.parentElement;
      const bottomContainer = bottomSvg.parentElement;
      
      if (topContainer && bottomContainer) {
        const topContainerRect = topContainer.getBoundingClientRect();
        const bottomContainerRect = bottomContainer.getBoundingClientRect();
        
        console.log('Top SVG container positioning:', {
          left: topContainerRect.left,
          right: topContainerRect.right,
          width: topContainerRect.width,
          top: topContainerRect.top,
          bottom: topContainerRect.bottom,
          height: topContainerRect.height
        });
        
        console.log('Bottom SVG container positioning:', {
          left: bottomContainerRect.left,
          right: bottomContainerRect.right,
          width: bottomContainerRect.width,
          top: bottomContainerRect.top,
          bottom: bottomContainerRect.bottom,
          height: bottomContainerRect.height
        });
        
        // Check computed styles
        const topStyles = getComputedStyle(topContainer);
        const bottomStyles = getComputedStyle(bottomContainer);
        
        console.log('Top container computed styles:', {
          position: topStyles.position,
          top: topStyles.top,
          left: topStyles.left,
          width: topStyles.width,
          zIndex: topStyles.zIndex,
          transform: topStyles.transform
        });
        
        console.log('Bottom container computed styles:', {
          position: bottomStyles.position,
          bottom: bottomStyles.bottom,
          left: bottomStyles.left,
          width: bottomStyles.width,
          zIndex: bottomStyles.zIndex,
          transform: bottomStyles.transform
        });
      }
      
      // SVG element details
      console.log('Top SVG element:', {
        width: topSvg.clientWidth,
        height: topSvg.clientHeight,
        viewBox: {
          x: topSvg.viewBox.baseVal.x,
          y: topSvg.viewBox.baseVal.y,
          width: topSvg.viewBox.baseVal.width,
          height: topSvg.viewBox.baseVal.height
        },
        boundingRect: {
          x: topSvg.getBoundingClientRect().x,
          y: topSvg.getBoundingClientRect().y,
          width: topSvg.getBoundingClientRect().width,
          height: topSvg.getBoundingClientRect().height
        }
      });
      
      console.log('Bottom SVG element:', {
        width: bottomSvg.clientWidth,
        height: bottomSvg.clientHeight,
        viewBox: {
          x: bottomSvg.viewBox.baseVal.x,
          y: bottomSvg.viewBox.baseVal.y,
          width: bottomSvg.viewBox.baseVal.width,
          height: bottomSvg.viewBox.baseVal.height
        },
        boundingRect: {
          x: bottomSvg.getBoundingClientRect().x,
          y: bottomSvg.getBoundingClientRect().y,
          width: bottomSvg.getBoundingClientRect().width,
          height: bottomSvg.getBoundingClientRect().height
        }
      });
      
      // Viewport calculations
      console.log('Viewport calculations:', {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        expectedTriangleWidth: window.innerWidth - 90,
        sidebarWidth: 90
      });
      
      // Path analysis
      console.log('=== PATH ANALYSIS ===');
      console.log('Top SVG path: M0,60 L100,60 L100,0 Z');
      console.log('Bottom SVG path: M0,0 L100,0 L100,60 Z');
      console.log('Expected: Triangles should start from sidebar edge (x=90) and extend to viewport edge (x=viewportWidth)');
    }
  }, []);

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
        {/* Top SVG Shape */}
        <div className={styles.top_svg_container}>
          <svg 
            ref={topSvgRef}
            viewBox="0 0 90 60" 
            preserveAspectRatio="none" 
            className={styles.top_svg}
          >
            <path 
              d="M0,0 L0,60 L90,60 Z" 
              fill="#161b22" 
              stroke="red"
              strokeWidth="2"
            />
            {/* Labels for triangle sides */}
            <text x="5" y="30" fill="white" fontSize="12">A</text>
            <text x="45" y="55" fill="white" fontSize="12">B</text>
            <text x="85" y="30" fill="white" fontSize="12">C</text>
          </svg>
        </div>

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

        {/* Bottom SVG Shape */}
        <div className={styles.bottom_svg_container}>
          <svg 
            ref={bottomSvgRef}
            viewBox="0 0 90 60" 
            preserveAspectRatio="none" 
            className={styles.bottom_svg}
          >
            <path 
              d="M0,0 L90,0 L0,60 Z" 
              fill="#161b22" 
              stroke="red"
              strokeWidth="2"
            />
            {/* Labels for triangle sides */}
            <text x="45" y="15" fill="white" fontSize="12">A</text>
            <text x="85" y="30" fill="white" fontSize="12">B</text>
            <text x="5" y="30" fill="white" fontSize="12">C</text>
          </svg>
        </div>
      </div>
    </aside>
  );
};

export default NewSidebar; 