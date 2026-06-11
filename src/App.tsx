import React, { useState, useEffect } from 'react';
import { Project, SystemAlert, Staff } from './types';
import { INITIAL_PROJECTS, INITIAL_ALERTS } from './initialData';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ProjectDetail from './components/ProjectDetail';
import ExportPanel from './components/ExportPanel';
import ExtraViews from './components/ExtraViews';
import AddStaffModal from './components/AddStaffModal';
import { 
  verifySupabaseSchema, 
  dbFetchProjects, 
  dbSaveAllProjects, 
  dbFetchAlerts, 
  dbSaveAllAlerts,
  SUPABASE_SQL_SETUP_SCRIPT,
  dbDeleteAllProjects,
  dbDeleteAllAlerts,
  dbDeleteAllExternalIssues
} from './lib/supabaseClient';
import { 
  Tv, 
  Layers, 
  BarChart2, 
  FileSpreadsheet, 
  Bell, 
  AlertTriangle, 
  X, 
  CheckCircle, 
  Menu, 
  Info,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  FileText,
  Users,
  Archive,
  Briefcase,
  Printer,
  ChevronDown,
  Database,
  Trash2,
  UserPlus
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const INITIAL_STAFF: Staff[] = [
  { id: 'st-1', name: 'Ir. Ahmad Subagio, M.T.', role: 'Project Manager', email: 'ahmad.subagio@dfw.or.id', phone: '0812-3456-7890', registeredAt: '2026-01-01' },
  { id: 'st-2', name: 'Dian Permatasari, M.Si.', role: 'Project Manager', email: 'dian.permatasari@dfw.or.id', phone: '0813-9876-5432', registeredAt: '2026-01-05' },
  { id: 'st-3', name: 'drg. Luh Putu Citrawati, M.Kes.', role: 'Project Manager', email: 'luhputu.citrawati@dfw.or.id', phone: '0811-1223-3445', registeredAt: '2026-01-10' },
  { id: 'st-4', name: 'Danang Prasetyo', role: 'Software & IoT Engineer', email: 'danang.prasetyo@dfw.or.id', phone: '0857-4455-6677', registeredAt: '2026-01-15' },
  { id: 'st-5', name: 'Andi Nurhaliza', role: 'Field Officer', email: 'andi.nurhaliza@dfw.or.id', phone: '0815-5566-7788', registeredAt: '2026-01-15' },
  { id: 'st-6', name: 'Ir. Samuel Nababan', role: 'Field Officer', email: 'samuel.nababan@dfw.or.id', phone: '0821-2233-4455', registeredAt: '2026-02-01' },
  { id: 'st-7', name: 'Hafiz Prasada (Sipil Air)', role: 'Sipil Air Engineer', email: 'hafiz.prasada@dfw.or.id', phone: '0852-6677-8899', registeredAt: '2026-02-15' },
  { id: 'st-8', name: 'Imam Trihatmadja', role: 'Program Director', email: 'imam.trihatmadja@dfw.or.id', phone: '0812-1111-2222', registeredAt: '2026-01-01' },
  { id: 'st-9', name: 'Ayu Rikza', role: 'Field Officer', email: 'ayu.rikza@dfw.or.id', phone: '0813-3333-4444', registeredAt: '2026-03-01' }
];

export default function App() {
  // 1. Core States Hydration
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('monitoring_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('monitoring_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem('monitoring_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Current main navigation tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('monitoring_active_tab');
    return saved ? saved : 'executive';
  });

  // Selected project ID for detail view
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('monitoring_selected_project_id');
    return saved ? saved : 'proj-1';
  });

  // Share files/documents state globally
  const [documents, setDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('monitoring_documents');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'doc-1', name: 'DED_Gambar_Teknis_SIPP_Luwu.pdf', size: '4.8 MB', date: '2026-02-12', project: 'SIPP-LUWU', category: 'ToR', status: 'Disetujui' },
      { id: 'doc-2', name: 'MoU_SIPP_Luwu_USAID_DFW.pdf', size: '2.5 MB', date: '2026-01-20', project: 'SIPP-LUWU', category: 'Laporan', status: 'Disetujui' },
      { id: 'doc-3', name: 'Laporan_Amdal_Sabuk_Hijau_Mangrove.pdf', size: '8.2 MB', date: '2026-03-05', project: 'MANGROVE-RES', category: 'Laporan', status: 'Disetujui' },
      { id: 'doc-4', name: 'Adat_Sasi_Pesisir_Nelayan_Berdikari.pdf', size: '1.1 MB', date: '2026-05-25', project: 'MANGROVE-RES', category: 'lainnya', status: 'Draft' },
      { id: 'doc-5', name: 'Rencana_Aksi_Komunal_SABK_NTT.pdf', size: '3.4 MB', date: '2025-12-05', project: 'SABK-SAN', category: 'Laporan', status: 'Disetujui' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('monitoring_documents', JSON.stringify(documents));
  }, [documents]);

  // Active Toast notification state
  const [activeToast, setActiveToast] = useState<SystemAlert | null>(null);

  // Responsive Sidebar Open State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Supabase Cloud Synchronization States
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseTablesOk, setSupabaseTablesOk] = useState<boolean>(false);
  const [supabaseLoading, setSupabaseLoading] = useState<boolean>(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [showSupabaseSetupModal, setShowSupabaseSetupModal] = useState<boolean>(false);
  const [appShowAddStaff, setAppShowAddStaff] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Load initial data from Supabase Cloud on Mount
  useEffect(() => {
    async function initSupabase() {
      try {
        setSupabaseLoading(true);
        const schema = await verifySupabaseSchema();
        setSupabaseConnected(schema.connected);
        setSupabaseTablesOk(schema.tablesCreated);
        
        if (schema.connected && schema.tablesCreated) {
          const cloudProj = await dbFetchProjects(INITIAL_PROJECTS);
          setProjects(cloudProj);
          const cloudAlerts = await dbFetchAlerts(INITIAL_ALERTS);
          setAlerts(cloudAlerts);
        } else if (schema.connected && !schema.tablesCreated) {
          setSupabaseError('Tabel proyek belum di-setup di database Supabase Anda.');
        } else {
          setSupabaseError(schema.errorMsg || 'Koneksi ke Supabase gagal.');
        }
      } catch (err: any) {
        setSupabaseError(err?.message || 'Gagal sinkronisasi data.');
      } finally {
        setSupabaseLoading(false);
      }
    }
    initSupabase();
  }, []);

  // Sync core state to local storage AND Supabase Cloud on change
  useEffect(() => {
    localStorage.setItem('monitoring_projects', JSON.stringify(projects));
    if (supabaseConnected && supabaseTablesOk) {
      dbSaveAllProjects(projects).catch(err => console.error('Gagal simpan proyek ke cloud:', err));
    }
  }, [projects, supabaseConnected, supabaseTablesOk]);

  useEffect(() => {
    localStorage.setItem('monitoring_alerts', JSON.stringify(alerts));
    if (supabaseConnected && supabaseTablesOk) {
      dbSaveAllAlerts(alerts).catch(err => console.error('Gagal simpan alerts ke cloud:', err));
    }
  }, [alerts, supabaseConnected, supabaseTablesOk]);

  const handleForceSyncSupabase = async () => {
    try {
      setSupabaseLoading(true);
      const schema = await verifySupabaseSchema();
      setSupabaseConnected(schema.connected);
      setSupabaseTablesOk(schema.tablesCreated);
      
      if (schema.connected && schema.tablesCreated) {
        const cloudProj = await dbFetchProjects(INITIAL_PROJECTS);
        setProjects(cloudProj);
        const cloudAlerts = await dbFetchAlerts(INITIAL_ALERTS);
        setAlerts(cloudAlerts);
        setSupabaseError(null);
        alert('✓ Sinkronisasi Berhasil!\n\nSeluruh data terbaru berhasil ditarik dari database Supabase Anda.');
      } else if (schema.connected && !schema.tablesCreated) {
        setSupabaseError('Tabel proyek belum di-setup di database Supabase Anda.');
        setShowSupabaseSetupModal(true);
      } else {
        setSupabaseError(schema.errorMsg || 'Koneksi gagal.');
        alert(`❌ Koneksi Supabase gagal:\n${schema.errorMsg || 'Gagal menghubungkan'}`);
      }
    } catch (err: any) {
      setSupabaseError(err?.message || 'Gagal sinkronisasi.');
      alert(`❌ Gagal sinkronisasi: ${err?.message}`);
    } finally {
      setSupabaseLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('monitoring_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('monitoring_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('monitoring_selected_project_id', selectedProjectId);
  }, [selectedProjectId]);

  // 2. Evaluator Engine: Updates the Project status automatically based on critical indicators 
  const updateProjectStatusBasedOnIndicators = (project: Project): Project => {
    const underperformingCount = project.indicators.filter(
      i => i.currentAchievement < i.thresholdAlert
    ).length;

    let nextStatus: Project['status'] = 'Sesuai Rencana';
    if (underperformingCount >= 2) {
      nextStatus = 'Kritis';
    } else if (underperformingCount === 1) {
      nextStatus = 'Beresiko';
    }

    return {
      ...project,
      status: nextStatus
    };
  };

  // Callback to update a single project structure
  const handleUpdateProject = (updatedProject: Project) => {
    // Automatically recalculate status
    const autoProject = updateProjectStatusBasedOnIndicators(updatedProject);
    
    setProjects(prev => prev.map(p => p.id === autoProject.id ? autoProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => {
      const remaining = prev.filter(p => p.id !== projectId);
      if (selectedProjectId === projectId) {
        if (remaining.length > 0) {
          setSelectedProjectId(remaining[0].id);
        } else {
          setSelectedProjectId('');
        }
      }
      return remaining;
    });
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
  };

  // Callback to programmatically trigger a system alert when indicators drop below baseline
  const handleTriggerAlert = (
    projectName: string, 
    indicatorName: string, 
    currentValue: number, 
    targetValue: number, 
    unit: string,
    thresholdAlert: number
  ) => {
    const isAlreadyLogged = alerts.some(al => 
      !al.read && 
      al.projectName === projectName && 
      al.indicatorName === indicatorName && 
      al.currentValue === currentValue
    );

    if (isAlreadyLogged) return; // Avoid duplicate alerts flooding

    const isCritical = currentValue < (thresholdAlert - 10); // Extreme slip is critical

    const newAlert: SystemAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: isCritical ? 'critical' : 'warning',
      projectName,
      indicatorName,
      message: `Capaian "${indicatorName}" pada "${projectName.substring(0, 45)}..." merosot ke ${currentValue}${unit}, di bawah batas aman ${thresholdAlert}${unit}.`,
      currentValue,
      targetValue: thresholdAlert,
      unit,
      read: false
    };

    // Prepend alert (latest first)
    setAlerts(prev => [newAlert, ...prev]);

    // Triggers active toast popup
    setActiveToast(newAlert);

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveToast(prev => prev?.id === newAlert.id ? null : prev);
    }, 6500);
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setActiveToast(null);
  };

  const handleClearAlerts = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log notifikasi otomatis?')) {
      setAlerts([]);
      setActiveToast(null);
    }
  };

  const handleResetDataToDefault = () => {
    if (confirm('Tindakan ini akan mengembalikan seluruh data fiktif bawaan demo pabrik ke browser Anda. Lanjutkan?')) {
      localStorage.removeItem('supabase_cleared_by_user');
      setProjects(INITIAL_PROJECTS);
      setAlerts(INITIAL_ALERTS);
      setActiveTab('executive');
      setSelectedProjectId('proj-1');
      
      // Clear data keys specifically, leaving Supabase credentials intact!
      localStorage.removeItem('monitoring_projects');
      localStorage.removeItem('monitoring_alerts');
      localStorage.removeItem('monitoring_selected_project_id');
      alert('✓ Data demo bawaan berhasil dipulihkan di penyimpanan lokal browser Anda.');
    }
  };

  const handleClearAllData = async () => {
    if (confirm('⚠️ PERINGATAN KERAS: Tindakan ini akan menghapus SECARA PERMANEN seluruh data proyek, indikator, penerima manfaat, dan notifikasi.\n\nSistem Anda akan berada dalam kondisi KOSONG TOTAL (kanvas bersih) agar Anda dapat memasukkan data riil program kerja Anda sendiri dari nol.\n\nApakah Anda yakin ingin menghapus semuanya?')) {
      try {
        setSupabaseLoading(true);
        // Set flag to prevent default data seeding on subsequent loads
        localStorage.setItem('supabase_cleared_by_user', 'true');
        
        // 1. Kosongkan state lokal
        setProjects([]);
        setAlerts([]);
        setSelectedProjectId('');
        
        localStorage.removeItem('monitoring_projects');
        localStorage.removeItem('monitoring_alerts');
        localStorage.removeItem('monitoring_selected_project_id');
        
        // 2. Kosongkan database cloud jika terkoneksi
        if (supabaseConnected && supabaseTablesOk) {
          await dbDeleteAllProjects();
          await dbDeleteAllAlerts();
          await dbDeleteAllExternalIssues();
        }
        
        setActiveTab('executive');
        alert('✓ Semua data fiktif telah dibersihkan! Sekarang sistem kosong total. Anda dapat masuk ke tab "Rincian Proyek" untuk mendaftarkan proyek pemantauan Anda yang pertama.');
      } catch (err: any) {
        alert(`❌ Gagal menghapus data cloud: ${err?.message || err}`);
      } finally {
        setSupabaseLoading(false);
      }
    }
  };

  const handleDismissToast = () => {
    setActiveToast(null);
  };

  const handleReadSingleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  // Helper to compute overall project average progress
  const calculateProjectProgress = (p: Project) => {
    let total = 0;
    p.activities.forEach(a => {
      total += (a.weight * a.progress) / 100;
    });
    return Math.round(total);
  };

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + calculateProjectProgress(p), 0) / projects.length)
    : 0;

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return 'Sangat Baik';
    if (progress >= 70) return 'Baik';
    if (progress >= 50) return 'Sedang';
    return 'Perlu Perhatian';
  };

  const avgLabel = getProgressLabel(avgProgress);

  return (
    <div className="min-h-screen flex text-slate-800 bg-slate-50 relative font-sans print:bg-white print:text-black">
      
      {/* 1. TOAST NOTIFICATION POPUP BANNER (AnimatePresence React) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="active-toast-banner"
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border w-96 flex items-start gap-3 backdrop-blur-md max-w-[calc(100vw-32px)] print-hidden ${
              activeToast.type === 'critical' ? 'bg-rose-50/95 border-rose-200 text-rose-950' : 'bg-amber-50/95 border-amber-200 text-amber-950'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeToast.type === 'critical' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-amber-100 text-amber-700 font-bold'
            }`}>
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Sistem Detektor Otomatis (Live)
                </span>
                <button onClick={handleDismissToast} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-xs font-bold font-display mt-1 text-slate-900 leading-snug">
                Peringatan Batas Capaian!
              </h4>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {activeToast.message}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedProjectId(projects.find(p => p.name === activeToast.projectName)?.id || 'proj-1');
                    setActiveTab('projects');
                    setActiveToast(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-md text-[10px]"
                >
                  Lihat Sumber Masalah
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(activeToast.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. RESPONSIVE MOBILE TOP BAR */}
      <div id="mobile-top-bar" className="fixed top-0 left-0 right-0 h-14 bg-[#0B1528] text-white flex items-center justify-between px-4 z-40 md:hidden print-hidden border-b border-[#1D2B44]">
        <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-[#1E2E4A] rounded">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-sans font-extrabold text-xs tracking-wider uppercase">
          DFW • INDIKATOR SISTEM MONITORING
        </span>
        <div className="relative">
          <button onClick={() => { setActiveTab('alerts'); setIsSidebarOpen(false); }} className="p-1 rounded hover:bg-[#1E2E4A]">
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* 3. SIDEBAR NAVIGATION PANELS */}
      {/* Sidebar background overlay on mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden print-hidden"
        ></div>
      )}

      {/* Main Sidebar Component Container */}
      <div 
        id="app-sidebar"
        className={`fixed md:sticky top-0 bottom-0 left-0 w-64 bg-[#0B1528] text-slate-300 flex flex-col justify-between p-5/ pt-16 md:pt-5 z-45 shrink-0 border-r border-[#1D2B44] transform md:transform-none transition-transform duration-300 md:h-screen print-hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Upper Sidebar Brand block */}
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-sky-500 text-slate-900 rounded-xl flex items-center justify-center font-bold text-base font-sans shadow-sky-500/20 shadow-lg">
                ★
              </span>
              <div>
                <h2 className="font-sans font-extrabold text-[#f8fafc] text-sm tracking-tight uppercase leading-tight">
                  DFW PRO-MONITOR
                </h2>
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest block">
                  SISTEM INDIKATOR V1.2
                </span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile details info */}
          <div className="mt-5 p-3.5 bg-[#17253F]/50 rounded-xl border border-[#203254]/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-200 border border-sky-300 text-sky-900 font-bold flex items-center justify-center text-xs shrink-0 font-sans">
              IT
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#f8fafc] truncate">Imam Trihatmadja</div>
              <div className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5 text-sky-400" /> Program Director
              </div>
            </div>
          </div>
        </div>

        {/* Middle Sidebar Nav List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2 font-sans">
            MENU UTAMA
          </span>

          <button 
            id="nav-executive"
            onClick={() => { setActiveTab('executive'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'executive' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tv className="w-4.5 h-4.5" />
              <span>Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <div className="space-y-1">
            <button 
              id="nav-projects"
              onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
                activeTab === 'projects' 
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                  : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4.5 h-4.5" />
                <span>Daftar Proyek</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Sub-menu of Specific Projects with rapid indicator colors */}
            <div className="pl-6 pr-2 py-0.5 space-y-1 mt-0.5 border-l border-[#1D2B44] ml-5">
              {projects.map((p) => {
                const isSelected = activeTab === 'projects' && selectedProjectId === p.id;
                let statusColor = 'bg-emerald-500'; // Sesuai Rencana / Aktif
                if (p.status === 'Beresiko') statusColor = 'bg-amber-500';
                if (p.status === 'Kritis') statusColor = 'bg-rose-500';

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setActiveTab('projects');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left truncate px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#15233C] text-sky-400 shadow-xs' 
                        : 'text-slate-550 hover:text-slate-200 hover:bg-[#15233C]/40'
                    }`}
                    title={p.name}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`}></span>
                    <span className="truncate">{p.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            id="nav-documents"
            onClick={() => { setActiveTab('documents'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'documents' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4.5 h-4.5" />
              <span>Dokumen Pendukung</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button 
            id="nav-beneficiaries"
            onClick={() => { setActiveTab('beneficiaries'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'beneficiaries' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4.5 h-4.5" />
              <span>Penerima Manfaat</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button 
            id="nav-issues"
            onClick={() => { setActiveTab('issues'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'issues' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5" />
              <span>Feeding Isu Aktual</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <button 
            id="nav-archives"
            onClick={() => { setActiveTab('archives'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'archives' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4.5 h-4.5" />
              <span>Arsip Proyek</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>

          <div className="relative group/nav-item flex items-center w-full">
            <button 
              id="nav-workload"
              onClick={() => { setActiveTab('workload'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between pl-3 pr-10 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
                activeTab === 'workload' 
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                  : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4.5 h-4.5" />
                <span>Staff & Beban Kerja</span>
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAppShowAddStaff(true);
              }}
              title="Registrasi Staff Baru"
              className="absolute right-2.5 p-1 text-sky-400 hover:text-sky-305 hover:bg-[#1E2E4A] rounded-lg transition-all z-15 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block pt-3 mb-1 font-sans">
            SISTEM MANAJERIAL
          </span>

          <button 
            id="nav-reports"
            onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'reports' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4.5 h-4.5" />
              <span>Ekspor Laporan</span>
            </div>
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-[9px] px-1.5 py-0.2 rounded font-mono">
              EXCEL/PDF
            </span>
          </button>

          <button 
            id="nav-alerts"
            onClick={() => { setActiveTab('alerts'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-l-4 ${
              activeTab === 'alerts' 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/15 border-sky-400 pl-2.5 scale-[1.01]' 
                : 'text-slate-400 hover:bg-[#15233C] hover:text-[#f8fafc] border-transparent hover:border-slate-500/50 pl-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4.5 h-4.5" />
              <span>Notifikasi Otomatis</span>
            </div>
            {unreadAlertsCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full animate-pulse shrink-0">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Lower Sidebar Actions (Reset data, system description specs) */}
        <div className="p-4 border-t border-slate-800 space-y-3.5">
          {(!supabaseConnected || !supabaseTablesOk) ? (
            <button
              onClick={() => setShowSupabaseSetupModal(true)}
              className="w-full bg-[#3ecf8e] hover:bg-[#34b27b] text-[#0f172a] font-extrabold text-[11px] py-3 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/20 border border-emerald-400/30 animate-pulse font-display"
            >
              <Database className="w-4 h-4 text-[#0f172a]" />
              <span>SETUP DATABASE SUPABASE</span>
            </button>
          ) : (
            <div className="p-3 bg-emerald-900/40 rounded-xl border border-emerald-800/40 text-[10px] text-emerald-350 leading-normal flex flex-col gap-1">
              <span className="font-extrabold text-emerald-300 block mb-0.5 flex items-center gap-1.5 font-display">
                <Database className="w-4 h-4 text-[#3ecf8e]" /> Supabase Terhubung ✓
              </span>
              Sinkronisasi modul naskah & log otomatis dengan platform Supabase Cloud Anda aman & aktif.
            </div>
          )}

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/60 text-[10px] text-slate-500 leading-normal">
            <span className="font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" /> Status Database
            </span>
            {supabaseConnected && supabaseTablesOk ? (
              <span className="text-emerald-450 font-medium font-mono">Terkoneksi secara langsung ke Cloud Database Supabase Proyek <b>kvaktoebwxpgmydihajx</b>.</span>
            ) : (
              <span className="text-rose-400 font-medium">Platform saat ini menggunakan Local Storage browser Anda sebagai cadangan offline sebelum Supabase dikoneksikan.</span>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-850 mt-1.5">
            <button 
              onClick={handleClearAllData}
              className="w-full text-left font-display text-[10px] font-extrabold text-rose-450 hover:text-rose-400 hover:bg-rose-950/30 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Mulai lembaran baru dengan menghapus semua proyek demo fiktif bawaan pabrik"
            >
              <Trash2 className="w-3.5 h-3.5" />
              KOSONGKAN DATA & RIIL (BARU)
            </button>
            
            <button 
              onClick={handleResetDataToDefault}
              className="w-full text-left font-display text-[10px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 px-2 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Kembalikan data proyek serta status fiktif bawaan pabrik untuk keperluan uji coba"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Pulihkan Data Demo Instan
            </button>
            <span className="text-[9px] text-slate-600 font-mono block text-center mt-1">
              © {new Date().getFullYear()} NGO DFW Indonesia
            </span>
          </div>
        </div>
      </div>

      {/* 4. MAIN CENTRAL CONTENT AREA */}
      <div id="main-content-scroller" className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto pt-14 md:pt-0">
        
        {/* STICKY TOPBAR HEADER TETAP */}
        <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-30 border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h1 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-tight">
              {activeTab === 'executive' && 'Dashboard Eksekutif'}
              {activeTab === 'projects' && 'Detail & Capaian Proyek'}
              {activeTab === 'documents' && 'Manajemen Dokumen Pendukung'}
              {activeTab === 'beneficiaries' && 'Database Penerima Manfaat'}
              {activeTab === 'issues' && 'Feeding Isu & Mitigasi Aktual'}
              {activeTab === 'archives' && 'Arsip Proyek & Sejarah'}
              {activeTab === 'workload' && 'Staff & Analisis Beban Kerja'}
              {activeTab === 'reports' && 'Ekspor Manajemen Laporan'}
              {activeTab === 'alerts' && 'Log Warning & Notifikasi Otomatis'}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              {activeTab === 'executive' && 'Selamat datang kembali, pantau seluruh kinerja program NGO DFW Indonesia secara real-time.'}
              {activeTab === 'projects' && 'Monitoring KPI kuantitatif, bagan alur kegiatan, sub-aktivitas, serta refleksi NGO.'}
              {activeTab === 'documents' && 'Kelola dokumen naskah rujukan hukum, AMDAL, MoU, kemitraan strategis, serta area drag & drop.'}
              {activeTab === 'beneficiaries' && 'Evaluasi gender kuota perempuan dan data demografis penerima program bantuan komunal.'}
              {activeTab === 'issues' && 'Daftar kendala lapangan berjalan, tingkat keparahan, dan rekap siasat adat.'}
              {activeTab === 'archives' && 'Daftar riwayat proyek lama DFW Indonesia yang telah selesai pengerjaan fisik & serah terima penuh.'}
              {activeTab === 'workload' && 'Alokasi tim koordinator lapangan dan analisis beban kerja optimal pencegah kejenuhan.'}
              {activeTab === 'reports' && 'Hasil analisis manajerial siap unduh dalam bentuk PDF dan tabuler Microsoft Excel.'}
              {activeTab === 'alerts' && 'Evaluasi otomatis capaian indikator di bawah target batas kritis penanganan (Threshold %).'}
            </p>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Last Update Badge */}
            <div className="bg-slate-150 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 text-[10px] sm:text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Update Terakhir: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Supabase Dynamic Cloud Sync Badge */}
            {supabaseLoading ? (
              <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                ☁️ Menghubungkan Supabase...
              </div>
            ) : supabaseConnected && supabaseTablesOk ? (
              <button 
                onClick={handleForceSyncSupabase}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-4xs transition-all hover:scale-[1.01]"
                title="☁️ Database Supabase Terkoneksi Lancar! Klik untuk paksa sinkronisasi ulang instan sekarang."
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                🟢 Supabase: Aktif ✓
              </button>
            ) : (
              <button 
                onClick={() => setShowSupabaseSetupModal(true)}
                className="bg-rose-600 text-white hover:bg-rose-700 px-4 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-md shadow-rose-600/25 transition-all hover:scale-105 animate-pulse border border-rose-500"
                title="⚠️ Klik di sini untuk panduan setup SQL 1-Menit!"
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                ⚠️ SETUP SUPABASE DATABASE (KLIK)
              </button>
            )}

            {/* Refresh Button */}
            <button 
              onClick={() => {
                const btn = document.getElementById('refresh-icon');
                if (btn) {
                  btn.classList.add('animate-spin');
                  setTimeout(() => {
                    btn.classList.remove('animate-spin');
                  }, 1000);
                }
              }}
              className="bg-white hover:bg-slate-50 text-slate-600 p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center cursor-pointer transition-colors"
              title="Segarkan Data Realtime"
            >
              <RefreshCw id="refresh-icon" className="w-4 h-4 transition-transform duration-1000" />
            </button>

            {/* Print Button */}
            <button 
              onClick={() => {
                window.print();
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold font-display shadow-indigo-600/10 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
              title="Print Laporan"
            >
              <Printer className="w-4 h-3.5" />
              <span>Print Laporan</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto pb-16">
          
          {/* BLOK STATISTIK (KPI) RINGKAS CEPAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            {/* Total Proyek */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Proyek Portfolio</span>
                <span className="text-xl font-black font-display text-slate-800 mt-1 block">{projects.length} Proyek</span>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-605 rounded-xl">
                <Layers className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Proyek Aktif */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-medium">Proyek Aktif (Normal)</span>
                <span className="text-xl font-black font-display text-emerald-600 mt-1 block">
                  {projects.filter(p => p.status === 'Sesuai Rencana' || p.status === 'Beresiko').length} Proyek
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-extrabold uppercase">
                Aktif / Sesuai
              </span>
            </div>

            {/* Proyek Terlambat */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-medium">Proyek Terlambat (Kritis)</span>
                <span className="text-xl font-black font-display text-rose-600 mt-1 block">
                  {projects.filter(p => p.status === 'Kritis').length} Proyek
                </span>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-[9px] font-extrabold uppercase">
                Kritis / Terlambat
              </span>
            </div>

            {/* Rata-rata Progres */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rata-rata Kemajuan Fisik</span>
                <span className="text-xl font-black font-display text-slate-800 mt-1 block">{avgProgress}%</span>
              </div>
              <div className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                avgProgress >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                avgProgress >= 70 ? 'bg-sky-50 text-sky-750 border border-sky-100' :
                avgProgress >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {avgLabel}
              </div>
            </div>
          </div>
          
          {/* Executive view display */}
          {activeTab === 'executive' && (
            <ExecutiveDashboard 
              projects={projects}
              alerts={alerts}
              onSelectProject={(id) => { setSelectedProjectId(id); setActiveTab('projects'); }}
              onNavigate={(tab) => setActiveTab(tab)}
              onMarkAllAlertsRead={handleMarkAllAlertsRead}
            />
          )}

          {/* Project Details view display */}
          {activeTab === 'projects' && (
            <ProjectDetail 
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onUpdateProject={handleUpdateProject}
              onTriggerAlert={handleTriggerAlert}
              onAddProject={(newProject) => {
                setProjects(prev => [...prev, newProject]);
                setSelectedProjectId(newProject.id);
              }}
              onAddProjects={(newProjects) => {
                setProjects(prev => [...prev, ...newProjects]);
                if (newProjects.length > 0) {
                  setSelectedProjectId(newProjects[newProjects.length - 1].id);
                }
              }}
              onDeleteProject={handleDeleteProject}
              staff={staff}
              documents={documents}
              setDocuments={setDocuments}
            />
          )}

          {/* Extra views handler: documents, beneficiaries, issues, archives, workload */}
          {(activeTab === 'documents' || 
            activeTab === 'beneficiaries' || 
            activeTab === 'issues' || 
            activeTab === 'archives' || 
            activeTab === 'workload') && (
            <ExtraViews 
              activeTab={activeTab}
              projects={projects}
              onSelectProject={(id) => { setSelectedProjectId(id); setActiveTab('projects'); }}
              onUpdateProject={handleUpdateProject}
              staff={staff}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              documents={documents}
              setDocuments={setDocuments}
            />
          )}

          {/* Export Panel reports display */}
          {activeTab === 'reports' && (
            <ExportPanel 
              projects={projects}
            />
          )}

          {/* System Automatic Alerts Board */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Bell className="w-7 h-7 text-sky-600" />
                    Pemberitahuan Sistem Otomatis
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Evaluasi real-time terhadap indikator di bawah batas bahaya (Threshold Alert %).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={handleMarkAllAlertsRead}
                    disabled={unreadAlertsCount === 0}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 transition-all disabled:opacity-50"
                  >
                    Tandai Semua Dibaca
                  </button>
                  <button 
                    onClick={handleClearAlerts}
                    disabled={alerts.length === 0}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl border border-rose-100 transition-all disabled:opacity-50"
                  >
                    Kosongkan Log
                  </button>
                </div>
              </div>

              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      onClick={() => handleReadSingleAlert(alert.id)}
                      className={`p-5 rounded-2xl border transition-all relative ${
                        alert.read 
                          ? 'bg-white border-slate-100 opacity-60 text-slate-500 hover:opacity-90' 
                          : alert.type === 'critical'
                            ? 'bg-rose-25/50 border-rose-100 text-slate-900 shadow-xs hover:border-rose-200'
                            : 'bg-amber-25/50 border-amber-100 text-slate-900 shadow-xs hover:border-amber-200'
                      }`}
                    >
                      {/* Read unread circular indicator status */}
                      {!alert.read && (
                        <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-sky-500 inline-block animate-ping"></span>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          alert.type === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              {new Date(alert.timestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                              alert.type === 'critical' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {alert.type === 'critical' ? 'Kritis' : 'Pemberitahuan'}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 border px-1.5 py-0.2 rounded font-mono">
                              {projects.find(p => p.name === alert.projectName)?.code || 'PRO-MON'}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-slate-800 text-base leading-snug">
                            Capaian Rendah Terdeteksi pada {alert.indicatorName}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {alert.message}
                          </p>

                          <div className="flex items-center gap-4 bg-white/70 border border-slate-100 p-3.5 rounded-xl text-xs w-fit max-w-full">
                            <div className="font-mono">
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Capaian Saat Ini</span>
                              <b className="text-sm text-slate-800">{alert.currentValue}{alert.unit}</b>
                            </div>
                            <div className="border-l pl-4 font-mono">
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Ambang Batas Peringatan</span>
                              <b className="text-sm text-slate-800">{alert.targetValue}{alert.unit}</b>
                            </div>
                            <div className="border-l pl-4 font-display">
                              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Intervensi Proyek</span>
                              <span className="font-semibold text-slate-700 truncate max-w-[200px] block" title={alert.projectName}>
                                {alert.projectName}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            <button 
                              onClick={() => {
                                setSelectedProjectId(projects.find(p => p.name === alert.projectName)?.id || 'proj-1');
                                setActiveTab('projects');
                              }}
                              className="text-xs text-sky-700 font-bold bg-sky-25 hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100"
                            >
                              Detail & Selesaikan Capaian
                            </button>
                            {!alert.read && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleReadSingleAlert(alert.id); }}
                                className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 font-semibold"
                              >
                                Tandai Dibaca
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center text-slate-400 max-w-lg mx-auto">
                  <ShieldCheck className="w-14 h-14 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-700 font-display">Log Notifikasi Bersih</h4>
                  <p className="text-xs text-slate-500 mt-1">Seluruh indikator berada dalam status ideal di atas target yang ditentukan. Tidak ada pergeseran kritis yang tercatat.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL SETUP SUPABASE UNTUK NON-DEVELOPER */}
      <AnimatePresence>
        {showSupabaseSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] text-left"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                    <RefreshCw className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm tracking-wide">PANDUAN SETUP SUPABASE</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID Proyek: kvaktoebwxpgmydihajx</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSupabaseSetupModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold leading-relaxed text-slate-705">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Halo Pak Imam! Karena Bapak adalah Program Director, kami merancang asisten intuitif ini agar Bapak dapat menghubungkan aplikasi secara langsung dan sungguhan ke Supabase dalam 4 langkah simpel, tanpa perlu menyunting kode pemrograman apa pun:
                </p>

                <div className="space-y-4 pt-1">
                  {/* Langkah 1 */}
                  <div className="flex gap-3">
                    <span className="bg-sky-100 text-sky-800 font-bold font-display w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="font-bold text-slate-800">Buka Dashboard Supabase Anda</p>
                      <p className="text-[11px] text-slate-500 font-medium">Buka link <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-sky-605 underline font-extrabold">https://supabase.com/dashboard</a>, lalu masuk ke akun Anda dan pilih nama proyek Anda.</p>
                    </div>
                  </div>

                  {/* Langkah 2 */}
                  <div className="flex gap-3">
                    <span className="bg-sky-100 text-sky-800 font-bold font-display w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="font-bold text-slate-800">Pilih Menu "SQL Editor"</p>
                      <p className="text-[11px] text-slate-500 font-medium">Pada panel menu hitam di sebelah kiri layar dashboard Supabase Anda, cari dan klik ikon berlogo petir/lembaran bertuliskan <b>"SQL Editor"</b>.</p>
                    </div>
                  </div>

                  {/* Langkah 3 */}
                  <div className="flex gap-3">
                    <span className="bg-sky-100 text-sky-800 font-bold font-display w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="font-bold text-slate-800">Tempel Kode SQL & Klik Run</p>
                      <p className="text-[11px] text-slate-500 font-medium">Klik tombol <b>"New Query"</b> di atas, lalu salin (copy) seluruh naskah database di bawah ini, tempelkan (paste) di layar kosong editor, lalu klik tombol hijau <b>"Run"</b> di kanan bawah editor.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-mono text-[9px] font-black uppercase text-slate-400">📜 Script Struktur Database (SQL)</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3500);
                      }}
                      className="bg-indigo-650 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-xl font-bold font-display text-[10px] cursor-pointer shadow-4xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      {copiedSql ? '✓ Berhasil Disalin!' : '📋 Salin Script SQL'}
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[170px] border border-slate-905 w-full select-all">
                    {SUPABASE_SQL_SETUP_SCRIPT}
                  </pre>
                </div>

                {/* Langkah 4 */}
                <div className="flex gap-3">
                  <span className="bg-sky-100 text-sky-800 font-bold font-display w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span>
                  <div>
                    <p className="font-bold text-slate-800">Aktifkan Hubungan Awan</p>
                    <p className="text-[11px] text-slate-500 font-medium">Setelah menekan "Run" dan muncul notifikasi sukses di Supabase, silakan klik tombol biru di bawah ini untuk mengaktifkan sinkronisasi awan secara langsung.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200/60 flex flex-col sm:flex-row gap-3 sm:justify-between items-center sm:px-6">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                  🛡️ Koneksi SSL Terenkripsi Anon Key
                </span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSupabaseSetupModal(false)}
                    className="border border-slate-250 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={async () => {
                      await handleForceSyncSupabase();
                      setShowSupabaseSetupModal(false);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold font-display shadow-indigo-600/15 shadow-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span>⚡ Saya Sudah Jalankan Query & Hubungkan</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Bouncing floating Supabase launcher button with stunning focus animation */}
      {(!supabaseConnected || !supabaseTablesOk) && (
        <div className="fixed bottom-6 right-6 z-45 print:hidden">
          <button
            onClick={() => setShowSupabaseSetupModal(true)}
            className="flex items-center gap-2.5 px-6 py-4 bg-gradient-to-r from-rose-600 via-indigo-600 to-[#3ecf8e] text-white rounded-full font-display font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-3 border-white animate-bounce shadow-rose-600/30"
            title="Klik di sini untuk Setup Supabase"
          >
            <Database className="w-4.5 h-4.5 text-white animate-spin" style={{ animationDuration: '3.5s' }} />
            <span>Koneksikan Supabase 🔌</span>
          </button>
        </div>
      )}

      {appShowAddStaff && (
        <AddStaffModal 
          onClose={() => setAppShowAddStaff(false)}
          onAddStaff={handleAddStaff}
        />
      )}

    </div>
  );
}
