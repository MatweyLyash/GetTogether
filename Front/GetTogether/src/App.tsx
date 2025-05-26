import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext/AuthContext';
import {Text, Box} from '@chakra-ui/react';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import Event from './pages/Event/Event';
import Organizer from './pages/Organizer/Organizer';
import Cabinet from './pages/Cabinet/Cabinet';
import Login from './pages/Login/Login';
import NotFound from './pages/NotFound/NotFound';
import Admin from './pages/Admin/Admin';

function ProtectedRoute() {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('ProtectedRoute: Проверка', { isLoading, isAuthenticated, user });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Text>Загрузка...</Text>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Перенаправление на /login');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/organizer/:id" element={<Organizer />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;