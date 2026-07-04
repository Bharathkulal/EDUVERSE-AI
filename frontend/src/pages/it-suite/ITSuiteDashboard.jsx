import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, FileSpreadsheet, Presentation, Star, Trash2, 
  Search, Plus, ChevronRight, CornerDownRight, MoreVertical, 
  Edit3, Trash, RotateCcw, FolderPlus, Upload, Grid, List, CheckCircle 
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ITSuite.css';

export default function ITSuiteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('root'); // 'root' or folder ID
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Home' }]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all'); // 'all', 'starred', 'trash'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); // Document or folder ID
  const [activeMenuType, setActiveMenuType] = useState(null); // 'doc' or 'folder'

  // Fetch folders and files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      let params = { q: searchQuery };
      
      if (currentTab === 'starred') {
        params.starred = 'true';
      } else if (currentTab === 'trash') {
        params.recycle_bin = 'true';
      } else {
        // all files in current folder
        params.folder_id = currentFolder === 'root' ? 'root' : currentFolder;
      }
      
      const res = await api.get('/it-suite/files', { params });
      setFolders(res.data.folders || []);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolder, currentTab, searchQuery]);

  // Create folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post('/it-suite/folders', {
        name: newFolderName,
        parent_id: currentFolder === 'root' ? null : currentFolder
      });
      setNewFolderName('');
      setShowFolderModal(false);
      toast.success('Folder created successfully');
      fetchFiles();
    } catch (err) {
      toast.error('Error creating folder');
    }
  };

  // Create document
  const handleCreateDoc = async (type, name = 'Untitled') => {
    try {
      const res = await api.post('/it-suite/documents', {
        name: `${name} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        folder_id: currentFolder === 'root' ? null : currentFolder
      });
      toast.success(`${type.toUpperCase()} document created`);
      navigate(`/it-suite/${type}/${res.data.id}`);
    } catch (err) {
      toast.error('Error creating document');
    }
  };

  // Action helpers
  const handleStarDocument = async (id, currentStarred) => {
    try {
      await api.put(`/it-suite/documents/${id}`, { is_starred: !currentStarred });
      toast.success(currentStarred ? 'Removed from Starred' : 'Added to Starred');
      fetchFiles();
    } catch (err) {
      toast.error('Error starring document');
    }
  };

  const handleStarFolder = async (id, currentStarred) => {
    try {
      await api.put(`/it-suite/folders/${id}`, { is_starred: !currentStarred });
      toast.success(currentStarred ? 'Removed from Starred' : 'Added to Starred');
      fetchFiles();
    } catch (err) {
      toast.error('Error starring folder');
    }
  };

  const handleTrashDocument = async (id, toTrash) => {
    try {
      await api.put(`/it-suite/documents/${id}`, { is_in_recycle_bin: toTrash });
      toast.success(toTrash ? 'Moved to Recycle Bin' : 'Restored from Recycle Bin');
      fetchFiles();
    } catch (err) {
      toast.error('Error moving document to trash');
    }
  };

  const handleTrashFolder = async (id, toTrash) => {
    try {
      await api.put(`/it-suite/folders/${id}`, { is_in_recycle_bin: toTrash });
      toast.success(toTrash ? 'Moved to Recycle Bin' : 'Restored from Recycle Bin');
      fetchFiles();
    } catch (err) {
      toast.error('Error moving folder to trash');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this document? This cannot be undone.')) return;
    try {
      await api.delete(`/it-suite/documents/${id}`);
      toast.success('Document deleted permanently');
      fetchFiles();
    } catch (err) {
      toast.error('Error deleting document');
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this folder? This will delete all contents.')) return;
    try {
      await api.delete(`/it-suite/folders/${id}`);
      toast.success('Folder deleted permanently');
      fetchFiles();
    } catch (err) {
      toast.error('Error deleting folder');
    }
  };

  const handleRenameDocument = async (id, oldName) => {
    const newName = window.prompt('Rename Document', oldName);
    if (!newName || !newName.trim() || newName === oldName) return;
    try {
      await api.put(`/it-suite/documents/${id}`, { name: newName });
      toast.success('Document renamed');
      fetchFiles();
    } catch (err) {
      toast.error('Error renaming document');
    }
  };

  const handleRenameFolder = async (id, oldName) => {
    const newName = window.prompt('Rename Folder', oldName);
    if (!newName || !newName.trim() || newName === oldName) return;
    try {
      await api.put(`/it-suite/folders/${id}`, { name: newName });
      toast.success('Folder renamed');
      fetchFiles();
    } catch (err) {
      toast.error('Error renaming folder');
    }
  };

  // Folder navigation
  const enterFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    setCurrentTab('all');
  };

  const navigateBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    setCurrentTab('all');
  };

  const openDocument = (doc) => {
    if (doc.is_in_recycle_bin) {
      toast.error('Please restore this document from the recycle bin to edit.');
      return;
    }
    if (doc.type === 'pdf' || doc.type === 'photo-to-pdf') {
      navigate(`/it-suite/photo-to-pdf?id=${doc.id}`);
    } else {
      navigate(`/it-suite/${doc.type}/${doc.id}`);
    }
  };

  // Templates list
  const templates = {
    word: [
      { name: 'Professional Resume', desc: 'Standard job application resume', icon: '📝' },
      { name: 'Business Report', desc: 'Annual or weekly project summaries', icon: '📊' }
    ],
    excel: [
      { name: 'Monthly Budget', desc: 'Manage income and expense categories', icon: '💰' },
      { name: 'Schedule Planner', desc: 'Organize project deliverables and shifts', icon: '📅' }
    ],
    slides: [
      { name: 'Corporate Pitch Deck', desc: 'Introduce products and pitch investors', icon: '🚀' },
      { name: 'Lecture Presentation', desc: 'Structured learning slide deck outline', icon: '🎓' }
    ]
  };

  const handleUseTemplate = async (appType, templateName) => {
    let name = templateName;
    let content = '';
    
    if (appType === 'word') {
      if (templateName.includes('Resume')) {
        content = `
          <h1>[YOUR NAME]</h1>
          <p><strong>Email:</strong> user@eduverse.ai | <strong>Phone:</strong> +1-234-567-890</p>
          <hr/>
          <h2>Professional Summary</h2>
          <p>Results-driven software architect with expertise in full-stack web applications.</p>
          <h2>Experience</h2>
          <p><strong>Senior Engineer</strong> - Tech Corp (2024 - Present)</p>
          <ul>
            <li>Led development of complex educational dashboards.</li>
            <li>Optimized Postgres SQL query latencies by 30%.</li>
          </ul>
        `;
      } else {
        content = `
          <h1>EduVerse Project Report</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()} | <strong>Author:</strong> ${user?.name || 'Administrator'}</p>
          <hr/>
          <h2>1. Introduction</h2>
          <p>This report documents the status of Information Technology suite deployment.</p>
          <h2>2. Executive Summary</h2>
          <p>Completed all components including word, excel, and slides templates successfully.</p>
        `;
      }
    } else if (appType === 'excel') {
      if (templateName.includes('Budget')) {
        content = JSON.stringify({
          activeSheet: 'Budget',
          sheets: {
            'Budget': {
              data: {
                'A1': { value: 'Category', style: { bold: true } },
                'B1': { value: 'Amount ($)', style: { bold: true } },
                'A2': { value: 'Rent/Housing' },
                'B2': { value: 1200 },
                'A3': { value: 'Groceries' },
                'B3': { value: 350 },
                'A4': { value: 'Utilities' },
                'B4': { value: 180 },
                'A5': { value: 'Entertainment' },
                'B5': { value: 120 },
                'A6': { value: 'Total Expenses', style: { bold: true, color: '#2563EB' } },
                'B6': { value: '=SUM(B2:B5)', style: { bold: true, color: '#2563EB' } }
              },
              cols: {},
              rows: {},
              frozenRows: 0,
              frozenCols: 0
            }
          }
        });
      } else {
        content = JSON.stringify({
          activeSheet: 'Schedule',
          sheets: {
            'Schedule': {
              data: {
                'A1': { value: 'Day', style: { bold: true } },
                'B1': { value: 'Task', style: { bold: true } },
                'C1': { value: 'Hours', style: { bold: true } },
                'A2': { value: 'Monday' }, 'B2': { value: 'Requirements alignment' }, 'C2': { value: 4 },
                'A3': { value: 'Tuesday' }, 'B3': { value: 'UI wireframing' }, 'C3': { value: 6 },
                'A4': { value: 'Wednesday' }, 'B4': { value: 'Backend routing setup' }, 'C4': { value: 8 },
                'A5': { value: 'Thursday' }, 'B5': { value: 'Spreadsheet formulas test' }, 'C5': { value: 8 },
                'A6': { value: 'Friday' }, 'B6': { value: 'Deployment verification' }, 'C6': { value: 5 },
                'A7': { value: 'Total Hours', style: { bold: true } }, 'B7': { value: '' }, 'C7': { value: '=SUM(C2:C6)', style: { bold: true } }
              },
              cols: {},
              rows: {},
              frozenRows: 0,
              frozenCols: 0
            }
          }
        });
      }
    } else if (appType === 'slides') {
      if (templateName.includes('Pitch')) {
        content = JSON.stringify([
          { id: 's-1', title: 'EduVerse Launch Pitch', elements: [{ id: 'e-1', type: 'text', value: 'Disrupting Learning Systems with AI', x: 50, y: 180, width: 700, height: 120, fontSize: 32, bold: true, color: '#1E3A8A' }] },
          { id: 's-2', title: 'The Problem', elements: [{ id: 'e-2', type: 'text', value: 'Traditional office suites are disconnected from study workspaces.', x: 50, y: 150, width: 700, height: 200, fontSize: 24, bold: false, color: '#374151' }] },
          { id: 's-3', title: 'The Solution: EduVerse IT Suite', elements: [{ id: 'e-3', type: 'text', value: 'Integrated Word, Excel, and Slides linked to AI center.', x: 50, y: 150, width: 700, height: 200, fontSize: 24, bold: false, color: '#10B981' }] }
        ]);
      } else {
        content = JSON.stringify([
          { id: 's-1', title: 'Lecture 1: Web Technologies', elements: [{ id: 'e-1', type: 'text', value: 'CS102 Department of Information Technology', x: 50, y: 180, width: 700, height: 120, fontSize: 30, bold: true, color: '#4B5563' }] },
          { id: 's-2', title: 'Agenda Overview', elements: [{ id: 'e-2', type: 'text', value: '- Web Architectures\n- REST API integrations\n- PostgreSQL Schemas\n- Realtime Sync using Sockets', x: 50, y: 140, width: 700, height: 200, fontSize: 22, bold: false, color: '#374151' }] }
        ]);
      }
    }

    try {
      const res = await api.post('/it-suite/documents', {
        name,
        type: appType,
        folder_id: currentFolder === 'root' ? null : currentFolder,
        content
      });
      toast.success(`Created document from template: ${templateName}`);
      navigate(`/it-suite/${appType}/${res.data.id}`);
    } catch (err) {
      toast.error('Error creating document from template');
    }
  };

  return (
    <div className="it-dashboard-container p-6 w-full min-h-screen text-[var(--db-text-main)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--db-sidebar-border)] pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            EduVerse IT Productivity Suite
          </h1>
          <p className="text-sm text-[var(--db-text-muted)] mt-1">
            Build essays, calculate datasets, and present structures. All cloud-synchronized and AI-powered.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFolderModal(true)} 
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--db-card-bg-elevated)] border border-[var(--db-sidebar-border)] text-sm rounded-xl font-bold hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer"
          >
            <FolderPlus size={16} className="text-blue-500" />
            New Folder
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl font-bold shadow-lg transition cursor-pointer">
              <Plus size={16} />
              Create New
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-2xl shadow-2xl overflow-hidden hidden group-hover:block z-50">
              <button 
                onClick={() => handleCreateDoc('word')} 
                className="w-full text-left px-4 py-3 hover:bg-[var(--db-btn-secondary-hover)] text-sm flex items-center gap-2 font-medium"
              >
                <FileText size={16} className="text-blue-500" /> EduVerse Word
              </button>
              <button 
                onClick={() => handleCreateDoc('excel')} 
                className="w-full text-left px-4 py-3 hover:bg-[var(--db-btn-secondary-hover)] text-sm flex items-center gap-2 font-medium"
              >
                <FileSpreadsheet size={16} className="text-emerald-500" /> EduVerse Excel
              </button>
              <button 
                onClick={() => handleCreateDoc('slides')} 
                className="w-full text-left px-4 py-3 hover:bg-[var(--db-btn-secondary-hover)] text-sm flex items-center gap-2 font-medium"
              >
                <Presentation size={16} className="text-amber-500" /> EduVerse Slides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-1 rounded-2xl">
          <button 
            onClick={() => { setCurrentTab('all'); setCurrentFolder('root'); setBreadcrumbs([{ id: 'root', name: 'Home' }]); }} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${currentTab === 'all' ? 'bg-blue-600 text-white' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
          >
            All Files
          </button>
          <button 
            onClick={() => setCurrentTab('starred')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${currentTab === 'starred' ? 'bg-blue-600 text-white' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
          >
            Starred
          </button>
          <button 
            onClick={() => setCurrentTab('trash')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${currentTab === 'trash' ? 'bg-blue-600 text-white' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
          >
            Recycle Bin
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[var(--db-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search files/tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-sm rounded-xl py-1.5 pl-9 pr-4 focus:outline-none focus:border-blue-500 w-48 sm:w-64 text-[var(--db-text-main)]"
            />
          </div>

          {/* Grid/List View switcher */}
          <div className="flex bg-[var(--db-input-bg)] border border-[var(--db-input-border)] p-0.5 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[var(--db-card-bg)] text-blue-500 shadow-sm' : 'text-[var(--db-text-muted)]'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-[var(--db-card-bg)] text-blue-500 shadow-sm' : 'text-[var(--db-text-muted)]'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Templates Row (Only show if not in Starred/Trash, and in Root directory) */}
      {currentTab === 'all' && currentFolder === 'root' && !searchQuery && (
        <div className="mb-8">
          <h2 className="text-md font-bold mb-3 flex items-center gap-1.5 text-[var(--db-text-main)]">
            🎯 Start from a Template
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div 
              onClick={() => handleCreateDoc('word', 'Blank')}
              className="p-4 bg-[var(--db-card-bg)] border border-dashed border-[var(--db-sidebar-border)] hover:border-blue-500 rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-lg mb-2">➕</div>
              <span className="text-xs font-bold">Blank Word Doc</span>
            </div>
            
            <div 
              onClick={() => handleCreateDoc('excel', 'Blank')}
              className="p-4 bg-[var(--db-card-bg)] border border-dashed border-[var(--db-sidebar-border)] hover:border-emerald-500 rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-lg mb-2">➕</div>
              <span className="text-xs font-bold">Blank Spreadsheet</span>
            </div>

            <div 
              onClick={() => handleCreateDoc('slides', 'Blank')}
              className="p-4 bg-[var(--db-card-bg)] border border-dashed border-[var(--db-sidebar-border)] hover:border-amber-500 rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-lg mb-2">➕</div>
              <span className="text-xs font-bold">Blank Slideshow</span>
            </div>

            <div 
              onClick={() => navigate('/it-suite/photo-to-pdf')}
              className="p-4 bg-[var(--db-card-bg)] border border-dashed border-[var(--db-sidebar-border)] hover:border-violet-500 rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:-translate-y-0.5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-bold text-lg mb-2 shadow-md shadow-violet-500/20 group-hover:scale-110 transition duration-300">📄</div>
              <span className="text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent group-hover:text-violet-600 transition">AI Photo to PDF</span>
              <p className="text-[9px] text-[var(--db-text-muted)] mt-1 font-semibold leading-tight max-w-[120px]">Enhance & convert images to beautiful AI PDFs</p>
            </div>

            <div 
              onClick={() => navigate('/it-suite/friday-builder')}
              className="p-4 bg-[var(--db-card-bg)] border border-dashed border-[var(--db-sidebar-border)] hover:border-cyan-500 rounded-2xl flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:-translate-y-0.5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg mb-2 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition duration-300">🌐</div>
              <span className="text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent group-hover:text-cyan-500 transition">Friday Web Builder</span>
              <p className="text-[9px] text-[var(--db-text-muted)] mt-1 font-semibold leading-tight max-w-[120px]">Create premium websites with AI inside minutes</p>
            </div>

            {templates.word.map((t, idx) => (
              <div 
                key={`wt-${idx}`}
                onClick={() => handleUseTemplate('word', t.name)}
                className="p-4 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] hover:border-blue-500 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="text-2xl">{t.icon}</div>
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold">{t.name}</h3>
                  <p className="text-[10px] text-[var(--db-text-muted)] line-clamp-1 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}

            {templates.excel.map((t, idx) => (
              <div 
                key={`et-${idx}`}
                onClick={() => handleUseTemplate('excel', t.name)}
                className="p-4 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] hover:border-emerald-500 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <div className="text-2xl">{t.icon}</div>
                <div className="mt-4">
                  <h3 className="text-xs font-extrabold">{t.name}</h3>
                  <p className="text-[10px] text-[var(--db-text-muted)] line-clamp-1 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumbs (only for All Files tab) */}
      {currentTab === 'all' && (
        <div className="flex items-center gap-1 text-xs text-[var(--db-text-muted)] mb-4 bg-[var(--db-card-bg)] p-2 px-4 rounded-xl border border-[var(--db-sidebar-border)] inline-flex">
          {breadcrumbs.map((b, idx) => (
            <div key={b.id} className="flex items-center">
              {idx > 0 && <ChevronRight size={12} className="mx-1" />}
              <span 
                onClick={() => navigateBreadcrumb(idx)} 
                className={`cursor-pointer font-semibold transition hover:text-blue-500 ${idx === breadcrumbs.length - 1 ? 'text-[var(--db-text-main)] font-extrabold' : ''}`}
              >
                {b.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* List / Grid Layout Container */}
      {loading ? (
        <div className="w-full min-h-[30vh] flex flex-col justify-center items-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 animate-spin mb-2"></div>
          <span className="text-xs text-[var(--db-text-muted)]">Fetching items...</span>
        </div>
      ) : folders.length === 0 && documents.length === 0 ? (
        <div className="w-full bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-12 text-center flex flex-col justify-center items-center">
          <div className="w-16 h-16 rounded-full bg-[var(--db-input-bg)] flex items-center justify-center text-2xl mb-4 text-[var(--db-text-muted)]">📁</div>
          <h3 className="font-extrabold text-lg">No Files or Folders Found</h3>
          <p className="text-xs text-[var(--db-text-muted)] mt-1 max-w-sm mx-auto">
            This space is currently empty. Use the create buttons above to build documents, spreadsheets, slides or custom folder structures.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // GRID VIEW
        <div className="space-y-6">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div>
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-[var(--db-text-muted)] mb-3">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((f) => (
                  <div 
                    key={f.id}
                    className="group relative p-4 bg-[var(--db-card-bg)] hover:bg-[var(--db-card-bg-elevated)] border border-[var(--db-sidebar-border)] hover:border-blue-500/50 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => enterFolder(f)}
                  >
                    <Folder className="text-blue-500 fill-blue-500/10" size={24} />
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-sm font-bold truncate text-[var(--db-text-main)]">{f.name}</h4>
                      <p className="text-[10px] text-[var(--db-text-muted)] mt-0.5">Folder</p>
                    </div>
                    
                    {/* Item Dropdown Context menu */}
                    <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === f.id ? null : f.id); setActiveMenuType('folder'); }} 
                        className="p-1 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition"
                      >
                        <MoreVertical size={16} className="text-[var(--db-text-muted)]" />
                      </button>
                      
                      {activeMenuId === f.id && activeMenuType === 'folder' && (
                        <div className="absolute right-0 mt-1 w-36 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-xl shadow-2xl overflow-hidden z-50">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleRenameFolder(f.id, f.name); }} 
                            className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold"
                          >
                            <Edit3 size={12} /> Rename
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleStarFolder(f.id, f.is_starred); }} 
                            className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold"
                          >
                            <Star size={12} className={f.is_starred ? "text-amber-500 fill-amber-500" : ""} /> {f.is_starred ? 'Unstar' : 'Star'}
                          </button>
                          {f.is_in_recycle_bin ? (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleTrashFolder(f.id, false); }} 
                                className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-emerald-500"
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleDeleteFolder(f.id); }} 
                                className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-red-500"
                              >
                                <Trash size={12} /> Hard Delete
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleTrashFolder(f.id, true); }} 
                              className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-red-500"
                            >
                              <Trash2 size={12} /> Move to Trash
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {documents.length > 0 && (
            <div>
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-[var(--db-text-muted)] mb-3">Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {documents.map((d) => {
                  let docIcon = <FileText className="text-blue-500" />;
                  let docColorClass = "hover:border-blue-500/50";
                  if (d.type === 'excel') {
                    docIcon = <FileSpreadsheet className="text-emerald-500" />;
                    docColorClass = "hover:border-emerald-500/50";
                  } else if (d.type === 'slides') {
                    docIcon = <Presentation className="text-amber-500" />;
                    docColorClass = "hover:border-amber-500/50";
                  }

                  return (
                    <div 
                      key={d.id}
                      className={`group relative p-4 bg-[var(--db-card-bg)] hover:bg-[var(--db-card-bg-elevated)] border border-[var(--db-sidebar-border)] ${docColorClass} rounded-2xl flex flex-col justify-between h-36 transition-all cursor-pointer shadow-sm hover:shadow-md`}
                      onClick={() => openDocument(d)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-[var(--db-input-bg)] rounded-xl">{docIcon}</div>
                        <div className="flex items-center gap-0.5">
                          {d.is_starred && (
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === d.id ? null : d.id); setActiveMenuType('doc'); }} 
                            className="p-1 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition"
                          >
                            <MoreVertical size={16} className="text-[var(--db-text-muted)]" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 min-w-0 pr-6">
                        <h4 className="text-sm font-bold truncate text-[var(--db-text-main)]">{d.name}</h4>
                        <p className="text-[10px] text-[var(--db-text-muted)] mt-0.5">
                          {d.type.toUpperCase()} • Edited {new Date(d.updated_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Doc dropdown context menu */}
                      {activeMenuId === d.id && activeMenuType === 'doc' && (
                        <div className="absolute right-2 bottom-8 w-36 bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-xl shadow-2xl overflow-hidden z-50">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleRenameDocument(d.id, d.name); }} 
                            className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold"
                          >
                            <Edit3 size={12} /> Rename
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleStarDocument(d.id, d.is_starred); }} 
                            className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold"
                          >
                            <Star size={12} className={d.is_starred ? "text-amber-500 fill-amber-500" : ""} /> {d.is_starred ? 'Unstar' : 'Star'}
                          </button>
                          {d.is_in_recycle_bin ? (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleTrashDocument(d.id, false); }} 
                                className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-emerald-500"
                              >
                                <RotateCcw size={12} /> Restore
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleDeleteDocument(d.id); }} 
                                className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-red-500"
                              >
                                <Trash size={12} /> Hard Delete
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); handleTrashDocument(d.id, true); }} 
                              className="w-full text-left px-3 py-2 hover:bg-[var(--db-btn-secondary-hover)] text-xs flex items-center gap-1.5 font-semibold text-red-500"
                            >
                              <Trash2 size={12} /> Move to Trash
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // LIST VIEW
        <div className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--db-sidebar-border)] bg-[var(--db-input-bg)] text-xs font-bold text-[var(--db-text-muted)]">
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Last Modified</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Folders row list */}
              {folders.map((f) => (
                <tr 
                  key={f.id}
                  onClick={() => enterFolder(f)}
                  className="border-b border-[var(--db-sidebar-border)] hover:bg-[var(--db-btn-secondary-hover)] text-sm cursor-pointer transition"
                >
                  <td className="p-4 font-bold flex items-center gap-2">
                    <Folder size={18} className="text-blue-500 fill-blue-500/10" />
                    <span>{f.name}</span>
                  </td>
                  <td className="p-4 text-xs text-[var(--db-text-muted)]">Folder</td>
                  <td className="p-4 text-xs text-[var(--db-text-muted)]">-</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRenameFolder(f.id, f.name)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg transition" title="Rename"><Edit3 size={14} /></button>
                      <button onClick={() => handleStarFolder(f.id, f.is_starred)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg transition" title="Star">
                        <Star size={14} className={f.is_starred ? "text-amber-500 fill-amber-500" : ""} />
                      </button>
                      {f.is_in_recycle_bin ? (
                        <>
                          <button onClick={() => handleTrashFolder(f.id, false)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-emerald-500 transition" title="Restore"><RotateCcw size={14} /></button>
                          <button onClick={() => handleDeleteFolder(f.id)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-red-500 transition" title="Delete Permanently"><Trash size={14} /></button>
                        </>
                      ) : (
                        <button onClick={() => handleTrashFolder(f.id, true)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-red-500 transition" title="Move to Trash"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {/* Documents row list */}
              {documents.map((d) => (
                <tr 
                  key={d.id}
                  onClick={() => openDocument(d)}
                  className="border-b border-[var(--db-sidebar-border)] hover:bg-[var(--db-btn-secondary-hover)] text-sm cursor-pointer transition"
                >
                  <td className="p-4 font-bold flex items-center gap-2">
                    {d.type === 'excel' ? <FileSpreadsheet size={18} className="text-emerald-500" /> : d.type === 'slides' ? <Presentation size={18} className="text-amber-500" /> : <FileText size={18} className="text-blue-500" />}
                    <span>{d.name}</span>
                  </td>
                  <td className="p-4 text-xs text-[var(--db-text-muted)] uppercase">{d.type}</td>
                  <td className="p-4 text-xs text-[var(--db-text-muted)]">{new Date(d.updated_at).toLocaleString()}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRenameDocument(d.id, d.name)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg transition" title="Rename"><Edit3 size={14} /></button>
                      <button onClick={() => handleStarDocument(d.id, d.is_starred)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg transition" title="Star">
                        <Star size={14} className={d.is_starred ? "text-amber-500 fill-amber-500" : ""} />
                      </button>
                      {d.is_in_recycle_bin ? (
                        <>
                          <button onClick={() => handleTrashDocument(d.id, false)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-emerald-500 transition" title="Restore"><RotateCcw size={14} /></button>
                          <button onClick={() => handleDeleteDocument(d.id)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-red-500 transition" title="Delete Permanently"><Trash size={14} /></button>
                        </>
                      ) : (
                        <button onClick={() => handleTrashDocument(d.id, true)} className="p-1 hover:bg-[var(--db-input-bg)] rounded-lg text-red-500 transition" title="Move to Trash"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal Dialog */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--db-card-bg)] border border-[var(--db-sidebar-border)] rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-1.5">
              📁 Create New Folder
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--db-text-muted)] uppercase block mb-1">Folder Name</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Science Projects, Assignments"
                  required
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-[var(--db-text-main)] text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 border border-[var(--db-sidebar-border)] bg-transparent rounded-xl text-xs font-bold hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
