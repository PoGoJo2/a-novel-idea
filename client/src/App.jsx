import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import PaperBackground from './components/PaperBackground.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import BookPage from './pages/BookPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <>
      <PaperBackground />
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/books/:id" element={<BookPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <AiAssistant />
    </>
  );
}
