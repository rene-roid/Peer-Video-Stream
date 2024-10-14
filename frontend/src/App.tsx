import React from 'react';
import Session from './components/Session';

const App: React.FC = () => {
  document.title = 'Peer Video Stream';
  return (
    <div className="app-container">
      <Session />
    </div>
  );  
};

export default App;