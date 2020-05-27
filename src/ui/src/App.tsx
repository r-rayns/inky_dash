import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Routes } from './globals/routes';
import DisplaySettingsPage from './pages/display-settings/display-settings';
import Header from './components/header/header';
import ErrorPane from './components/error-pane/error-pane';
import AboutPage from './pages/about/about';

function App() {

  // https://www.happyhues.co/palettes/2
  return (
    <div className="app">
      <ErrorPane/>
      <Router>
        <Header/>
        <div className="content-wrapper">
          <div className="route-content">
            <Route
              exact
              path={ Routes.display_settings }
              component={ DisplaySettingsPage }
            >
            </Route>
            <Route
              exact
              path={ Routes.about }
              component={ AboutPage }
            >
            </Route>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
