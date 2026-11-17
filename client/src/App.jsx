import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import PaperBackground from './components/PaperBackground.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import BookStacks from './components/BookStacks.jsx';
import LibraryShelves from './components/LibraryShelves.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import BookPage from './pages/BookPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LeaderPage from './pages/LeaderPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const path = useLocation().pathname;
  const onLibrary = path === '/library';
  const onMeetings = path === '/dashboard';
  return (
    <>
      <PaperBackground />
      {/* Book stacks only on My Meetings; shelves only on My Library; every other page keeps its own genre borders */}
      {onLibrary && <LibraryShelves />}
      {onMeetings && <BookStacks />}
      <Navbar />
      <main className={onLibrary || onMeetings ? 'page has-sides' : 'page'}>
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
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leader"
            element={
              <ProtectedRoute>
                <LeaderPage />
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
