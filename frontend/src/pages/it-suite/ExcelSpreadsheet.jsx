import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet, ChevronDown, Plus, Trash2, Download, Save,
  CheckCircle, Sparkles, BarChart2, Filter, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, ArrowDown, ArrowUp, X
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ITSuite.css';

// =============================================
// FORMULA ENGINE
// =============================================
const evaluateFormula = (formula, data) => {
  if (!formula.startsWith('=')) return formula;
  let expr = formula.substring(1).toUpperCase().trim();

  // Helper: resolve a cell ref like "B2" → numeric value or 0
  const cellVal = (ref) => {
    const v = data[ref];
    if (v === undefined || v === null || v === '') return 0;
    const raw = typeof v === 'object' ? v.value : v;
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  };

  // Helper: expand range "A1:A5" → array of values
  const rangeVals = (rangeStr) => {
    const [start, end] = rangeStr.split(':');
    const colStart = start.match(/[A-Z]+/)[0];
    const rowStart = parseInt(start.match(/\d+/)[0]);
    const colEnd = end.match(/[A-Z]+/)[0];
    const rowEnd = parseInt(end.match(/\d+/)[0]);
    const vals = [];
    for (let c = colStart.charCodeAt(0); c <= colEnd.charCodeAt(0); c++) {
      for (let r = rowStart; r <= rowEnd; r++) {
        vals.push(cellVal(`${String.fromCharCode(c)}${r}`));
      }
    }
    return vals;
  };

  try {
    // SUM
    if (expr.startsWith('SUM(')) {
      const inner = expr.slice(4, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return vals.reduce((a, b) => a + b, 0);
    }
    // AVERAGE
    if (expr.startsWith('AVERAGE(')) {
      const inner = expr.slice(8, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
    }
    // COUNT
    if (expr.startsWith('COUNT(')) {
      const inner = expr.slice(6, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return vals.filter(v => v !== 0 || data[inner.split(',')[0].trim()]).length;
    }
    // MAX
    if (expr.startsWith('MAX(')) {
      const inner = expr.slice(4, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return Math.max(...vals);
    }
    // MIN
    if (expr.startsWith('MIN(')) {
      const inner = expr.slice(4, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return Math.min(...vals);
    }
    // ROUND
    if (expr.startsWith('ROUND(')) {
      const [numStr, digitsStr] = expr.slice(6, -1).split(',');
      const num = cellVal(numStr.trim()) || parseFloat(numStr.trim());
      return parseFloat(num.toFixed(parseInt(digitsStr?.trim() || '0')));
    }
    // ABS
    if (expr.startsWith('ABS(')) {
      const inner = expr.slice(4, -1).trim();
      return Math.abs(cellVal(inner) || parseFloat(inner));
    }
    // IF
    if (expr.startsWith('IF(')) {
      const inner = expr.slice(3, -1);
      const parts = inner.split(',');
      if (parts.length < 3) return '#ERR';
      const condStr = parts[0].trim();
      const trueVal = parts[1].trim();
      const falseVal = parts[2].trim();
      const condMatch = condStr.match(/^([A-Z]+\d+)\s*([><=!]+)\s*(.+)$/);
      if (condMatch) {
        const lhs = cellVal(condMatch[1]);
        const op = condMatch[2];
        const rhs = parseFloat(condMatch[3]);
        let result = false;
        if (op === '>') result = lhs > rhs;
        else if (op === '<') result = lhs < rhs;
        else if (op === '>=') result = lhs >= rhs;
        else if (op === '<=') result = lhs <= rhs;
        else if (op === '=') result = lhs === rhs;
        return result ? trueVal.replace(/"/g, '') : falseVal.replace(/"/g, '');
      }
      return '#ERR';
    }
    // PRODUCT
    if (expr.startsWith('PRODUCT(')) {
      const inner = expr.slice(8, -1);
      const vals = inner.includes(':') ? rangeVals(inner) : inner.split(',').map(r => cellVal(r.trim()));
      return vals.reduce((a, b) => a * b, 1);
    }
    // TODAY
    if (expr === 'TODAY()') return new Date().toLocaleDateString();
    // NOW
    if (expr === 'NOW()') return new Date().toLocaleString();
    // UPPER / LOWER / LEN / TRIM
    if (expr.startsWith('UPPER(')) {
      const inner = expr.slice(6, -1).trim();
      const v = data[inner];
      return String(typeof v === 'object' ? v.value : v || '').toUpperCase();
    }
    if (expr.startsWith('LOWER(')) {
      const inner = expr.slice(6, -1).trim();
      const v = data[inner];
      return String(typeof v === 'object' ? v.value : v || '').toLowerCase();
    }
    if (expr.startsWith('LEN(')) {
      const inner = expr.slice(4, -1).trim();
      const v = data[inner];
      return String(typeof v === 'object' ? v.value : v || '').length;
    }
    if (expr.startsWith('TRIM(')) {
      const inner = expr.slice(5, -1).trim();
      const v = data[inner];
      return String(typeof v === 'object' ? v.value : v || '').trim();
    }
    // CONCAT
    if (expr.startsWith('CONCAT(')) {
      const parts = expr.slice(7, -1).split(',').map(s => {
        const t = s.trim();
        return t.startsWith('"') ? t.replace(/"/g, '') : String(data[t] ? (typeof data[t] === 'object' ? data[t].value : data[t]) : '');
      });
      return parts.join('');
    }
    // Simple arithmetic with cell refs
    const withValues = expr.replace(/[A-Z]+\d+/g, (ref) => cellVal(ref));
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${withValues})`)();
    return typeof result === 'number' ? (Number.isFinite(result) ? parseFloat(result.toFixed(4)) : '#DIV/0!') : result;
  } catch {
    return '#ERR';
  }
};

// =============================================
// COLUMN LABEL GENERATOR  A...Z, AA, AB...
// =============================================
const getColLabel = (idx) => {
  let label = '';
  let n = idx;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
};

const COLS = 26; // A–Z
const ROWS = 100;

// =============================================
// MAIN COMPONENT
// =============================================
export default function ExcelSpreadsheet() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Document meta
  const [docName, setDocName] = useState('Untitled Spreadsheet');
  const [saveStatus, setSaveStatus] = useState('Saved');

  // Sheet data: { sheetName: { data: {A1: {value, style}, ...}, cols: {0: width}, rows: {0: height}, frozenRows, frozenCols } }
  const [sheets, setSheets] = useState({ Sheet1: { data: {}, cols: {}, rows: {}, frozenRows: 0, frozenCols: 0 } });
  const [activeSheet, setActiveSheet] = useState('Sheet1');

  // Selection
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [selectionRange, setSelectionRange] = useState(null); // {start, end}

  // UI state
  const [activeSidebar, setActiveSidebar] = useState(null); // 'ai', 'chart'
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [chartRange, setChartRange] = useState('');
  const [chartData, setChartData] = useState([]);
  const [filterRow, setFilterRow] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);

  // Cell formatting
  const [cellFormat, setCellFormat] = useState({ bold: false, italic: false, underline: false, align: 'left', color: '#111111', bg: '' });

  const socketRef = useRef(null);
  const autosaveRef = useRef(null);

  // ---- LOAD DOCUMENT ----
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/it-suite/documents/${id}`);
        setDocName(res.data.name);
        try {
          const parsed = JSON.parse(res.data.content || '{}');
          setSheets(parsed.sheets || { Sheet1: { data: {}, cols: {}, rows: {}, frozenRows: 0, frozenCols: 0 } });
          setActiveSheet(parsed.activeSheet || 'Sheet1');
        } catch { /* ignore parse error on blank content */ }
      } catch {
        toast.error('Failed to load spreadsheet');
        navigate('/it-suite');
      }
    };
    load();

    // Socket setup
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl);
    socketRef.current = socket;
    socket.emit('join-document', { documentId: id, username: user?.name });
    socket.on('document-remote-update', ({ content }) => {
      try {
        const parsed = JSON.parse(content);
        setSheets(parsed.sheets || {});
        setActiveSheet(parsed.activeSheet || 'Sheet1');
      } catch { /* ignore */ }
    });
    return () => socket.disconnect();
  }, [id]);

  // ---- AUTOSAVE ----
  const triggerSave = useCallback((updatedSheets, sheetName) => {
    setSaveStatus('Saving…');
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    const content = JSON.stringify({ activeSheet: sheetName || activeSheet, sheets: updatedSheets });
    if (socketRef.current) socketRef.current.emit('document-update', { documentId: id, content });
    autosaveRef.current = setTimeout(async () => {
      try {
        await api.put(`/it-suite/documents/${id}`, { content });
        setSaveStatus('Saved');
      } catch { setSaveStatus('Offline'); }
    }, 2000);
  }, [id, activeSheet]);

  // ---- SHEET DATA HELPERS ----
  const currentData = () => sheets[activeSheet]?.data || {};

  const getCellDisplay = (ref) => {
    const raw = currentData()[ref];
    if (!raw && raw !== 0) return '';
    const val = typeof raw === 'object' ? raw.value : raw;
    if (typeof val === 'string' && val.startsWith('=')) return String(evaluateFormula(val, currentData()));
    return String(val ?? '');
  };

  const getCellStyle = (ref) => {
    const raw = currentData()[ref];
    if (!raw || typeof raw !== 'object' || !raw.style) return {};
    const s = raw.style;
    return {
      fontWeight: s.bold ? 'bold' : 'normal',
      fontStyle: s.italic ? 'italic' : 'normal',
      textDecoration: s.underline ? 'underline' : 'none',
      textAlign: s.align || 'left',
      color: s.color || '',
      backgroundColor: s.bg || '',
    };
  };

  const updateCell = (ref, value, style) => {
    const prev = currentData()[ref];
    const prevStyle = typeof prev === 'object' ? prev.style : {};
    const newData = {
      ...currentData(),
      [ref]: { value, style: { ...prevStyle, ...(style || {}) } }
    };
    const updatedSheets = {
      ...sheets,
      [activeSheet]: { ...sheets[activeSheet], data: newData }
    };
    setSheets(updatedSheets);
    triggerSave(updatedSheets, activeSheet);
  };

  // ---- CELL SELECTION & EDITING ----
  const handleCellClick = (ref) => {
    setSelectedCell(ref);
    setEditingCell(null);
    const raw = currentData()[ref];
    const val = typeof raw === 'object' ? raw?.value : raw;
    setFormulaBarValue(val !== undefined && val !== null ? String(val) : '');
    // Update format bar
    const s = typeof raw === 'object' ? raw.style || {} : {};
    setCellFormat({ bold: !!s.bold, italic: !!s.italic, underline: !!s.underline, align: s.align || 'left', color: s.color || '#111111', bg: s.bg || '' });
  };

  const handleCellDoubleClick = (ref) => {
    setEditingCell(ref);
    setSelectedCell(ref);
  };

  const handleFormulaBarChange = (val) => {
    setFormulaBarValue(val);
    updateCell(selectedCell, val);
  };

  const handleCellEdit = (ref, val) => {
    updateCell(ref, val);
    setEditingCell(null);
    setFormulaBarValue(val);
  };

  const handleKeyDown = (e, ref) => {
    if (e.key === 'Enter') {
      handleCellEdit(ref, e.target.value);
      // Move down
      const row = parseInt(ref.match(/\d+/)[0]);
      const col = ref.match(/[A-Z]+/)[0];
      setSelectedCell(`${col}${row + 1}`);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellEdit(ref, e.target.value);
      // Move right
      const row = parseInt(ref.match(/\d+/)[0]);
      const colIdx = ref.charCodeAt(0) - 65;
      if (colIdx < COLS - 1) setSelectedCell(`${getColLabel(colIdx + 1)}${row}`);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // ---- FORMAT OPERATIONS ----
  const applyFormat = (formatKey, value) => {
    const raw = currentData()[selectedCell];
    const prev = typeof raw === 'object' ? raw : { value: raw };
    const newStyle = { ...(prev.style || {}), [formatKey]: value };
    updateCell(selectedCell, prev.value ?? '', newStyle);
    setCellFormat(f => ({ ...f, [formatKey]: value }));
  };

  // ---- SHEET MANAGEMENT ----
  const addSheet = () => {
    const name = `Sheet${Object.keys(sheets).length + 1}`;
    const updatedSheets = { ...sheets, [name]: { data: {}, cols: {}, rows: {}, frozenRows: 0, frozenCols: 0 } };
    setSheets(updatedSheets);
    setActiveSheet(name);
    triggerSave(updatedSheets, name);
  };

  const deleteSheet = (name) => {
    if (Object.keys(sheets).length <= 1) { toast.error("Cannot delete the only sheet."); return; }
    const updated = { ...sheets };
    delete updated[name];
    const newActive = Object.keys(updated)[0];
    setSheets(updated);
    setActiveSheet(newActive);
    triggerSave(updated, newActive);
  };

  // ---- ROW / COL OPERATIONS ----
  const insertRow = () => {
    const row = parseInt(selectedCell.match(/\d+/)[0]);
    const newData = {};
    Object.entries(currentData()).forEach(([ref, val]) => {
      const r = parseInt(ref.match(/\d+/)[0]);
      const c = ref.match(/[A-Z]+/)[0];
      newData[r >= row ? `${c}${r + 1}` : ref] = val;
    });
    const updatedSheets = { ...sheets, [activeSheet]: { ...sheets[activeSheet], data: newData } };
    setSheets(updatedSheets);
    triggerSave(updatedSheets, activeSheet);
    toast.success('Row inserted');
  };

  const deleteRow = () => {
    const row = parseInt(selectedCell.match(/\d+/)[0]);
    const newData = {};
    Object.entries(currentData()).forEach(([ref, val]) => {
      const r = parseInt(ref.match(/\d+/)[0]);
      const c = ref.match(/[A-Z]+/)[0];
      if (r !== row) newData[r > row ? `${c}${r - 1}` : ref] = val;
    });
    const updatedSheets = { ...sheets, [activeSheet]: { ...sheets[activeSheet], data: newData } };
    setSheets(updatedSheets);
    triggerSave(updatedSheets, activeSheet);
    toast.success('Row deleted');
  };

  // ---- SORT ----
  const sortByColumn = (col, dir) => {
    const data = currentData();
    // Find rows with data
    const rowNums = [...new Set(Object.keys(data).map(r => parseInt(r.match(/\d+/)[0])))].sort((a, b) => a - b);
    const sorted = rowNums.slice(1).sort((a, b) => { // Keep row 1 as header
      const va = getCellDisplay(`${col}${a}`) || '';
      const vb = getCellDisplay(`${col}${b}`) || '';
      const na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return dir === 'asc' ? na - nb : nb - na;
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    const newData = { ...data };
    const allCols = [...new Set(Object.keys(data).map(r => r.match(/[A-Z]+/)[0]))];
    sorted.forEach((origRow, i) => {
      const newRow = i + 2;
      allCols.forEach(c => {
        const orig = data[`${c}${origRow}`];
        if (orig) newData[`${c}${newRow}`] = orig;
        else delete newData[`${c}${newRow}`];
      });
    });
    const updatedSheets = { ...sheets, [activeSheet]: { ...sheets[activeSheet], data: newData } };
    setSheets(updatedSheets);
    triggerSave(updatedSheets, activeSheet);
    setSortConfig({ col, dir });
    toast.success(`Sorted by column ${col} (${dir})`);
  };

  // ---- CHART GENERATION ----
  const buildChart = () => {
    if (!chartRange.includes(':')) { toast.error('Enter a valid range, e.g. A1:B5'); return; }
    const [start, end] = chartRange.toUpperCase().split(':');
    const colStart = start.match(/[A-Z]+/)[0];
    const rowStart = parseInt(start.match(/\d+/)[0]);
    const colEnd = end.match(/[A-Z]+/)[0];
    const rowEnd = parseInt(end.match(/\d+/)[0]);
    const built = [];
    for (let r = rowStart; r <= rowEnd; r++) {
      const entry = {};
      for (let c = colStart.charCodeAt(0); c <= colEnd.charCodeAt(0); c++) {
        const col = String.fromCharCode(c);
        const display = getCellDisplay(`${col}${r}`);
        if (c === colStart.charCodeAt(0)) entry.name = display || `Row ${r}`;
        else entry[`Col ${col}`] = parseFloat(display) || 0;
      }
      built.push(entry);
    }
    setChartData(built);
    toast.success('Chart generated from range!');
  };

  // ---- AI FORMULA ASSISTANT ----
  const handleAiFormula = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await api.post('/it-suite/ai', { action: 'excel_formula', prompt: aiQuery, contextText: '' });
      setAiResult(res.data.text);
    } catch { toast.error('AI request failed'); }
    finally { setAiLoading(false); }
  };

  const insertAiFormula = (formulaText) => {
    const match = formulaText.match(/=\S+/);
    if (match) {
      updateCell(selectedCell, match[0]);
      setFormulaBarValue(match[0]);
      toast.success('Formula inserted!');
    } else {
      toast.error('Could not find a formula in the AI response');
    }
  };

  // ---- EXPORT ----
  const exportCSV = () => {
    const rows = [];
    for (let r = 1; r <= ROWS; r++) {
      const rowVals = [];
      let hasData = false;
      for (let c = 0; c < COLS; c++) {
        const ref = `${getColLabel(c)}${r}`;
        const val = getCellDisplay(ref);
        if (val) hasData = true;
        rowVals.push(`"${String(val).replace(/"/g, '""')}"`);
      }
      if (hasData) rows.push(rowVals.join(','));
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported as CSV');
  };

  const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="excel-spreadsheet-container w-full h-full flex flex-col bg-[var(--db-page-bg)]">

      {/* ---- TOP HEADER BAR ---- */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <input
              type="text"
              value={docName}
              onChange={async (e) => {
                setDocName(e.target.value);
                await api.put(`/it-suite/documents/${id}`, { name: e.target.value });
              }}
              className="text-lg font-bold bg-transparent border-b border-transparent hover:border-emerald-400 focus:border-emerald-500 focus:outline-none text-[var(--db-text-main)] max-w-xs"
            />
            <p className="text-[11px] text-[var(--db-text-muted)] flex items-center gap-1 mt-0.5">
              <CheckCircle size={11} className="text-emerald-500" /> {saveStatus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs font-bold rounded-xl hover:bg-[var(--db-btn-secondary-hover)] transition cursor-pointer">
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setActiveSidebar(s => s === 'chart' ? null : 'chart')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${activeSidebar === 'chart' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <BarChart2 size={14} /> Chart Builder
          </button>
          <button
            onClick={() => setActiveSidebar(s => s === 'ai' ? null : 'ai')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${activeSidebar === 'ai' ? 'bg-blue-600 text-white border-blue-600' : 'bg-[var(--db-input-bg)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            <Sparkles size={14} /> AI Assistant
          </button>
          <button onClick={() => navigate('/it-suite')} className="px-3 py-2 border border-[var(--db-sidebar-border)] text-xs font-bold rounded-xl hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer">
            Close
          </button>
        </div>
      </div>

      {/* ---- FORMATTING TOOLBAR ---- */}
      <div className="bg-[var(--db-card-bg)] border-b border-[var(--db-sidebar-border)] px-4 py-1.5 flex flex-wrap items-center gap-2">
        {/* Format buttons */}
        <button onClick={() => applyFormat('bold', !cellFormat.bold)} className={`p-1.5 rounded-lg transition ${cellFormat.bold ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`} title="Bold"><Bold size={15} /></button>
        <button onClick={() => applyFormat('italic', !cellFormat.italic)} className={`p-1.5 rounded-lg transition ${cellFormat.italic ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`} title="Italic"><Italic size={15} /></button>
        <button onClick={() => applyFormat('underline', !cellFormat.underline)} className={`p-1.5 rounded-lg transition ${cellFormat.underline ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`} title="Underline"><Underline size={15} /></button>
        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
        <button onClick={() => applyFormat('align', 'left')} className={`p-1.5 rounded-lg ${cellFormat.align === 'left' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><AlignLeft size={15} /></button>
        <button onClick={() => applyFormat('align', 'center')} className={`p-1.5 rounded-lg ${cellFormat.align === 'center' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><AlignCenter size={15} /></button>
        <button onClick={() => applyFormat('align', 'right')} className={`p-1.5 rounded-lg ${cellFormat.align === 'right' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-[var(--db-btn-secondary-hover)]'}`}><AlignRight size={15} /></button>
        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
        {/* Text Color */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--db-text-muted)] font-bold">Text</span>
          <input type="color" value={cellFormat.color} onChange={(e) => applyFormat('color', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Text Color" />
        </div>
        {/* Fill Color */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--db-text-muted)] font-bold">Fill</span>
          <input type="color" value={cellFormat.bg || '#ffffff'} onChange={(e) => applyFormat('bg', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" title="Fill Color" />
        </div>
        <span className="h-4 w-px bg-[var(--db-sidebar-border)]" />
        {/* Row operations */}
        <button onClick={insertRow} className="px-2 py-1 text-[10px] font-bold bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer flex items-center gap-1">
          <Plus size={12} /> Row
        </button>
        <button onClick={deleteRow} className="px-2 py-1 text-[10px] font-bold bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-lg hover:bg-red-50 hover:text-red-500 cursor-pointer flex items-center gap-1">
          <Trash2 size={12} /> Row
        </button>

        {/* Formula bar */}
        <div className="ml-auto flex items-center gap-2 flex-1 max-w-md">
          <span className="text-xs font-extrabold text-emerald-600 w-10 text-center border border-[var(--db-input-border)] rounded-lg py-1 bg-[var(--db-input-bg)]">{selectedCell}</span>
          <input
            type="text"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { updateCell(selectedCell, formulaBarValue); setEditingCell(null); } }}
            placeholder="Enter value or =formula..."
            className="flex-1 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-emerald-500 text-[var(--db-text-main)] font-mono"
          />
        </div>
      </div>

      {/* ---- MAIN BODY ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- GRID ---- */}
        <div className="flex-1 overflow-auto excel-grid-viewport bg-[var(--db-card-bg)]" id="excel-grid-viewport">
          <table className="excel-grid-table" style={{ width: `${COLS * 100 + 50}px` }}>
            <thead>
              <tr>
                {/* Corner */}
                <th className="excel-header-cell corner-cell w-12" style={{ minWidth: 50, height: 28 }}></th>
                {Array.from({ length: COLS }, (_, c) => {
                  const label = getColLabel(c);
                  return (
                    <th key={c} className="excel-header-cell" style={{ minWidth: sheets[activeSheet]?.cols?.[c] || 100, height: 28, width: sheets[activeSheet]?.cols?.[c] || 100 }}>
                      <div className="flex items-center justify-center gap-1">
                        {label}
                        <button onClick={() => sortByColumn(label, 'asc')} className="opacity-0 hover:opacity-100 group-hover:opacity-100 transition" title={`Sort ${label} ↑`}><ArrowUp size={8} /></button>
                        <button onClick={() => sortByColumn(label, 'desc')} className="opacity-0 hover:opacity-100 transition" title={`Sort ${label} ↓`}><ArrowDown size={8} /></button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }, (_, r) => {
                const rowNum = r + 1;
                return (
                  <tr key={rowNum} style={{ height: sheets[activeSheet]?.rows?.[r] || 24 }}>
                    {/* Row number */}
                    <td className="excel-header-cell row-index w-12 text-center text-[10px]" style={{ minWidth: 50 }}>{rowNum}</td>
                    {/* Data cells */}
                    {Array.from({ length: COLS }, (_, c) => {
                      const ref = `${getColLabel(c)}${rowNum}`;
                      const isSelected = selectedCell === ref;
                      const isEditing = editingCell === ref;
                      const display = getCellDisplay(ref);
                      const style = getCellStyle(ref);

                      return (
                        <td
                          key={ref}
                          className={`excel-cell text-[12px] ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
                          style={{ ...style, minWidth: sheets[activeSheet]?.cols?.[c] || 100 }}
                          onClick={() => handleCellClick(ref)}
                          onDoubleClick={() => handleCellDoubleClick(ref)}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              defaultValue={typeof currentData()[ref] === 'object' ? currentData()[ref]?.value ?? '' : currentData()[ref] ?? ''}
                              onBlur={(e) => handleCellEdit(ref, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, ref)}
                              className="w-full h-full outline-none bg-transparent text-[12px] font-inherit"
                              style={style}
                            />
                          ) : (
                            <span>{display}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---- SIDE PANELS ---- */}
        {activeSidebar && (
          <div className="w-80 bg-[var(--db-card-bg)] border-l border-[var(--db-sidebar-border)] overflow-y-auto p-5 flex flex-col gap-6 custom-sidebar-scroll flex-shrink-0">
            <button onClick={() => setActiveSidebar(null)} className="self-end p-1 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg">
              <X size={16} />
            </button>

            {/* AI FORMULA ASSISTANT */}
            {activeSidebar === 'ai' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-blue-500">
                  <Sparkles size={16} /> AI Formula Generator
                </h3>
                <p className="text-[10px] text-[var(--db-text-muted)]">Describe what you want to calculate in plain English and the AI will write the formula.</p>
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. Sum all values in column B from rows 2 to 10"
                  className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-2 px-3 text-xs text-[var(--db-text-main)] focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAiFormula}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60"
                >
                  {aiLoading ? 'Generating…' : 'Generate Formula'}
                </button>
                {aiResult && (
                  <div className="p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl text-xs whitespace-pre-wrap space-y-2">
                    <p className="text-[var(--db-text-main)]">{aiResult}</p>
                    <button
                      onClick={() => insertAiFormula(aiResult)}
                      className="text-blue-600 hover:underline font-bold text-[10px]"
                    >
                      Insert into {selectedCell}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CHART BUILDER */}
            {activeSidebar === 'chart' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--db-sidebar-border)] pb-2 text-emerald-600">
                  <BarChart2 size={16} /> Chart Builder
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[var(--db-text-muted)]">Data Range</label>
                  <input
                    type="text"
                    placeholder="e.g. A1:C6"
                    value={chartRange}
                    onChange={(e) => setChartRange(e.target.value.toUpperCase())}
                    className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-xl py-1.5 px-3 text-xs text-[var(--db-text-main)] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[var(--db-text-muted)]">Chart Type</label>
                  <div className="flex gap-2">
                    {['bar', 'line', 'pie'].map(t => (
                      <button
                        key={t}
                        onClick={() => setChartType(t)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl border transition cursor-pointer capitalize ${chartType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[var(--db-input-border)] bg-[var(--db-input-bg)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={buildChart} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition">
                  Build Chart
                </button>

                {chartData.length > 0 && (
                  <div className="mt-4 p-3 bg-[var(--db-input-bg)] border border-[var(--db-input-border)] rounded-2xl">
                    <h4 className="text-[10px] font-extrabold uppercase text-[var(--db-text-muted)] mb-3">Preview</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      {chartType === 'bar' ? (
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--db-sidebar-border)" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          {Object.keys(chartData[0] || {}).filter(k => k !== 'name').map((k, i) => (
                            <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      ) : chartType === 'line' ? (
                        <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--db-sidebar-border)" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          {Object.keys(chartData[0] || {}).filter(k => k !== 'name').map((k, i) => (
                            <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
                          ))}
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie data={chartData} dataKey={Object.keys(chartData[0] || {}).filter(k => k !== 'name')[0] || 'value'} nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                            {chartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- SHEET TABS BAR ---- */}
      <div className="bg-[var(--db-card-bg)] border-t border-[var(--db-sidebar-border)] px-4 py-1.5 flex items-center gap-2 overflow-x-auto">
        {Object.keys(sheets).map((name) => (
          <div
            key={name}
            onClick={() => setActiveSheet(name)}
            className={`flex items-center gap-2 px-4 py-1 rounded-t-lg text-xs font-bold cursor-pointer border border-b-0 transition ${activeSheet === name ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[var(--db-input-bg)] text-[var(--db-text-muted)] border-[var(--db-input-border)] hover:bg-[var(--db-btn-secondary-hover)]'}`}
          >
            {name}
            {Object.keys(sheets).length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteSheet(name); }}
                className="hover:text-red-500 transition"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}
        <button onClick={addSheet} className="p-1 hover:bg-[var(--db-btn-secondary-hover)] rounded-lg transition cursor-pointer" title="Add Sheet">
          <Plus size={16} className="text-[var(--db-text-muted)]" />
        </button>
      </div>
    </div>
  );
}
