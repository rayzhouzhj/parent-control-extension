import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Popup from './components/Popup';
import Options from './components/Options';

function App() {
  return (
    <Router>
      <Route path="/popup" component={Popup} />
      <Route path="/options" component={Options} />
    </Router>
  );
}

export default App;