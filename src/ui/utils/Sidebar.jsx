import React from 'react';
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Calendar, Settings } from "lucide-react";
import "./css/Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h1 className="sidebar-title">Journal <br />des Mondes 🌍</h1>

      <NavLink 
        to="/" 
        className={({ isActive }) => 
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        <Home className="sidebar-icon" />
        <span className="sidebar-text">Dashboard</span>
      </NavLink>

      <NavLink 
        to="/journal" 
        className={({ isActive }) => 
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        <BookOpen className="sidebar-icon" />
        <span className="sidebar-text">Journal</span>
      </NavLink>

      <NavLink 
        to="/review" 
        className={({ isActive }) => 
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        <Calendar className="sidebar-icon" />
        <span className="sidebar-text">Bilan</span>
      </NavLink>

      <NavLink 
        to="/settings" 
        className={({ isActive }) => 
          isActive ? "sidebar-link active" : "sidebar-link"
        }
      >
        <Settings className="sidebar-icon" />
        <span className="sidebar-text">Paramètres</span>
      </NavLink>
    </div>
  );
};

export default Sidebar;
