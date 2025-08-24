import React, { useEffect } from 'react';
import { useAppDispatch } from './hooks/useRedux';
import { useAuthStatus } from './hooks/useRedux';
import { getMe } from '../slices/authSlice';
import { fetchNotifications } from '../slices/notificationSlice';
import { ThemeProvider } from './contexts/ThemeContext';

// Import organized routes
import AppRoutes from './routes/AppRoutes';

// App Initialization Component
const AppInitializer = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuthStatus();

  useEffect(() => {
    // Initialize app by checking authentication status
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Load notifications when user is authenticated
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [user, dispatch]);

  return children;
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AppInitializer>
        <div className="App">
          <AppRoutes />
        </div>
      </AppInitializer>
    </ThemeProvider>
  );
};

export default App;
