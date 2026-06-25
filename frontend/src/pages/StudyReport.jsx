import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Award, TrendingUp, BarChart2, Zap, Calendar, Clock, Download, FileText, CheckSquare, Brain, Compass, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/study-report');
      setReport(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load study analytics report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-violet-500 border-slate-700 animate-spin"></div>
        <span className="text-xs font-bold text-slate-400 tracking-wider">Compiling Analytics Data...</span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 space-y-6 premium-dark-page" style={{ backgroundColor: '#050B2D' }}>
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="text-left">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">STUDY PROGRESS REPORT</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Your Learning Journey Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Report Generated: <strong>{new Date().toLocaleDateString('en-GB')}</strong></span>
          <button
            onClick={handlePrintReport}
            className="py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: Profile card & AI Readiness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 card-glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border-2 border-white flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
              {report.student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{report.student.name}</h2>
              <span className="text-xs text-slate-400">Student ID: {report.student.id}</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Current Level</span>
              <span className="text-lg font-extrabold text-violet-400">{report.student.currentLevel} (Advanced)</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">XP Earned</span>
              <span className="text-lg font-extrabold text-indigo-400">{report.student.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Streak Days</span>
              <span className="text-lg font-extrabold text-amber-500">{report.student.streakDays} Days</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Study Hours</span>
              <span className="text-lg font-extrabold text-emerald-400">{report.student.studyHours} hrs</span>
            </div>
          </div>
        </div>

        {/* AI Readiness Score */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">AI Readiness Score</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#purpleGrad)" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - report.student.aiReadinessScore / 100)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{report.student.aiReadinessScore}%</span>
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-1">Readiness</span>
            </div>
          </div>
          <span className="mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
            ● Excellent Status
          </span>
        </div>
      </div>

      {/* Row 2: Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-glass p-4 rounded-2xl border border-white/10 text-left space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Overall Progress</span>
          <div className="text-2xl font-black text-white">{report.performance.overallProgress}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: `${report.performance.overallProgress}%` }} />
          </div>
        </div>

        <div className="card-glass p-4 rounded-2xl border border-white/10 text-left space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Average Quiz Score</span>
          <div className="text-2xl font-black text-indigo-400">{report.performance.avgQuizScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${report.performance.avgQuizScore}%` }} />
          </div>
        </div>

        <div className="card-glass p-4 rounded-2xl border border-white/10 text-left space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Practice Completion</span>
          <div className="text-2xl font-black text-emerald-400">{report.performance.practiceCompletion}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${report.performance.practiceCompletion}%` }} />
          </div>
        </div>

        <div className="card-glass p-4 rounded-2xl border border-white/10 text-left space-y-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Coding Labs Performance</span>
          <div className="text-2xl font-black text-amber-500">{report.performance.codingPerformance}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${report.performance.codingPerformance}%` }} />
          </div>
        </div>

        <div className="card-glass p-4 rounded-2xl border border-white/10 text-left space-y-2 col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Consistency Score</span>
          <div className="text-2xl font-black text-teal-400">{report.performance.consistencyScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500" style={{ width: `${report.performance.consistencyScore}%` }} />
          </div>
        </div>
      </div>

      {/* Row 3: Subject Performance table & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table */}
        <div className="lg:col-span-2 card-glass p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-left text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-violet-400" />
            <span>Subject-wise Mastery Level</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-3 pt-1">Subject</th>
                  <th className="pb-3 pt-1 text-center">Progress %</th>
                  <th className="pb-3 pt-1 text-center">Accuracy %</th>
                  <th className="pb-3 pt-1 text-center">Time Spent</th>
                  <th className="pb-3 pt-1 text-center">Mastery Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {report.subjectPerformance.map((sp, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-4 font-semibold text-slate-200">{sp.subject}</td>
                    <td className="py-4 text-center">
                      <span className="block font-bold">{sp.progress}%</span>
                      <div className="w-16 bg-slate-800 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${sp.progress}%` }} />
                      </div>
                    </td>
                    <td className="py-4 text-center text-indigo-300 font-bold">{sp.accuracy}%</td>
                    <td className="py-4 text-center text-slate-400 font-medium">{sp.timeSpent}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        sp.mastery === 'Expert' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        sp.mastery === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-slate-500/10 border-slate-500/30 text-slate-400'
                      }`}>
                        {sp.mastery}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Trend Graph */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between text-left space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Performance Trends</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Dynamic weekly score progression.</p>
          </div>

          {/* Simple Vector Graph */}
          <div className="h-32 w-full flex items-end justify-between relative px-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-white/5 h-[1px]"></div>
              <div className="w-full border-b border-white/5 h-[1px]"></div>
              <div className="w-full border-b border-white/5 h-[1px]"></div>
            </div>
            
            {/* Vector path lines representation */}
            <div className="absolute inset-x-0 bottom-0 h-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                <path 
                  d="M 5 45 Q 25 35 45 25 T 85 10" 
                  fill="none" 
                  stroke="#8B5CF6" 
                  strokeWidth="2" 
                />
                <circle cx="5" cy="45" r="1.5" fill="#8B5CF6" />
                <circle cx="45" cy="25" r="1.5" fill="#8B5CF6" />
                <circle cx="85" cy="10" r="1.5" fill="#8B5CF6" />
              </svg>
            </div>

            <div className="text-[9px] text-slate-500 font-bold z-10 w-full flex justify-between absolute bottom-[-20px] left-0 px-2">
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
              <span>Wk 5</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Quizzes</span>
              <span className="text-lg font-black text-white">56 Done</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Coding Tasks</span>
              <span className="text-lg font-black text-indigo-400">24 Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: AI Insights & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Insights */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 text-left space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span>AI Analytical Coach Insights</span>
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Strengths</span>
              <ul className="space-y-1.5 mt-1.5 text-xs text-slate-300">
                {report.insights.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✔</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Areas to Improve</span>
              <ul className="space-y-1.5 mt-1.5 text-xs text-slate-300">
                {report.insights.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">●</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-xs leading-relaxed text-violet-300">
              <strong>💡 recommendation:</strong> {report.insights.recommendation}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 text-left space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Earned Achievements & Badges</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xs font-bold text-slate-100 block">30 Day Streak</span>
              <span className="text-[9px] text-slate-500">Unstoppable learner</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2">
              <span className="text-2xl">⚔</span>
              <span className="text-xs font-bold text-slate-100 block">DSA Expert</span>
              <span className="text-[9px] text-slate-500">Algorithms Master</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2">
              <span className="text-2xl">🏆</span>
              <span className="text-xs font-bold text-slate-100 block">Quiz Champion</span>
              <span className="text-[9px] text-slate-500">Perfect mock quiz runs</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2">
              <span className="text-2xl">🛡</span>
              <span className="text-xs font-bold text-slate-100 block">Coding Warrior</span>
              <span className="text-[9px] text-slate-500">20+ coding submissions</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xs font-bold text-slate-100 block">Quick Learner</span>
              <span className="text-[9px] text-slate-500">Weekly login consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Predictions & study plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Predictions */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 text-left space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <span>Placement & Career readiness Forecast</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Placement Eligibility Score</span>
                <span className="text-emerald-400">{report.predictions.placementReadiness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${report.predictions.placementReadiness}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Mock Interview Readiness</span>
                <span className="text-indigo-400">{report.predictions.interviewReadiness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${report.predictions.interviewReadiness}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Applied Skill Index</span>
                <span className="text-violet-400">{report.predictions.skillReadiness}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500" style={{ width: `${report.predictions.skillReadiness}%` }} />
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-slate-400">
              💡 Forecast prediction model shows a possible score of <strong>{report.predictions.forecastScore}%</strong> next week if streak consistency is maintained.
            </div>
          </div>
        </div>

        {/* Personalized study plan */}
        <div className="card-glass p-6 rounded-3xl border border-white/10 text-left space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Dynamic Study Plan Checklist (7 Days)</span>
          </h3>

          <div className="space-y-2.5">
            {report.personalizedPlan.map((plan, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  plan.done ? 'bg-emerald-500 text-white' : 'border border-slate-500 text-transparent'
                }`}>
                  {plan.done && '✓'}
                </span>
                <span className={`text-xs font-semibold ${plan.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {plan.task}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          HIDDEN PRINT SECTION (5-Page Corporate PDF)
          ========================================== */}
      <div id="corporate-report-print" className="hidden-print-container hidden text-slate-900 bg-white p-8 space-y-12 text-left" style={{ fontFamily: 'Georgia, serif' }}>
        
        {/* PAGE 1: EXECUTIVE SUMMARY */}
        <div className="print-page space-y-8 h-[980px] flex flex-col justify-between pb-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b-2 border-indigo-900 pb-4">
              <div>
                <span className="text-sm font-bold text-indigo-900 tracking-wider">EDUVERSE AI</span>
                <h1 className="text-3xl font-extrabold">EXECUTIVE PERFORMANCE REPORT</h1>
              </div>
              <span className="text-xs text-slate-500 font-bold">{new Date().toLocaleDateString()}</span>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border">
              <h2 className="text-xl font-bold border-b pb-2 text-indigo-900">Student Profile Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Student Name:</strong> {report.student.name}</div>
                <div><strong>Student Account ID:</strong> {report.student.id}</div>
                <div><strong>Total XP Gained:</strong> {report.student.totalXP}</div>
                <div><strong>Active Learning Time:</strong> {report.student.studyHours} hours</div>
                <div><strong>Learning Streaks:</strong> {report.student.streakDays} consecutive days</div>
                <div><strong>AI Readiness Score:</strong> {report.student.aiReadinessScore}%</div>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-sm leading-relaxed text-slate-700">
              <h2 className="text-xl font-bold text-indigo-900 border-b pb-2">1. Executive Summary</h2>
              <p>This comprehensive performance analytical report is generated dynamically by the EduVerse AI Analytics Engine. It analyzes the student’s activities, database interaction, coding lab executions, and quiz answer registries to establish progress trends and career placement forecasts.</p>
              <p>The student shows an active mastery status with an overall platform progress of <strong>{report.performance.overallProgress}%</strong>. Academic performance metrics are highly optimal, demonstrating an average quiz score of <strong>{report.performance.avgQuizScore}%</strong> and coding solution accuracy of <strong>{report.performance.codingPerformance}%</strong>.</p>
            </div>
          </div>

          {/* Footer page 1 */}
          <div className="flex justify-between items-center border-t pt-4 text-[10px] text-slate-400 font-bold">
            <span>EduVerse AI Academy — Confidential</span>
            <span>Page 1 of 5</span>
          </div>
        </div>

        {/* PAGE 2: PERFORMANCE ANALYTICS */}
        <div className="print-page space-y-8 h-[980px] flex flex-col justify-between pb-8">
          <div className="space-y-6">
            <div className="border-b-2 border-indigo-900 pb-4">
              <span className="text-xs font-bold text-slate-400 block tracking-widest">SECTION 2</span>
              <h2 className="text-2xl font-bold">ACADEMIC PERFORMANCE METRICS</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-xl bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500">Overall Progress</span>
                <span className="block text-2xl font-black mt-1 text-slate-800">{report.performance.overallProgress}%</span>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500">Avg Quiz Accuracy</span>
                <span className="block text-2xl font-black mt-1 text-slate-800">{report.performance.avgQuizScore}%</span>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500">Practice Completed</span>
                <span className="block text-2xl font-black mt-1 text-slate-800">{report.performance.practiceCompletion}%</span>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-slate-700 pt-4">
              <h3 className="text-lg font-bold text-indigo-900 border-b pb-1">Performance Overview</h3>
              <p>Statistical indicators verify that the student maintains a highly consistent schedule. Daily coding practices are well above average, which corresponds directly to the elevated consistency metric of <strong>{report.performance.consistencyScore}%</strong>.</p>
              <p>Quiz compliance remains at O(1) latency with scores centering around <strong>{report.performance.avgQuizScore}%</strong>. The dynamic learning pathway will continue to feed structured revision schedules to solidify theoretical fundamentals.</p>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 text-[10px] text-slate-400 font-bold">
            <span>EduVerse AI Academy — Performance Report</span>
            <span>Page 2 of 5</span>
          </div>
        </div>

        {/* PAGE 3: SUBJECT ANALYSIS */}
        <div className="print-page space-y-8 h-[980px] flex flex-col justify-between pb-8">
          <div className="space-y-6">
            <div className="border-b-2 border-indigo-900 pb-4">
              <span className="text-xs font-bold text-slate-400 block tracking-widest">SECTION 3</span>
              <h2 className="text-2xl font-bold">CURRICULUM SUBJECT ANALYSIS</h2>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-2">Subject Name</th>
                  <th className="py-2 text-center">Progress</th>
                  <th className="py-2 text-center">Quiz Accuracy</th>
                  <th className="py-2 text-center">Duration</th>
                  <th className="py-2 text-center">Mastery Level</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {report.subjectPerformance.map((sp, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-semibold">{sp.subject}</td>
                    <td className="py-3 text-center">{sp.progress}%</td>
                    <td className="py-3 text-center">{sp.accuracy}%</td>
                    <td className="py-3 text-center">{sp.timeSpent}</td>
                    <td className="py-3 text-center font-bold">{sp.mastery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center border-t pt-4 text-[10px] text-slate-400 font-bold">
            <span>EduVerse AI Academy — Curriculum Analysis</span>
            <span>Page 3 of 5</span>
          </div>
        </div>

        {/* PAGE 4: AI INSIGHTS */}
        <div className="print-page space-y-8 h-[980px] flex flex-col justify-between pb-8">
          <div className="space-y-6">
            <div className="border-b-2 border-indigo-900 pb-4">
              <span className="text-xs font-bold text-slate-400 block tracking-widest">SECTION 4</span>
              <h2 className="text-2xl font-bold">AI ANALYTICS & INSIGHTS</h2>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h3 className="font-bold text-indigo-900 text-base">Verified Strengths</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {report.insights.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                </ul>
              </div>

              <div className="pt-4">
                <h3 className="font-bold text-indigo-900 text-base">Identified Weaknesses</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {report.insights.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl mt-4 italic text-indigo-950 font-semibold">
                Coach Recommendation: "{report.insights.recommendation}"
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 text-[10px] text-slate-400 font-bold">
            <span>EduVerse AI Academy — AI Coach</span>
            <span>Page 4 of 5</span>
          </div>
        </div>

        {/* PAGE 5: FUTURE PREDICTIONS & STUDY PLAN */}
        <div className="print-page space-y-8 h-[980px] flex flex-col justify-between pb-8">
          <div className="space-y-6">
            <div className="border-b-2 border-indigo-900 pb-4">
              <span className="text-xs font-bold text-slate-400 block tracking-widest">SECTION 5</span>
              <h2 className="text-2xl font-bold">PREDICTIONS & 7-DAY STUDY PLAN</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
              <div className="p-3 border rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-500 text-xs">Placement Index</span>
                <span className="block font-black text-xl text-indigo-900 mt-1">{report.predictions.placementReadiness}%</span>
              </div>
              <div className="p-3 border rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-500 text-xs">Interview Index</span>
                <span className="block font-black text-xl text-indigo-900 mt-1">{report.predictions.interviewReadiness}%</span>
              </div>
              <div className="p-3 border rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-500 text-xs">Skill Index</span>
                <span className="block font-black text-xl text-indigo-900 mt-1">{report.predictions.skillReadiness}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold text-indigo-900 border-b pb-1">Weekly Task Schedules</h3>
              <div className="space-y-2 text-xs text-slate-700">
                {report.personalizedPlan.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                    <span>{p.done ? '☑' : '☐'}</span>
                    <span className={p.done ? 'line-through text-slate-400' : 'font-bold'}>{p.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 text-[10px] text-slate-400 font-bold">
            <span>EduVerse AI Academy — predictions</span>
            <span>Page 5 of 5</span>
          </div>
        </div>

      </div>

      {/* Global CSS to support clean printing of multi-page report & premium dark overrides */}
      <style>{`
        @media screen {
          .hidden-print-container {
            display: none !important;
          }
          
          /* Scoped premium dark theme overrides to override light-theme leakage */
          .premium-dark-page {
            background-color: #050B2D !important;
            color: #F8FAFC !important;
          }
          .premium-dark-page .card-glass {
            background: rgba(255, 255, 255, 0.03) !important;
            backdrop-filter: blur(16px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 24px !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35) !important;
            color: #F8FAFC !important;
          }
          .premium-dark-page .card-glass:hover {
            border-color: rgba(255, 255, 255, 0.15) !important;
            background: rgba(255, 255, 255, 0.05) !important;
          }
          .premium-dark-page h1,
          .premium-dark-page h2,
          .premium-dark-page h3,
          .premium-dark-page h4,
          .premium-dark-page h5,
          .premium-dark-page h6 {
            color: #FFFFFF !important;
          }
          .premium-dark-page .text-white {
            color: #FFFFFF !important;
          }
          .premium-dark-page .text-slate-100 {
            color: #F8FAFC !important;
          }
          .premium-dark-page .text-slate-200 {
            color: #E2E8F0 !important;
          }
          .premium-dark-page .text-slate-300 {
            color: #CBD5E1 !important;
          }
          .premium-dark-page .text-slate-400 {
            color: #94A3B8 !important;
          }
          .premium-dark-page .text-violet-400 {
            color: #A78BFA !important;
          }
          .premium-dark-page .text-indigo-400 {
            color: #818CF8 !important;
          }
          .premium-dark-page .text-emerald-400 {
            color: #34D399 !important;
          }
          .premium-dark-page .text-amber-500 {
            color: #F59E0B !important;
          }
          .premium-dark-page .text-teal-400 {
            color: #2DD4BF !important;
          }
          .premium-dark-page table th {
            color: #94A3B8 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          }
          .premium-dark-page table td {
            color: #F8FAFC !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
          }
          .premium-dark-page table tr:hover {
            background-color: rgba(255, 255, 255, 0.02) !important;
          }
          .premium-dark-page .border-white\/10 {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
          .premium-dark-page .border-white\/5 {
            border-color: rgba(255, 255, 255, 0.04) !important;
          }
          .premium-dark-page .bg-white\/5 {
            background-color: rgba(255, 255, 255, 0.03) !important;
          }
          .premium-dark-page .border-white\/10 {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #corporate-report-print, #corporate-report-print * {
            visibility: visible;
            box-shadow: none !important;
          }
          #corporate-report-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
            color: #000000 !important;
          }
          .print-page {
            page-break-before: always;
            page-break-after: always;
            page-break-inside: avoid;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-page:first-of-type {
            page-break-before: avoid;
          }
        }
      `}</style>
    </div>
  );
}
