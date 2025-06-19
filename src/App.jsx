import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/layout/Layout.jsx';

function App() {
  return (
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
  );
}

export default App;