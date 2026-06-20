import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AIChatLayer from './components/AIChatLayer';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import StackVisualization from './pages/StackVisualization';
import QueueVisualization from './pages/QueueVisualization';
import MathVisualization from './pages/MathVisualization';
import LinkedListVisualization from './pages/LinkedListVisualization';
import ExecutionSimulator from './pages/ExecutionSimulator';
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
import VoiceAssistant from './pages/VoiceAssistant';
import AdminApiSettings from './pages/admin/AdminApiSettings';
import AdminSystemLogs from './pages/admin/AdminSystemLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';
import DBMSLab from './components/DBMSLab';

function HomeRedirect() {
  const { user, loading, profileCompleted } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (!profileCompleted) return <Navigate to="/onboarding" />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <AIChatLayer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route path="/onboarding" element={<ProtectedRoute><StudentOnboarding /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>} />
          <Route path="/subjects/:id" element={<ProtectedRoute><Layout><SubjectDetail /></Layout></ProtectedRoute>} />
          
          {/* New Prototype Routes */}
          <Route path="/dsa/stack" element={<ProtectedRoute><StackVisualization /></ProtectedRoute>} />
          <Route path="/dsa/queue" element={<ProtectedRoute><QueueVisualization /></ProtectedRoute>} />
          <Route path="/dsa/linked-list" element={<ProtectedRoute><LinkedListVisualization /></ProtectedRoute>} />
          <Route path="/mathematics/numerical-methods" element={<ProtectedRoute><MathVisualization /></ProtectedRoute>} />
          <Route path="/dsa/stack/simulator" element={<ProtectedRoute><Layout><ExecutionSimulator /></Layout></ProtectedRoute>} />

          <Route path="/quizzes" element={<ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>} />
          <Route path="/quizzes/:id" element={<ProtectedRoute><Layout><QuizTake /></Layout></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><Layout><Coding /></Layout></ProtectedRoute>} />
          <Route path="/dbms-lab" element={<ProtectedRoute><Layout><DBMSLab /></Layout></ProtectedRoute>} />
          <Route path="/ai-tutor" element={<ProtectedRoute><Layout><AITutor /></Layout></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
          <Route path="/ml-analytics" element={<ProtectedRoute><Layout><MLAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/ai-profile" element={<ProtectedRoute><Layout><AIProfile /></Layout></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><Layout><QuestionBank /></Layout></ProtectedRoute>} />
          <Route path="/voice-assistant" element={<ProtectedRoute><Layout><VoiceAssistant /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><Layout><AdminStudents /></Layout></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute adminOnly><Layout><AdminContent /></Layout></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly><Layout><AdminQuizzes /></Layout></ProtectedRoute>} />
          <Route path="/admin/dataset" element={<ProtectedRoute adminOnly><Layout><AdminDataset /></Layout></ProtectedRoute>} />
          <Route path="/admin/ml" element={<ProtectedRoute adminOnly><Layout><AdminML /></Layout></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute adminOnly><Layout><AdminQuestions /></Layout></ProtectedRoute>} />
          <Route path="/admin/api-settings" element={<ProtectedRoute adminOnly><Layout><AdminApiSettings /></Layout></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute adminOnly><Layout><AdminSystemLogs /></Layout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><Layout><AdminAnalytics /></Layout></ProtectedRoute>} />
          <Route path="/admin/alerts" element={<ProtectedRoute adminOnly><Layout><AdminAlerts /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
