import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AIChatLayer from './components/AIChatLayer';

// Authentication & Core pages (fast start)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Lazy Loaded Student Pages
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const Subjects = lazy(() => import('./pages/Subjects'));
const SubjectDetail = lazy(() => import('./pages/SubjectDetail'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizTake = lazy(() => import('./pages/QuizTake'));
const Coding = lazy(() => import('./pages/Coding'));
const AITutor = lazy(() => import('./pages/AITutor'));
const Progress = lazy(() => import('./pages/Progress'));
const MLAnalytics = lazy(() => import('./pages/MLAnalytics'));
const Settings = lazy(() => import('./pages/Settings'));
const AIProfile = lazy(() => import('./pages/AIProfile'));
const QuestionBank = lazy(() => import('./pages/QuestionBank'));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant'));
const StudentOnboarding = lazy(() => import('./pages/StudentOnboarding'));

// Lazy Loaded DSA/Math Visualizer Pages
const StackVisualization = lazy(() => import('./pages/StackVisualization'));
const QueueVisualization = lazy(() => import('./pages/QueueVisualization'));
const LinkedListVisualization = lazy(() => import('./pages/LinkedListVisualization'));
const TreeVisualization = lazy(() => import('./pages/TreeVisualization'));
const GraphVisualization = lazy(() => import('./pages/GraphVisualization'));
const MathVisualization = lazy(() => import('./pages/MathVisualization'));
const ExecutionSimulator = lazy(() => import('./pages/ExecutionSimulator'));

// Lazy Loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));
const AdminQuizzes = lazy(() => import('./pages/admin/AdminQuizzes'));
const AdminDataset = lazy(() => import('./pages/admin/AdminDataset'));
const AdminML = lazy(() => import('./pages/admin/AdminML'));
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'));
const AdminApiSettings = lazy(() => import('./pages/admin/AdminApiSettings'));
const AdminSystemLogs = lazy(() => import('./pages/admin/AdminSystemLogs'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminAlerts = lazy(() => import('./pages/admin/AdminAlerts'));

// Other Components
const DBMSLab = lazy(() => import('./components/DBMSLab'));

function HomeRedirect() {
  const { user, loading, profileCompleted } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (!profileCompleted) return <Navigate to="/onboarding" />;
  return <Navigate to="/dashboard" />;
}

const PageLoader = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 rounded-full border-4 border-t-[#2563EB] border-[var(--db-sidebar-border)] animate-spin"></div>
    <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-widest animate-pulse">Loading Space...</span>
  </div>
);

export default function App() {
  const location = useLocation();

  return (
    <>
      <AIChatLayer />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/dsa/tree" element={<ProtectedRoute><TreeVisualization /></ProtectedRoute>} />
            <Route path="/dsa/graph" element={<ProtectedRoute><GraphVisualization /></ProtectedRoute>} />
            <Route path="/mathematics/numerical-methods" element={<ProtectedRoute><MathVisualization /></ProtectedRoute>} />
            <Route path="/dsa/stack/simulator" element={<ProtectedRoute><Layout><ExecutionSimulator /></Layout></ProtectedRoute>} />

            <Route path="/practice-hub" element={<ProtectedRoute><Layout><PracticeHub /></Layout></ProtectedRoute>} />

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
        </Suspense>
      </AnimatePresence>
    </>
  );
}
