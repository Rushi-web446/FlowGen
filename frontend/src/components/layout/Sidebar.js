import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Rushi', email: 'rushi@example.com' };


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span>TextToLearn</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div
                        key={item.name}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${item.action === 'logout' ? 'nav-logout' : ''}`}
                        onClick={() => item.action === 'logout' ? handleLogout() : navigate(item.path)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-name">{item.name}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile" onClick={handleLogout} title="Click to Logout" style={{ cursor: 'pointer' }}>
                    <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
