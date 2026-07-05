import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AIChatLayer from './components/AIChatLayer';
import { useVoiceAssistant } from './context/VoiceContext';
import toast from 'react-hot-toast';


// Authentication & Core pages (fast start)
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Lazy Loaded Student Pages
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const DailyGoals = lazy(() => import('./pages/dashboard/DailyGoals'));
const XPLevel = lazy(() => import('./pages/dashboard/XPLevel'));
const Streaks = lazy(() => import('./pages/dashboard/Streaks'));
const RecentActivity = lazy(() => import('./pages/dashboard/RecentActivity'));
const QuickContinue = lazy(() => import('./pages/dashboard/QuickContinue'));
const Subjects = lazy(() => import('./pages/Subjects'));
const SubjectDetail = lazy(() => import('./pages/SubjectDetail'));
const PracticeHub = lazy(() => import('./pages/PracticeHub'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizTake = lazy(() => import('./pages/QuizTake'));
const Coding = lazy(() => import('./pages/Coding'));
const AITutor = lazy(() => import('./pages/AITutor'));
const Progress = lazy(() => import('./pages/Progress'));
const Certificates = lazy(() => import('./pages/Certificates'));
const StudyReport = lazy(() => import('./pages/StudyReport'));
const MLAnalytics = lazy(() => import('./pages/MLAnalytics'));
const Settings = lazy(() => import('./pages/Settings'));
const AIProfile = lazy(() => import('./pages/AIProfile'));
const ChatLearn = lazy(() => import('./pages/ChatLearn'));
const QuestionBank = lazy(() => import('./pages/QuestionBank'));
const VoiceAssistant = lazy(() => import('./pages/VoiceAssistant'));
const StudentOnboarding = lazy(() => import('./pages/StudentOnboarding'));
const TypingQuest = lazy(() => import('./pages/TypingQuest'));
const CodingBattleSystem = lazy(() => import('./pages/CodingBattleSystem'));
const Community = lazy(() => import('./pages/Community'));
const CareerHub = lazy(() => import('./pages/CareerHub'));
// Python AI Learning Platform
const PythonLessonPage = lazy(() => import('./python/PythonLessonPage'));
// Advanced Java AI Learning Platform
const JavaLessonPage = lazy(() => import('./advanced-java/JavaLessonPage'));
// Core Java AI Learning Platform
const CoreJavaLessonPage = lazy(() => import('./core-java/CoreJavaLessonPage'));
// Web Dev AI Learning Platform
const WebDevLessonPage = lazy(() => import('./web-dev/WebDevLessonPage'));
// DSA AI Learning Platform
const DsaLessonPage = lazy(() => import('./dsa-theory/DsaLessonPage'));

// IT Suite pages
const ITSuiteDashboard = lazy(() => import('./pages/it-suite/ITSuiteDashboard'));
const WordEditor = lazy(() => import('./pages/it-suite/WordEditor'));
const ExcelSpreadsheet = lazy(() => import('./pages/it-suite/ExcelSpreadsheet'));
const SlidesEditor = lazy(() => import('./pages/it-suite/SlidesEditor'));
const AIPhotoToPDF = lazy(() => import('./pages/it-suite/AIPhotoToPDF'));
const FridayWebBuilder = lazy(() => import('./pages/it-suite/FridayWebBuilder.jsx'));

// Lazy Loaded DSA/Math Visualizer Pages
const StackVisualization = lazy(() => import('./pages/StackVisualization'));
const QueueVisualization = lazy(() => import('./pages/QueueVisualization'));
const LinkedListVisualization = lazy(() => import('./pages/LinkedListVisualization'));
const TreeVisualization = lazy(() => import('./pages/TreeVisualization'));
const GraphVisualization = lazy(() => import('./pages/GraphVisualization'));
const SortingVisualization = lazy(() => import('./pages/SortingVisualization'));
const SearchingVisualization = lazy(() => import('./pages/SearchingVisualization'));
const MathVisualization = lazy(() => import('./pages/MathVisualization'));
const CalculusVisualization = lazy(() => import('./pages/CalculusVisualization'));
const LinearAlgebraVisualization = lazy(() => import('./pages/LinearAlgebraVisualization'));
const ExecutionSimulator = lazy(() => import('./pages/ExecutionSimulator'));
const FocVisualization = lazy(() => import('./pages/FocVisualization'));
const TechVerse = lazy(() => import('./pages/TechVerse'));

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
const AdminPredictions = lazy(() => import('./pages/admin/AdminPredictions'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
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
  const { startListening, toggleEnabled, isEnabled } = useVoiceAssistant();



  return (
    <>
      <AIChatLayer />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname + location.hash}>
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/onboarding" element={<ProtectedRoute><StudentOnboarding /></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Overview /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/goals" element={<ProtectedRoute><Layout><DailyGoals /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/xp" element={<ProtectedRoute><Layout><XPLevel /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/streaks" element={<ProtectedRoute><Layout><Streaks /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/activity" element={<ProtectedRoute><Layout><RecentActivity /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/continue" element={<ProtectedRoute><Layout><QuickContinue /></Layout></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>} />
            <Route path="/subjects/:id" element={<ProtectedRoute><Layout><SubjectDetail /></Layout></ProtectedRoute>} />
            
            {/* New Prototype Routes */}
            <Route path="/dsa/stack" element={<ProtectedRoute><StackVisualization /></ProtectedRoute>} />
            <Route path="/dsa/queue" element={<ProtectedRoute><QueueVisualization /></ProtectedRoute>} />
            <Route path="/dsa/linked-list" element={<ProtectedRoute><LinkedListVisualization /></ProtectedRoute>} />
            <Route path="/dsa/sorting" element={<ProtectedRoute><SortingVisualization /></ProtectedRoute>} />
            <Route path="/dsa/searching" element={<ProtectedRoute><SearchingVisualization /></ProtectedRoute>} />
            <Route path="/dsa/tree" element={<ProtectedRoute><TreeVisualization /></ProtectedRoute>} />
            <Route path="/dsa/graph" element={<ProtectedRoute><GraphVisualization /></ProtectedRoute>} />
            <Route path="/mathematics/numerical-methods" element={<ProtectedRoute><MathVisualization /></ProtectedRoute>} />
            <Route path="/mathematics/calculus" element={<ProtectedRoute><CalculusVisualization /></ProtectedRoute>} />
            <Route path="/mathematics/linear-algebra" element={<ProtectedRoute><LinearAlgebraVisualization /></ProtectedRoute>} />
            <Route path="/dsa/stack/simulator" element={<ProtectedRoute><Layout><ExecutionSimulator /></Layout></ProtectedRoute>} />
            <Route path="/foc" element={<ProtectedRoute><Layout><FocVisualization /></Layout></ProtectedRoute>} />
            <Route path="/techverse" element={<ProtectedRoute><Layout><TechVerse /></Layout></ProtectedRoute>} />

            <Route path="/practice-hub" element={<ProtectedRoute><Layout><PracticeHub /></Layout></ProtectedRoute>} />

            <Route path="/quizzes" element={<ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>} />
            <Route path="/quizzes/:id" element={<ProtectedRoute><Layout><QuizTake /></Layout></ProtectedRoute>} />
            <Route path="/coding" element={<ProtectedRoute><Layout><Coding /></Layout></ProtectedRoute>} />
            <Route path="/dbms-lab" element={<ProtectedRoute><Layout><DBMSLab /></Layout></ProtectedRoute>} />
            <Route path="/ai-tutor" element={<ProtectedRoute><Layout><AITutor /></Layout></ProtectedRoute>} />
            <Route path="/chat-learn" element={<ProtectedRoute><Layout><ChatLearn /></Layout></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>} />
            <Route path="/study-report" element={<ProtectedRoute><Layout><StudyReport /></Layout></ProtectedRoute>} />
            <Route path="/ml-analytics" element={<ProtectedRoute><Layout><MLAnalytics /></Layout></ProtectedRoute>} />
            <Route path="/ai-profile" element={<ProtectedRoute><Layout><AIProfile /></Layout></ProtectedRoute>} />
            <Route path="/question-bank" element={<ProtectedRoute><Layout><QuestionBank /></Layout></ProtectedRoute>} />
            <Route path="/voice-assistant" element={<ProtectedRoute><Layout><VoiceAssistant /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
            <Route path="/typing-quest" element={<ProtectedRoute><Layout><TypingQuest /></Layout></ProtectedRoute>} />
            <Route path="/coding-battle" element={<ProtectedRoute><Layout><CodingBattleSystem /></Layout></ProtectedRoute>} />

            {/* Career Hub & Community */}
            <Route path="/career-hub" element={<ProtectedRoute><Layout><CareerHub /></Layout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />

            {/* Python AI Learning Platform */}
            <Route path="/python/course/:lessonSlug" element={<ProtectedRoute><Layout><PythonLessonPage /></Layout></ProtectedRoute>} />

            {/* Core Java AI Learning Platform */}
            <Route path="/core-java/course/:lessonSlug" element={<ProtectedRoute><Layout><CoreJavaLessonPage /></Layout></ProtectedRoute>} />

            {/* Web Dev AI Learning Platform */}
            <Route path="/web-dev/course/:lessonSlug" element={<ProtectedRoute><Layout><WebDevLessonPage /></Layout></ProtectedRoute>} />

            {/* Advanced Java AI Learning Platform */}
            <Route path="/advanced-java/course/:lessonSlug" element={<ProtectedRoute><Layout><JavaLessonPage /></Layout></ProtectedRoute>} />

            {/* DSA AI Learning Platform */}
            <Route path="/dsa/course/:lessonSlug" element={<ProtectedRoute><Layout><DsaLessonPage /></Layout></ProtectedRoute>} />

            {/* IT Suite Routes */}
            <Route path="/it-suite" element={<ProtectedRoute><Layout><ITSuiteDashboard /></Layout></ProtectedRoute>} />
            <Route path="/it-suite/word/:id" element={<ProtectedRoute><Layout><WordEditor /></Layout></ProtectedRoute>} />
            <Route path="/it-suite/excel/:id" element={<ProtectedRoute><Layout><ExcelSpreadsheet /></Layout></ProtectedRoute>} />
            <Route path="/it-suite/slides/:id" element={<ProtectedRoute><Layout><SlidesEditor /></Layout></ProtectedRoute>} />
            <Route path="/it-suite/photo-to-pdf" element={<ProtectedRoute><Layout><AIPhotoToPDF /></Layout></ProtectedRoute>} />
            <Route path="/it-suite/friday-builder" element={<ProtectedRoute><Layout><FridayWebBuilder /></Layout></ProtectedRoute>} />

            {/* DSA index route — redirect to first visualizer */}
            <Route path="/dsa" element={<Navigate to="/dsa/stack" replace />} />
            <Route path="/dsa/sorting" element={<ProtectedRoute><SortingVisualization /></ProtectedRoute>} />
            <Route path="/dsa/pathfinding" element={<ProtectedRoute><Layout><Overview /></Layout></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute adminOnly><Layout><AdminStudents /></Layout></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute adminOnly><Layout><AdminContent /></Layout></ProtectedRoute>} />
            <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly><Layout><AdminQuizzes /></Layout></ProtectedRoute>} />
            <Route path="/admin/dataset" element={<ProtectedRoute adminOnly><Layout><AdminDataset /></Layout></ProtectedRoute>} />
            <Route path="/admin/ml" element={<ProtectedRoute adminOnly><Layout><AdminML /></Layout></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute adminOnly><Layout><AdminQuestions /></Layout></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute adminOnly><Layout><AdminSystemLogs /></Layout></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><Layout><AdminAnalytics /></Layout></ProtectedRoute>} />
            <Route path="/admin/alerts" element={<ProtectedRoute adminOnly><Layout><AdminAlerts /></Layout></ProtectedRoute>} />
            <Route path="/admin/predictions" element={<ProtectedRoute adminOnly><Layout><AdminPredictions /></Layout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><Layout><AdminSettings /></Layout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}
