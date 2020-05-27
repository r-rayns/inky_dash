import React from 'react';
import { NavLink } from 'react-router-dom';
import { Routes } from '../../globals/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './header.css';

export default function Header() {
  return (
    <div className="nav-bar">
      <nav className="nav-bar-content">
        <NavLink exact activeClassName="active" className="nav-link"
                 to={ Routes.display_settings }>
          <FontAwesomeIcon className="nav-icon" icon={ faImage }/>
          <span className="nav-text">Display</span>
        </NavLink>
        <NavLink activeClassName="active" className="nav-link"
                 to={ Routes.about }>
          <FontAwesomeIcon className="nav-icon" icon={ faInfoCircle }/>
          <span className="nav-text">About</span>
        </NavLink>
      </nav>
    </div>
  );
}
