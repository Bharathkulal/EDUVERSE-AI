import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Quizzes from './pages/Quizzes';
import QuizTake from './pages/QuizTake';
import Coding from './pages/Coding';
import AITutor from './pages/AITutor';
import Progress from './pages/Progress';
import MLAnalytics from './pages/MLAnalytics';
import Settings from './pages/Settings';
import AdminStudents from './pages/admin/AdminStudents';
import AdminContent from './pages/admin/AdminContent';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminDataset from './pages/admin/AdminDataset';
import AdminML from './pages/admin/AdminML';
import StudentOnboarding from './pages/StudentOnboarding';
import AIProfile from './pages/AIProfile';
import QuestionBank from './pages/QuestionBank';
import AdminQuestions from './pages/admin/AdminQuestions';

function HomeRedirect() {
  const { user, loading, profileCompleted } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (!profileCompleted) return <Navigate to="/onboarding" />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/onboarding" element={<ProtectedRoute><StudentOnboarding /></ProtectedRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>} />
      <Route path="/subjects/:id" element={<ProtectedRoute><Layout><SubjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>} />
      <Route path="/quizzes/:id" element={<ProtectedRoute><Layout><QuizTake /></Layout></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute><Layout><Coding /></Layout></ProtectedRoute>} />
      <Route path="/ai-tutor" element={<ProtectedRoute><Layout><AITutor /></Layout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
      <Route path="/ml-analytics" element={<ProtectedRoute><Layout><MLAnalytics /></Layout></ProtectedRoute>} />
      <Route path="/ai-profile" element={<ProtectedRoute><Layout><AIProfile /></Layout></ProtectedRoute>} />
      <Route path="/question-bank" element={<ProtectedRoute><Layout><QuestionBank /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute adminOnly><Layout><AdminStudents /></Layout></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute adminOnly><Layout><AdminContent /></Layout></ProtectedRoute>} />
      <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly><Layout><AdminQuizzes /></Layout></ProtectedRoute>} />
      <Route path="/admin/dataset" element={<ProtectedRoute adminOnly><Layout><AdminDataset /></Layout></ProtectedRoute>} />
      <Route path="/admin/ml" element={<ProtectedRoute adminOnly><Layout><AdminML /></Layout></ProtectedRoute>} />
      <Route path="/admin/questions" element={<ProtectedRoute adminOnly><Layout><AdminQuestions /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

