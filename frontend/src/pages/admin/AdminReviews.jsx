import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, RefreshCw, Eye, Trash2, Brain,
  FileSpreadsheet, FileJson, FileText, Star, TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

const SENTIMENT_COLORS = {
  'Positive': '#10B981', // emerald
  'Neutral': '#3B82F6',  // blue
  'Negative': '#EF4444'  // red
};

const CATEGORY_COLORS = [
  '#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1'
];

export default function AdminReviews() {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterBrowser, setFilterBrowser] = useState('');
  const [filterOS, setFilterOS] = useState('');
  const [filterDevice, setFilterDevice] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  // Modal detail view
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Unique list of filter choices retrieved from list
  const [countries, setCountries] = useState([]);
  const [browsers, setBrowsers] = useState([]);
  const [oss, setOss] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [page, filterRating, filterCountry, filterBrowser, filterOS, filterDevice, filterStatus, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/reviews/admin/stats');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load review stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = `/reviews/admin?page=${page}&limit=10&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (filterRating) query += `&rating=${filterRating}`;
      if (filterCountry) query += `&country=${filterCountry}`;
      if (filterBrowser) query += `&browser=${filterBrowser}`;
      if (filterOS) query += `&os=${filterOS}`;
      if (filterDevice) query += `&deviceType=${filterDevice}`;
      if (filterStatus) query += `&status=${filterStatus}`;

      const { data } = await api.get(query);
      setReviews(data.reviews);
      setPagination(data.pagination);

      // Dynamically populate filter lists from data if first load
      if (countries.length === 0 && data.reviews.length > 0) {
        const uniqueCountries = [...new Set(data.reviews.map(r => r.country).filter(Boolean))];
        const uniqueBrowsers = [...new Set(data.reviews.map(r => r.browser).filter(Boolean))];
        const uniqueOss = [...new Set(data.reviews.map(r => r.operating_system).filter(Boolean))];
        const uniqueDevices = [...new Set(data.reviews.map(r => r.device_type).filter(Boolean))];

        setCountries(uniqueCountries);
        setBrowsers(uniqueBrowsers);
        setOss(uniqueOss);
        setDevices(uniqueDevices);
      }
    } catch (err) {
      toast.error('Failed to query reviews list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const resetFilters = () => {
    setSearch('');
    setFilterRating('');
    setFilterCountry('');
    setFilterBrowser('');
    setFilterOS('');
    setFilterDevice('');
    setFilterStatus('active');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  const handleOpenDetail = async (id) => {
    try {
      setShowModal(true);
      setModalLoading(true);
      const { data } = await api.get(`/reviews/admin/${id}`);
      setSelectedReview(data);
    } catch (err) {
      toast.error('Failed to load review details');
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleReanalyzeAI = async (id) => {
    try {
      setModalLoading(true);
      const { data } = await api.post(`/reviews/admin/${id}/reanalyze`);
      setSelectedReview(data.review);
      toast.success('AI re-analysis completed');
      // Refresh statistics and listing
      fetchStats();
      fetchReviews();
    } catch (err) {
      toast.error('AI analysis failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/admin/${id}`);
      toast.success('Review deleted successfully');
      setShowModal(false);
      fetchStats();
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  // Exports
  const handleExportCSV = async () => {
    try {
      window.open(`${api.defaults.baseURL}/reviews/admin/export?format=csv`, '_blank');
      toast.success('CSV export started');
    } catch (err) {
      toast.error('CSV export failed');
    }
  };

  const handleExportJSON = async () => {
    try {
      window.open(`${api.defaults.baseURL}/reviews/admin/export?format=json`, '_blank');
      toast.success('JSON export started');
    } catch (err) {
      toast.error('JSON export failed');
    }
  };

  const handleExportPDF = () => {
    if (reviews.length === 0) {
      toast.error('No review data available to export');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('EDUVERSE AI - Reviews Audit Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Total count: ${pagination.total}`, 14, 26);
      
      let y = 35;
      reviews.forEach((r, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${index + 1}. ${r.user_name} (${r.email}) - Rating: ${r.rating}/5 stars`, 14, y);
        
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        y += 5;
        doc.text(`Feedback: "${r.feedback.substring(0, 110)}${r.feedback.length > 110 ? '...' : ''}"`, 16, y);
        
        if (r.suggestion) {
          y += 5;
          doc.text(`Suggestion: "${r.suggestion.substring(0, 110)}${r.suggestion.length > 110 ? '...' : ''}"`, 16, y);
        }

        y += 5;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Date: ${r.review_date} | OS: ${r.operating_system} | Browser: ${r.browser} | AI: ${r.ai_sentiment} (${r.ai_category})`, 16, y);

        y += 8;
        doc.line(14, y - 4, 196, y - 4); // horizontal divider line
      });

      doc.save(`eduverse_reviews_audit_${Date.now()}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  // Pre-process charts data
  const growthData = stats?.growth || [];
  const starsData = stats ? Object.entries(stats.summary.stars).map(([star, count]) => ({
    name: `${star} Star`,
    count
  })).reverse() : [];

  const sentimentData = stats ? stats.sentiments.map(s => ({
    name: s.sentiment,
    value: parseInt(s.count)
  })) : [];

  const categoryData = stats ? stats.categories.map(c => ({
    name: c.category,
    value: parseInt(c.count)
  })) : [];

  // Group recurring tags & summaries for AI analysis dashboard section
  const getAiInsightCards = () => {
    if (!stats || !stats.rawReviewsForAI) return [];
    
    // Group categories
    const bugReviews = stats.rawReviewsForAI.filter(r => r.ai_category === 'Bug Report');
    const featureReviews = stats.rawReviewsForAI.filter(r => r.ai_category === 'Feature Request' || r.ai_category === 'New Feature Idea');
    const perfReviews = stats.rawReviewsForAI.filter(r => r.ai_category === 'Performance Issue');
    const uiReviews = stats.rawReviewsForAI.filter(r => r.ai_category === 'UI Issue');

    return [
      {
        title: 'Feature Requests & Ideas',
        count: featureReviews.length,
        description: featureReviews.length > 0 
          ? `Users are highly interested in additions: "${featureReviews[0].suggestion || featureReviews[0].feedback.substring(0, 80)}..."`
          : 'No feature suggestions received yet.',
        type: 'feature'
      },
      {
        title: 'Reported Bugs & Failures',
        count: bugReviews.length,
        description: bugReviews.length > 0
          ? `Critical issues spotted: "${bugReviews[0].feedback.substring(0, 90)}..."`
          : 'Excellent! No bug reports filed in recent reviews.',
        type: 'bug'
      },
      {
        title: 'Performance Optimization Requests',
        count: perfReviews.length,
        description: perfReviews.length > 0
          ? `Latency reports: "${perfReviews[0].feedback.substring(0, 90)}..."`
          : 'All users reporting stable, snappy speeds.',
        type: 'performance'
      },
      {
        title: 'UX/UI Layout Friction',
        count: uiReviews.length,
        description: uiReviews.length > 0
          ? `Interface comments: "${uiReviews[0].feedback.substring(0, 90)}..."`
          : 'User satisfaction with layout styles is stable.',
        type: 'ui'
      }
    ];
  };

  const insights = getAiInsightCards();

  return (
    <div className="space-y-6 pb-12" style={{ color: 'var(--db-text-main)' }}>
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--db-text-main)' }}>
            ⭐ Reviews Management
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-muted)' }}>
            Analyze user feedback, inspect AI sentiment classifications, filter browser meta-logs, and export audit trails.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={fetchStats} 
            className="p-2 border rounded-xl hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleExportCSV} 
            className="px-3.5 py-2 border text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer hover:bg-[var(--db-btn-secondary-hover)]"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
          </button>

          <button 
            onClick={handleExportJSON} 
            className="px-3.5 py-2 border text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer hover:bg-[var(--db-btn-secondary-hover)]"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
          >
            <FileJson className="w-4 h-4 text-cyan-500" /> Export JSON
          </button>

          <button 
            onClick={handleExportPDF} 
            className="px-3.5 py-2 border text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer hover:bg-[var(--db-btn-secondary-hover)]"
            style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
          >
            <FileText className="w-4 h-4 text-red-500" /> Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {!statsLoading && stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Avg Rating */}
          <div className="p-5 rounded-3xl border flex items-center justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">Average Rating</span>
              <h3 className="text-3xl font-black">{stats.summary.averageRating}</h3>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(stats.summary.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                ))}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">⭐</div>
          </div>

          {/* Card 2: Total Reviews */}
          <div className="p-5 rounded-3xl border flex items-center justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">Total Feedback</span>
              <h3 className="text-3xl font-black">{stats.summary.totalReviews}</h3>
              <span className="text-[9px] text-[var(--db-text-muted)] font-semibold">Submitted lifetime</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">📋</div>
          </div>

          {/* Card 3: Avg Length */}
          <div className="p-5 rounded-3xl border flex items-center justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">Avg Feedback Length</span>
              <h3 className="text-3xl font-black">{stats.summary.avgFeedbackLength}</h3>
              <span className="text-[9px] text-[var(--db-text-muted)] font-semibold">Characters per review</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm">✍️</div>
          </div>

          {/* Card 4: Reviews growth */}
          <div className="p-5 rounded-3xl border flex items-center justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">Recent Activity</span>
              <h3 className="text-3xl font-black">{stats.summary.weeklyReviews}</h3>
              <span className="text-[9px] text-emerald-500 font-bold">+{stats.summary.todayReviews} Today</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">📈</div>
          </div>

        </div>
      ) : (
        <div className="h-24 w-full flex items-center justify-center bg-[var(--db-card-bg)] rounded-3xl border border-[var(--db-card-border)]">
          <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Recharts Analytics Charts Block */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Growth & Rating Trend */}
          <div className="lg:col-span-2 p-5 rounded-3xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-500" /> Review Volume & Rating Trend (Last 30 Days)</h3>
              <p className="text-[10px] text-[var(--db-text-muted)] mb-4">Tracks submitted review count and average rating over daily timeline intervals.</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--db-sidebar-border)" />
                  <XAxis dataKey="date" stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[1, 5]} stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line yAxisId="left" type="monotone" dataKey="count" name="Reviews Count" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="avg_rating" name="Avg Rating" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Rating Distribution */}
          <div className="p-5 rounded-3xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Rating Star Distribution</h3>
              <p className="text-[10px] text-[var(--db-text-muted)] mb-4">Breakdown count for stars 1 to 5 selected during submission.</p>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={starsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--db-sidebar-border)" />
                  <XAxis dataKey="name" stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }} />
                  <Bar dataKey="count" name="Reviews" fill="#F59E0B" radius={[8, 8, 0, 0]}>
                    {starsData.map((entry, index) => {
                      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: AI Sentiment breakdown */}
          <div className="p-5 rounded-3xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-500" /> AI Sentiment Breakdown</h3>
              <p className="text-[10px] text-[var(--db-text-muted)] mb-4">Gemini-powered classification of reviews text into Positive, Neutral, or Negative.</p>
            </div>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: AI Category classifications */}
          <div className="lg:col-span-2 p-5 rounded-3xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Brain className="w-4 h-4 text-purple-500" /> AI Category Classifications</h3>
              <p className="text-[10px] text-[var(--db-text-muted)] mb-4">Feedback grouped automatically into Bug Reports, Features, Performance, UI Issues, or General.</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--db-sidebar-border)" />
                  <XAxis type="number" stroke="var(--db-text-muted)" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--db-text-muted)" fontSize={10} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }} />
                  <Bar dataKey="value" name="Reviews Count" radius={[0, 8, 8, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* AI Insights Panel */}
      {!statsLoading && stats && (
        <div className="p-5 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm">🤖</div>
            <div>
              <h3 className="font-extrabold text-sm text-[var(--db-text-main)]">AI-Powered Feedback Insights</h3>
              <p className="text-[10px] text-[var(--db-text-muted)]">Gemini automatically scans and highlights recurring complaints, feature suggestions, and performance pain points.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, idx) => {
              const bgColors = {
                bug: 'bg-red-500/5 border-red-500/20 text-red-500',
                feature: 'bg-purple-500/5 border-purple-500/20 text-purple-500',
                performance: 'bg-amber-500/5 border-amber-500/20 text-amber-500',
                ui: 'bg-blue-500/5 border-blue-500/20 text-blue-500'
              };

              return (
                <div key={idx} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${bgColors[insight.type]}`}>
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-xs">{insight.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10">{insight.count} items</span>
                  </div>
                  <p className="text-[10px] leading-normal italic text-[var(--db-text-muted)]">
                    {insight.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Actions Panel */}
      <div className="p-5 rounded-3xl border space-y-4 text-xs" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--db-text-muted)]">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search reviews by user, email, feedback, suggestion, country..."
                className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] placeholder-[var(--db-text-muted)] text-xs rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl cursor-pointer hover:bg-blue-600 transition">
              Search
            </button>
          </form>

          <button onClick={resetFilters} className="px-3.5 py-2 border rounded-xl font-bold cursor-pointer hover:bg-[var(--db-btn-secondary-hover)] transition flex items-center gap-1.5" style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)' }}>
            Reset Filters
          </button>
        </div>

        {/* Dynamic Filters Line */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Rating */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Rating</label>
            <select 
              value={filterRating} 
              onChange={e => setFilterRating(e.target.value)}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Country</label>
            <select 
              value={filterCountry} 
              onChange={e => setFilterCountry(e.target.value)}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Browser */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Browser</label>
            <select 
              value={filterBrowser} 
              onChange={e => setFilterBrowser(e.target.value)}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="">All Browsers</option>
              {browsers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Operating System */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">OS</label>
            <select 
              value={filterOS} 
              onChange={e => setFilterOS(e.target.value)}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="">All OS</option>
              {oss.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Device Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Device</label>
            <select 
              value={filterDevice} 
              onChange={e => setFilterDevice(e.target.value)}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="">All Devices</option>
              {devices.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Sort By</label>
            <select 
              value={`${sortBy}-${sortOrder}`} 
              onChange={e => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="p-2 border rounded-xl bg-[var(--db-input-bg)] border-[var(--db-input-border)] text-[var(--db-text-main)] focus:outline-none"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="rating-DESC">Highest Rated</option>
              <option value="rating-ASC">Lowest Rated</option>
              <option value="user_name-ASC">Alphabetical (A-Z)</option>
              <option value="user_name-DESC">Alphabetical (Z-A)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Reviews Table */}
      <div className="p-5 rounded-3xl border overflow-hidden" style={{ backgroundColor: 'var(--db-card-bg)', borderColor: 'var(--db-card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--db-sidebar-border)] text-[var(--db-text-muted)] uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Review ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Feedback</th>
                <th className="py-3 px-4">AI Sentiment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading ? (
                reviews.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--db-sidebar-border)] hover:bg-[var(--db-btn-secondary-hover)] transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-[var(--db-text-muted)]">#{r.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {r.profile_image ? (
                          <img src={r.profile_image} className="w-6 h-6 rounded-full border" alt="" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px] border">
                            {r.user_name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold">{r.user_name}</span>
                          <span className="text-[9px] text-[var(--db-text-muted)]">{r.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate" title={r.feedback}>
                      {r.feedback}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[9px] font-black"
                        style={{
                          backgroundColor: `${SENTIMENT_COLORS[r.ai_sentiment]}15`,
                          color: SENTIMENT_COLORS[r.ai_sentiment]
                        }}
                      >
                        {r.ai_sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[10px] text-[var(--db-text-muted)]">
                      {r.ai_category}
                    </td>
                    <td className="py-3 px-4 font-bold text-[10px]">{r.country}</td>
                    <td className="py-3 px-4 text-[var(--db-text-muted)] text-[10px]">
                      {new Date(r.review_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenDetail(r.id)} 
                          className="p-1.5 border rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition cursor-pointer"
                          style={{ borderColor: 'var(--db-sidebar-border)' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(r.id)} 
                          className="p-1.5 border rounded-lg hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                          style={{ borderColor: 'var(--db-sidebar-border)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500 italic">
                    No matching reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--db-sidebar-border)] pt-4 mt-4">
            <span className="text-[10px] text-[var(--db-text-muted)]">
              Showing page {pagination.currentPage} of {pagination.pages} | Total {pagination.total} reviews
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 border text-[10px] rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              >
                Prev
              </button>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border transition cursor-pointer ${pagination.currentPage === i + 1 ? 'bg-blue-500 border-blue-500 text-white' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}
                  style={{ 
                    backgroundColor: pagination.currentPage === i + 1 ? '' : 'var(--db-input-bg)', 
                    borderColor: pagination.currentPage === i + 1 ? '' : 'var(--db-sidebar-border)',
                    color: pagination.currentPage === i + 1 ? '' : 'var(--db-text-main)'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={pagination.currentPage === pagination.pages}
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                className="px-3 py-1 border text-[10px] rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer"
                style={{ backgroundColor: 'var(--db-input-bg)', borderColor: 'var(--db-sidebar-border)', color: 'var(--db-text-main)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Details Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div 
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative flex flex-col justify-between max-h-[90vh]"
            style={{
              background: 'var(--db-card-bg)',
              color: 'var(--db-text-main)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[var(--db-sidebar-border)] p-5">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                📋 Review Log Details
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[var(--db-text-muted)] hover:text-red-500 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              {!modalLoading && selectedReview ? (
                <>
                  {/* User Profile details block */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)]">
                    <div className="flex items-center gap-3">
                      {selectedReview.profile_image ? (
                        <img src={selectedReview.profile_image} className="w-12 h-12 rounded-full border border-white/15 shadow-sm" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-sm border">
                          {selectedReview.user_name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{selectedReview.user_name}</span>
                        <span className="text-[10px] text-[var(--db-text-muted)]">{selectedReview.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < selectedReview.rating ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500">{RATING_TEXTS[selectedReview.rating]}</span>
                    </div>
                  </div>

                  {/* Feedback and suggestions text */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">User Feedback</span>
                      <p className="p-4 rounded-2xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-xs leading-relaxed whitespace-pre-wrap">
                        {selectedReview.feedback}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)] tracking-wider">Suggestions for Improvements</span>
                      <p className="p-4 rounded-2xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-xs leading-relaxed italic whitespace-pre-wrap text-[var(--db-text-muted)]">
                        {selectedReview.suggestion || 'No suggestions submitted.'}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis segment */}
                  <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="font-extrabold text-xs text-purple-400">Gemini AI Analysis & Audit</span>
                      </div>
                      <button 
                        onClick={() => handleReanalyzeAI(selectedReview.id)}
                        className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30 text-[9px] rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Re-analyze
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">AI Sentiment</span>
                        <div className="mt-1">
                          <span 
                            className="px-2 py-0.5 rounded-full text-[9px] font-black"
                            style={{
                              backgroundColor: `${SENTIMENT_COLORS[selectedReview.ai_sentiment]}15`,
                              color: SENTIMENT_COLORS[selectedReview.ai_sentiment]
                            }}
                          >
                            {selectedReview.ai_sentiment}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">AI Category</span>
                        <p className="mt-1 font-bold text-slate-300">{selectedReview.ai_category}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">AI Summary</span>
                      <p className="text-xs text-[var(--db-text-muted)] leading-relaxed">
                        {selectedReview.ai_summary || 'Analysis summary not computed.'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Extracted Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReview.ai_tags && (typeof selectedReview.ai_tags === 'string' ? JSON.parse(selectedReview.ai_tags) : selectedReview.ai_tags).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 text-[9px] rounded-md font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complete browser diagnostics & metadata details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[var(--db-input-bg)] border border-[var(--db-sidebar-border)] text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Country</span>
                      <p className="font-bold">{selectedReview.country}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Operating System</span>
                      <p className="font-bold">{selectedReview.operating_system}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Browser</span>
                      <p className="font-bold text-[var(--db-text-muted)]">{selectedReview.browser}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Screen Resolution</span>
                      <p className="font-bold">{selectedReview.screen_resolution}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Language</span>
                      <p className="font-bold">{selectedReview.language}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Active time spent</span>
                      <p className="font-bold text-blue-500">{(selectedReview.active_usage_time / 60).toFixed(1)} mins</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Submission Date</span>
                      <p className="font-bold text-[var(--db-text-muted)]">{selectedReview.review_date} {selectedReview.review_time}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">IP Address</span>
                      <p className="font-bold font-mono text-[10px]">{selectedReview.ip_address || 'hidden'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--db-text-muted)]">Timezone</span>
                      <p className="font-bold">{selectedReview.timezone}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-[var(--db-sidebar-border)] p-4 bg-[var(--db-input-bg)]">
              <button
                onClick={() => handleDeleteReview(selectedReview.id)}
                className="px-4 py-2 border border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Review
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-blue-600 transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
