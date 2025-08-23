import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  name: string;
  path: string;
  icon?: string;
}

const Sidebar: React.FC = () => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Menu']);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuGroups: MenuGroup[] = [
    {
      title: 'Menu',
      items: [
        { name: 'Beranda', path: '/home', icon: '🏠' }
      ]
    },
    {
      title: 'Data Master',
      items: [
        { name: 'Komoditas', path: '/komoditas', icon: '📦' },
        { name: 'Peminjaman', path: '/peminjaman', icon: '📋' },
        { name: 'Pengembalian', path: '/pengembalian', icon: '🔄' }
      ]
    },
    {
      title: 'Manajemen Akun',
      items: [
        { name: 'Administrator', path: '/administrator', icon: '👤' },
        { name: 'Petugas', path: '/petugas', icon: '👥' },
        { name: 'Pengaturan Profil', path: '/pengaturan-profil', icon: '⚙️' }
      ]
    }
  ];

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Device Loan System</h3>
      </div>
      
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.title} className="menu-group">
            <div 
              className="group-header"
              onClick={() => toggleGroup(group.title)}
            >
              <span className="group-title">{group.title}</span>
              <span className={`chevron ${expandedGroups.includes(group.title) ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedGroups.includes(group.title) && (
              <ul className="menu-items">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <button
                      className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.icon && <span className="menu-icon">{item.icon}</span>}
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;