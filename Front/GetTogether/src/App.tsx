import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext/AuthContext';

import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import Event from './pages/Event/Event';
import Organizer from './pages/Organizer/Organizer';
import Cabinet from './pages/Cabinet/Cabinet';
import Login from './pages/Login/Login';
import NotFound from './pages/NotFound/NotFound';
import Admin from './pages/Admin/Admin';
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<Event />} />
        <Route path="/organizer/:id" element={<Organizer />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Обработка несуществующих маршрутов */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;