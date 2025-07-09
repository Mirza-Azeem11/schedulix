import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './pages/layout/Layout.jsx';
import AppRoutes from './routes/AppRoutes'; // adjust path as needed

function App() {
  return (
      <ThemeProvider>
        {/*<Layout />*/}
          <AppRoutes />

      </ThemeProvider>
  );
}

export default App;