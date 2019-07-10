import React from 'react';
import { ToastContainer } from 'react-toastify';

import Routes from './routes';
import GlobalStyle from './styles/global';

function App() {
  return (
    <div className="App">
      <>
        <Routes />
        <GlobalStyle />
        <ToastContainer autoClose={3000} />
      </>
    </div>
  );
}

export default App;
