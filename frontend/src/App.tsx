import React from 'react';
import Session from './components/Session';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1 className="app-title">Video Sync App</h1>
      <Session />
    </div>
  );  
};

export default App;