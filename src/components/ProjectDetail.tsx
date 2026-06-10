import React, { useState } from 'react';
import { Project, Activity, SubActivity, ProjectIndicator } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  User, 
  Activity as ActivityIcon, 
  CheckCircle, 
  CheckCircle2,
  TrendingUp, 
  BarChart2, 
  AlertCircle, 
  ChevronRight, 
  Briefcase, 
  Percent, 
  ChevronDown, 
  FileText,
  BadgeAlert,
  Sliders,
  DollarSign,
  PlusCircle,
  HelpCircle,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  X
} from 'lucide-react';

interface ProjectDetailProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProject: (updatedProject: Project) => void;
  onTriggerAlert: (projectName: string, indicatorName: string, value: number, target: number, unit: string, thresholdAlert: number) => void;
  onAddProject?: (newProject: Project) => void;
}

export default function ProjectDetail({ 
  projects, 
  selectedProjectId, 
  onSelectProject, 
  onUpdateProject,
  onTriggerAlert,
  onAddProject
}: ProjectDetailProps) {

  const project = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'indicators' | 'activities' | 'reflections' | 'manage'>('indicators');

  // Add Project Modal States
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pManager, setPManager] = useState('');
  const [pDept, setPDept] = useState('');
  const [pDonor, setPDonor] = useState('');
  const [pLocation, setPLocation] = useState('');
  const [pBudget, setPBudget] = useState<string>('1500000000');
  const [pStartDate, setPStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [pEndDate, setPEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [pDesc, setPDesc] = useState('');
  const [pGoal, setPGoal] = useState('');
  const [pOutcomes, setPOutcomes] = useState<string[]>([
    'Mencapai target sosialisasi fisik program',
    'Sertifikasi & pelatihan kelompok kerja'
  ]);
  const [pIndicators, setPIndicators] = useState<Array<{ name: string; target: string; unit: string }>>([
    { name: 'Tingkat Kehadiran & Partisipasi Sosialisasi', target: '95', unit: '%' }
  ]);
  const [pBeneficiaries, setPBeneficiaries] = useState('100 Penerima Manfaat');
  const [pEvents, setPEvents] = useState('5 Pertemuan');
  const [pDocs, setPDocs] = useState('2 Laporan');

  const handleModalAddOutcome = () => {
    setPOutcomes([...pOutcomes, '']);
  };

  const handleModalUpdateOutcome = (index: number, val: string) => {
    const updated = [...pOutcomes];
    updated[index] = val;
    setPOutcomes(updated);
  };

  const handleModalRemoveOutcome = (index: number) => {
    if (pOutcomes.length <= 1) {
      const updated = [...pOutcomes];
      updated[0] = '';
      setPOutcomes(updated);
    } else {
      setPOutcomes(pOutcomes.filter((_, idx) => idx !== index));
    }
  };

  const handleModalAddIndicator = () => {
    setPIndicators([...pIndicators, { name: '', target: '100', unit: '' }]);
  };

  const handleModalUpdateIndicator = (index: number, key: 'name' | 'target' | 'unit', val: string) => {
    const updated = [...pIndicators];
    updated[index] = {
      ...updated[index],
      [key]: val
    };
    setPIndicators(updated);
  };

  const handleModalRemoveIndicator = (index: number) => {
    if (pIndicators.length <= 1) {
      const updated = [...pIndicators];
      updated[0] = { name: '', target: '100', unit: '' };
      setPIndicators(updated);
    } else {
      setPIndicators(pIndicators.filter((_, idx) => idx !== index));
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pCode.trim() || !pName.trim()) {
      showFeedback('Kode Proyek dan Nama Proyek wajib diisi!', 'error');
      return;
    }

    const nProj: Project = {
      id: `proj-${Date.now()}`,
      name: pName.trim(),
      code: pCode.trim().toUpperCase(),
      department: pDept.trim() || 'Dinas / Departemen Eksternal',
      manager: pManager.trim() || 'Staff Pelaksana',
      status: 'Sesuai Rencana',
      startDate: pStartDate,
      endDate: pEndDate,
      budget: Number(pBudget) || 0,
      budgetRealization: 0,
      description: pDesc.trim() || 'Tidak ada deskripsi rinci proyek.',
      location: pLocation.trim() || 'Indonesia',
      pic: pManager.trim() || 'Staff Pelaksana',
      donor: pDonor.trim() || 'Yayasan DFW Indonesia',
      goal: pGoal.trim() || pDesc.trim() || 'Menyelesaikan seluruh target fisik tepat waktu.',
      outcomes: pOutcomes.map(o => o.trim()).filter(x => x.length > 0),
      priorityIssue: 'Belum ada prioritas isu utama terdeklarasikan.',
      metrics: {
        beneficiaries: pBeneficiaries || '0 Penerima Manfaat',
        events: pEvents || '0 Pertemuan',
        documents: pDocs || '0 Laporan',
        weight: '0 Kg'
      },
      activities: [
        {
          id: `act-${Date.now()}-1`,
          name: 'Inisiasi Program & Sosialisasi Awal',
          weight: 100,
          progress: 0,
          subActivities: [
            {
              id: `sub-${Date.now()}-1-1`,
              name: 'Sosialisasi program kepada Pokja dan Kelompok Penerima Manfaat',
              assignedTo: pManager.trim() || 'Staff Pelaksana',
              progress: 0,
              status: 'Belum Mulai',
              startDate: pStartDate,
              endDate: pEndDate
            }
          ]
        }
      ],
      indicators: pIndicators.map((ind, idx) => {
        const trg = Number(ind.target) || 100;
        return {
          id: `ind-${Date.now()}-${idx + 1}`,
          name: ind.name.trim() || `Indikator Keberhasilan ${idx + 1}`,
          code: `IND-${pCode.trim().toUpperCase()}-${idx + 1}`,
          description: `Pelacakan indikator: ${ind.name}`,
          unit: ind.unit.trim() || '%',
          target: trg,
          currentAchievement: 0,
          thresholdAlert: Math.round(trg * 0.8),
          lastUpdated: new Date().toISOString().split('T')[0],
          history: [
            { date: 'Initial', achievement: 0, target: trg }
          ]
        };
      }),
      lessonsLearned: [],
      currentIssues: []
    };

    if (onAddProject) {
      onAddProject(nProj);
      showFeedback('Proyek baru berhasil ditambahkan dan diaktifkan!');
      
      // Reset Modal/Form states
      setShowAddProjectModal(false);
      setPCode('');
      setPName('');
      setPManager('');
      setPDept('');
      setPDonor('');
      setPLocation('');
      setPBudget('1500000000');
      setPDesc('');
      setPGoal('');
      setPOutcomes([
        'Mencapai target sosialisasi fisik program',
        'Sertifikasi & pelatihan kelompok kerja'
      ]);
      setPIndicators([
        { name: 'Tingkat Kehadiran & Partisipasi Sosialisasi', target: '95', unit: '%' }
      ]);
      setPBeneficiaries('100 Penerima Manfaat');
      setPEvents('5 Pertemuan');
      setPDocs('2 Laporan');
    } else {
      showFeedback('Fungsi onAddProject tidak dideklarasikan pada parent!', 'error');
    }
  };

  // New item form states
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityWeight, setNewActivityWeight] = useState(25);

  const [showAddSubFormForActivityId, setShowAddSubFormForActivityId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAssigned, setNewSubAssigned] = useState('');
  const [newSubProgress, setNewSubProgress] = useState(0);
  const [newSubStartDate, setNewSubStartDate] = useState('');
  const [newSubEndDate, setNewSubEndDate] = useState('');

  // Editing state for Activity
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActName, setEditActName] = useState('');
  const [editActWeight, setEditActWeight] = useState(0);

  // Editing state for Sub-Activity
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubParentActId, setEditSubParentActId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubAssigned, setEditSubAssigned] = useState('');
  const [editSubStartDate, setEditSubStartDate] = useState('');
  const [editSubEndDate, setEditSubEndDate] = useState('');
  const [editSubProgress, setEditSubProgress] = useState(0);

  const [showAddIndicatorForm, setShowAddIndicatorForm] = useState(false);
  const [newIndName, setNewIndName] = useState('');
  const [newIndCode, setNewIndCode] = useState('');
  const [newIndDesc, setNewIndDesc] = useState('');
  const [newIndUnit, setNewIndUnit] = useState('%');
  const [newIndTarget, setNewIndTarget] = useState(85);
  const [newIndThreshold, setNewIndThreshold] = useState(75);
  const [newIndCurrent, setNewIndCurrent] = useState(50);

  // New Achievement state
  const [loggingIndicatorId, setLoggingIndicatorId] = useState<string | null>(null);
  const [loggedValue, setLoggedValue] = useState<number>(0);

  // Success message feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // NGO Reflection & Issues forms state
  const [showAddReflectionForm, setShowAddReflectionForm] = useState(false);
  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefCategory, setNewRefCategory] = useState<'Kemitraan' | 'Teknis' | 'Advokasi' | 'Operasional' | 'Eksternal'>('Kemitraan');
  const [newRefType, setNewRefType] = useState<'Lesson Learnt' | 'Success' | 'Challenge' | 'Rekomendasi'>('Lesson Learnt');
  const [newRefDescription, setNewRefDescription] = useState('');
  const [newRefRecommendation, setNewRefRecommendation] = useState('');
  const [newRefContributor, setNewRefContributor] = useState('');

  const [showAddIssueForm, setShowAddIssueForm] = useState(false);
  const [newIssHeadline, setNewIssHeadline] = useState('');
  const [newIssSeverity, setNewIssSeverity] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [newIssCategory, setNewIssCategory] = useState<'Regulasi' | 'Sosial/Masyarakat' | 'Media/Publik' | 'Kebijakan' | 'Iklim/Alam'>('Sosial/Masyarakat');
  const [newIssDescription, setNewIssDescription] = useState('');
  const [newIssMitigation, setNewIssMitigation] = useState('');
  
  // Filtering states for Reflections Tab
  const [filterRefCategory, setFilterRefCategory] = useState<string>('Semua');
  const [filterIssSeverity, setFilterIssSeverity] = useState<string>('Semua');

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 5000);
  };

  if (!project) {
    return <div className="p-12 text-center text-slate-500">Proyek tidak ditemukan.</div>;
  }

  // Calculate project aggregate progress
  const totalWeight = project.activities.reduce((acc, curr) => acc + curr.weight, 0);
  const overallProgress = totalWeight > 0 
    ? Math.round(project.activities.reduce((acc, curr) => acc + (curr.progress * (curr.weight / totalWeight)), 0) * 10) / 10
    : 0;

  // Formatter for IDR Currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handler to update sub-activity progress directly
  const handleSubActivityProgressChange = (activityId: string, subId: string, newProg: number) => {
    const updatedActivities = project.activities.map(act => {
      if (act.id === activityId) {
        const updatedSubs = act.subActivities.map(sub => {
          if (sub.id === subId) {
            let nextStatus: SubActivity['status'] = 'Belum Mulai';
            if (newProg > 0 && newProg < 100) nextStatus = 'Dalam Proses';
            if (newProg === 100) nextStatus = 'Selesai';
            return { 
              ...sub, 
              progress: newProg,
              status: nextStatus
            };
          }
          return sub;
        });

        // Recompute parent activity progress as the average of its sub-activities progress
        const avgProg = updatedSubs.length > 0 
          ? Math.round(updatedSubs.reduce((sum, s) => sum + s.progress, 0) / updatedSubs.length)
          : 0;

        return {
          ...act,
          subActivities: updatedSubs,
          progress: avgProg
        };
      }
      return act;
    });

    onUpdateProject({
      ...project,
      activities: updatedActivities
    });
    showFeedback('Progress sub-aktivitas berhasil diperbarui!');
  };

  // Handler to add a new Activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      name: newActivityName.trim(),
      weight: Number(newActivityWeight),
      progress: 0,
      subActivities: []
    };

    onUpdateProject({
      ...project,
      activities: [...project.activities, newActivity]
    });

    setNewActivityName('');
    setNewActivityWeight(20);
    setShowAddActivityForm(false);
    showFeedback('Aktivitas baru berhasil didaftarkan ke proyek!');
  };

  // Handler to add a new Sub-Activity
  const handleAddSubActivity = (activityId: string) => {
    if (!newSubName.trim() || !newSubAssigned.trim() || !newSubStartDate || !newSubEndDate) {
      showFeedback('Harap lengkapi semua kolom sub-aktivitas!', 'error');
      return;
    }

    const newSub: SubActivity = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      assignedTo: newSubAssigned.trim(),
      progress: Number(newSubProgress),
      status: Number(newSubProgress) === 100 ? 'Selesai' : Number(newSubProgress) > 0 ? 'Dalam Proses' : 'Belum Mulai',
      startDate: newSubStartDate,
      endDate: newSubEndDate
    };

    const updatedActivities = project.activities.map(act => {
      if (act.id === activityId) {
        const nextSubs = [...act.subActivities, newSub];
        const avgProg = Math.round(nextSubs.reduce((sum, s) => sum + s.progress, 0) / nextSubs.length);
        return {
          ...act,
          subActivities: nextSubs,
          progress: avgProg
        };
      }
      return act;
    });

    onUpdateProject({
      ...project,
      activities: updatedActivities
    });

    setNewSubName('');
    setNewSubAssigned('');
    setNewSubProgress(0);
    setNewSubStartDate('');
    setNewSubEndDate('');
    setShowAddSubFormForActivityId(null);
    showFeedback('Sub-aktivitas berhasil ditambahkan!');
  };

  // Handler to edit and update Activity
  const handleStartEditActivity = (act: Activity) => {
    setEditingActivityId(act.id);
    setEditActName(act.name);
    setEditActWeight(act.weight);
  };

  const handleSaveActivity = (actId: string) => {
    if (!editActName.trim()) {
      showFeedback('Nama aktivitas tidak boleh kosong!', 'error');
      return;
    }
    const updatedActivities = project.activities.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          name: editActName.trim(),
          weight: Number(editActWeight)
        };
      }
      return act;
    });
    onUpdateProject({
      ...project,
      activities: updatedActivities
    });
    setEditingActivityId(null);
    showFeedback('Aktivitas induk berhasil diperbarui!');
  };

  // Handler to edit and update Sub-Activity
  const handleStartEditSubActivity = (activityId: string, sub: SubActivity) => {
    setEditingSubId(sub.id);
    setEditSubParentActId(activityId);
    setEditSubName(sub.name);
    setEditSubAssigned(sub.assignedTo);
    setEditSubStartDate(sub.startDate);
    setEditSubEndDate(sub.endDate);
    setEditSubProgress(sub.progress);
  };

  const handleSaveSubActivity = () => {
    if (!editSubName.trim() || !editSubAssigned.trim() || !editSubStartDate || !editSubEndDate) {
      showFeedback('Harap lengkapi seluruh baris data sub-aktivitas!', 'error');
      return;
    }
    const updatedActivities = project.activities.map(act => {
      if (act.id === editSubParentActId) {
        const nextSubs = act.subActivities.map(sub => {
          if (sub.id === editingSubId) {
            const prog = Number(editSubProgress);
            const status: SubActivity['status'] = prog === 100 ? 'Selesai' : prog > 0 ? 'Dalam Proses' : 'Belum Mulai';
            return {
              ...sub,
              name: editSubName.trim(),
              assignedTo: editSubAssigned.trim(),
              startDate: editSubStartDate,
              endDate: editSubEndDate,
              progress: prog,
              status
            };
          }
          return sub;
        });

        const avgProg = nextSubs.length > 0 
          ? Math.round(nextSubs.reduce((sum, s) => sum + s.progress, 0) / nextSubs.length)
          : 0;

        return {
          ...act,
          subActivities: nextSubs,
          progress: avgProg
        };
      }
      return act;
    });

    onUpdateProject({
      ...project,
      activities: updatedActivities
    });

    setEditingSubId(null);
    setEditSubParentActId(null);
    showFeedback('Sub-aktivitas berhasil diperbarui!');
  };

  // Handler to add a new Indicator
  const handleAddIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndName.trim() || !newIndCode.trim()) {
      showFeedback('Nama dan Kode indikator wajib diisi!', 'error');
      return;
    }

    const newIndicator: ProjectIndicator = {
      id: `ind-${Date.now()}`,
      name: newIndName.trim(),
      code: newIndCode.trim().toUpperCase(),
      description: newIndDesc.trim() || 'Tidak ada deskripsi',
      unit: newIndUnit,
      target: Number(newIndTarget),
      currentAchievement: Number(newIndCurrent),
      thresholdAlert: Number(newIndThreshold),
      lastUpdated: new Date().toISOString().split('T')[0],
      history: [
        {
          date: 'Initial',
          achievement: Number(newIndCurrent),
          target: Number(newIndTarget)
        }
      ]
    };

    onUpdateProject({
      ...project,
      indicators: [...project.indicators, newIndicator]
    });

    // Reset Form
    setNewIndName('');
    setNewIndCode('');
    setNewIndDesc('');
    setNewIndUnit('%');
    setNewIndTarget(90);
    setNewIndThreshold(80);
    setNewIndCurrent(50);
    setShowAddIndicatorForm(false);
    showFeedback('Indikator pelacakan berhasil ditambahkan!');

    // Instantly evaluate for warnings/alerts
    if (Number(newIndCurrent) < Number(newIndThreshold)) {
      onTriggerAlert(
        project.name,
        newIndName.trim(),
        Number(newIndCurrent),
        Number(newIndTarget),
        newIndUnit,
        Number(newIndThreshold)
      );
    }
  };

  // Handler to submit a new periodic achievement record (and check thresholds)
  const handleSubmitAchievement = (indicatorId: string) => {
    if (loggedValue === undefined || loggedValue < 0) {
      showFeedback('Nilai capaian tidak valid!', 'error');
      return;
    }

    const currentDay = new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });

    const updatedIndicators = project.indicators.map(ind => {
      if (ind.id === indicatorId) {
        const isSpikeDown = loggedValue < ind.thresholdAlert;
        
        // Trigger automated alert callback in grandparent if threshold breached!
        if (isSpikeDown) {
          onTriggerAlert(
            project.name,
            ind.name,
            loggedValue,
            ind.target,
            ind.unit,
            ind.thresholdAlert
          );
        }

        // Add to history points
        const nextHistory = [
          ...ind.history,
          { date: currentDay, achievement: loggedValue, target: ind.target }
        ];

        return {
          ...ind,
          currentAchievement: loggedValue,
          lastUpdated: new Date().toISOString().split('T')[0],
          history: nextHistory
        };
      }
      return ind;
    });

    onUpdateProject({
      ...project,
      indicators: updatedIndicators
    });

    setLoggingIndicatorId(null);
    setLoggedValue(0);
    showFeedback('Capaian baru berhasil dicatat dan divalidasi oleh sistem!');
  };

  // Handler to remove an activity
  const handleDeleteActivity = (actId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus aktivitas ini beserta seluruh sub-aktivitasnya?')) {
      onUpdateProject({
        ...project,
        activities: project.activities.filter(a => a.id !== actId)
      });
      showFeedback('Aktivitas berhasil dihapus.');
    }
  };

  // Handler to remove an indicator
  const handleDeleteIndicator = (indId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus indikator capaian ini?')) {
      onUpdateProject({
        ...project,
        indicators: project.indicators.filter(i => i.id !== indId)
      });
      showFeedback('Indikator berhasil dihapus.');
    }
  };

  // NGO Reflections state mutators
  const handleAddReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefTitle.trim() || !newRefDescription.trim() || !newRefRecommendation.trim()) {
      showFeedback('Harap penuhi judul, deskripsi, dan rekomendasi!', 'error');
      return;
    }

    const newReflection = {
      id: `ll-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: newRefCategory,
      reflectionType: newRefType,
      title: newRefTitle.trim(),
      description: newRefDescription.trim(),
      recommendation: newRefRecommendation.trim(),
      contributor: newRefContributor.trim() || 'Staff Lapangan'
    };

    onUpdateProject({
      ...project,
      lessonsLearned: [...(project.lessonsLearned || []), newReflection]
    });

    // Reset fields
    setNewRefTitle('');
    setNewRefDescription('');
    setNewRefRecommendation('');
    setNewRefContributor('');
    setNewRefType('Lesson Learnt');
    setShowAddReflectionForm(false);
    showFeedback('Refleksi & pembelajaran baru berhasil dicatatkan!');
  };

  const handleDeleteReflection = (refId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan pembelajaran ini?')) {
      onUpdateProject({
        ...project,
        lessonsLearned: (project.lessonsLearned || []).filter(ll => ll.id !== refId)
      });
      showFeedback('Materi refleksi berhasil dihapus.');
    }
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssHeadline.trim() || !newIssDescription.trim() || !newIssMitigation.trim()) {
      showFeedback('Harap penuhi headline, deskripsi, dan rencana mitigasi!', 'error');
      return;
    }

    const newIssue = {
      id: `iss-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      severity: newIssSeverity,
      category: newIssCategory,
      headline: newIssHeadline.trim(),
      description: newIssDescription.trim(),
      mitigation: newIssMitigation.trim(),
      status: 'Aktif' as const
    };

    onUpdateProject({
      ...project,
      currentIssues: [...(project.currentIssues || []), newIssue]
    });

    // Reset fields
    setNewIssHeadline('');
    setNewIssDescription('');
    setNewIssMitigation('');
    setShowAddIssueForm(false);
    showFeedback('Informasi isu aktual berhasil direkam!');
  };

  const handleToggleIssueStatus = (issueId: string) => {
    const updatedIssues = (project.currentIssues || []).map(iss => {
      if (iss.id === issueId) {
        const nextStatus: 'Aktif' | 'Teratasi' = iss.status === 'Aktif' ? 'Teratasi' : 'Aktif';
        return { ...iss, status: nextStatus };
      }
      return iss;
    });

    onUpdateProject({
      ...project,
      currentIssues: updatedIssues
    });
    showFeedback('Status isu berhasil diperbarui!');
  };

  const handleDeleteIssue = (issueId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan isu berkembang ini?')) {
      onUpdateProject({
        ...project,
        currentIssues: (project.currentIssues || []).filter(iss => iss.id !== issueId)
      });
      showFeedback('Isu berkembang berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector & Project Meta Main Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Project Selector Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-slate-400 font-semibold text-sm">Pilih Proyek Aktif:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={selectedProjectId} 
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 p-1.5 font-bold cursor-pointer outline-hidden max-w-[280px]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name.substring(0, 45)}...</option>
                ))}
              </select>

              <button 
                onClick={() => setShowAddProjectModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold font-display shadow-lg shadow-emerald-950/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                title="Daftarkan Proyek Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Proyek</span>
              </button>
            </div>
          </div>
          <div className="font-mono text-xs text-sky-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Mode: Manajemen Detil Capaian
          </div>
        </div>

        {/* Dynamic Feedback Message banner */}
        {feedbackMsg && (
          <div className={`p-4 text-sm font-semibold flex items-center gap-2 animate-pulse ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-rose-50 text-rose-800 border-b border-rose-100'}`}>
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Project Information Hero Block */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-sky-50 text-sky-700 px-2.5 py-1 text-xs font-bold rounded-lg border border-sky-100 font-mono">
                  {project.code}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-semibold rounded-lg font-display">
                  {project.department}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  project.status === 'Sesuai Rencana' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  project.status === 'Beresiko' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  Status: {project.status}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-slate-800 leading-tight">
                {project.name}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Circular/Gauge visual of completion */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 shrink-0自 mt-2 lg:mt-0">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                  <circle 
                    cx="32" cy="32" r="28" fill="transparent" 
                    stroke={project.status === 'Sesuai Rencana' ? '#10b981' : project.status === 'Beresiko' ? '#f59e0b' : '#ef4444'} 
                    strokeWidth="6" 
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - overallProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute font-bold text-slate-800 text-sm font-mono mt-0.5">
                  {overallProgress}%
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Progress Fisik</span>
                <span className="text-base font-bold text-slate-700 font-display">Keseluruhan</span>
              </div>
            </div>
          </div>

          {/* Secondary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Manajer Proyek</span>
                <span className="text-sm font-bold text-slate-700">{project.manager}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Anggaran Alokasi</span>
                <span className="text-sm font-mono font-bold text-slate-700">{formatIDR(project.budget)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Tanggal Mulai</span>
                <span className="text-sm font-bold text-slate-700">
                  {new Date(project.startDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Estimasi Selesai</span>
                <span className="text-sm font-bold text-slate-700 text-rose-500">
                  {new Date(project.endDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button 
          onClick={() => setActiveSubTab('indicators')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'indicators' 
              ? 'border-sky-600 text-sky-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Pelacakan Indikator Capaian ({project.indicators.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('activities')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'activities' 
              ? 'border-sky-600 text-sky-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ActivityIcon className="w-4 h-4" />
          Aktivitas & Sub-Aktivitas ({project.activities.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('reflections')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'reflections' 
              ? 'border-sky-600 text-sky-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Refleksi & Isu Aktual ({(project.lessonsLearned?.length || 0) + (project.currentIssues?.length || 0)})
        </button>
        <button 
          onClick={() => setActiveSubTab('manage')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'manage' 
              ? 'border-sky-600 text-sky-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Konfigurasi & Tambah Data
        </button>
      </div>

      {/* Tab 1: Capaian Indikator (Historical charts & Logging) */}
      {activeSubTab === 'indicators' && (
        <div className="space-y-6">
          {/* Grid of indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {project.indicators.map((indicator) => {
              const isBelowThreshold = indicator.currentAchievement < indicator.thresholdAlert;
              return (
                <div key={indicator.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4">
                  {/* Indicator Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Indicator Code: {indicator.code}
                        </span>
                        <h4 className="font-display font-semibold text-slate-800 text-base leading-snug truncate">
                          {indicator.name}
                        </h4>
                      </div>
                      <button 
                        onClick={() => handleDeleteIndicator(indicator.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Hapus Indikator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {indicator.description}
                    </p>
                  </div>

                  {/* Achievements Metric Block & Sliders */}
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Kondisi Saat Ini</span>
                      <span className={`text-lg font-bold font-mono block ${isBelowThreshold ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {indicator.currentAchievement}{indicator.unit}
                      </span>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Mutlak</span>
                      <span className="text-lg font-bold font-mono text-slate-700 block">
                        {indicator.target}{indicator.unit}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Batas Peringatan</span>
                      <span className="text-lg font-semibold font-mono text-amber-600 block">
                        {indicator.thresholdAlert}{indicator.unit}
                      </span>
                    </div>
                  </div>

                  {/* Mini responsive History Chart */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Tren Pencapaian Real-time</span>
                    <div className="h-32 w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden p-2">
                      {indicator.history && indicator.history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={indicator.history}
                            margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id={`colorUv-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isBelowThreshold ? "#f43f5e" : "#10b981"} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={isBelowThreshold ? "#f43f5e" : "#10b981"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                            <Area type="monotone" name="Pencapaian" dataKey="achievement" stroke={isBelowThreshold ? "#ef4444" : "#10b981"} strokeWidth={2} fillOpacity={1} fill={`url(#colorUv-${indicator.id})`} />
                            {/* Horizontal Target Line representation if possible */}
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">Belum ada riwayat tercatat</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Diperbarui pada: <b>{indicator.lastUpdated}</b></span>
                      {isBelowThreshold && (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Di Bawah Target!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Log Input Trigger Section */}
                  <div className="pt-2">
                    {loggingIndicatorId === indicator.id ? (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border rounded-xl animate-fade-in">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Catat Capaian Baru ({indicator.unit}):</label>
                          <input 
                            type="number" 
                            step="any"
                            value={loggedValue}
                            onChange={(e) => setLoggedValue(Number(e.target.value))}
                            className="bg-white border rounded px-2.5 py-1 text-sm font-mono font-bold text-slate-800 w-full focus:outline-sky-500"
                            placeholder="Nilai angka saja..."
                          />
                        </div>
                        <div className="flex gap-1 pt-4 self-end">
                          <button 
                            onClick={() => handleSubmitAchievement(indicator.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold p-2 text-xs rounded-lg flex items-center justify-center"
                            title="Simpan"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setLoggingIndicatorId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold p-2 text-xs rounded-lg flex items-center justify-center"
                            title="Batal"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setLoggingIndicatorId(indicator.id);
                          setLoggedValue(indicator.currentAchievement);
                        }}
                        className="w-full text-center border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-25/40 text-slate-600 hover:text-sky-700 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Input Capaian Terbaru ({indicator.unit})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {project.indicators.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 max-w-lg mx-auto">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700 font-display">Belum Ada Indikator Dikaitkan</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">Proyek ini membutuhkan indikator capaian terukur agar kinerjanya dapat dipantau tim eksekutif.</p>
              <button 
                onClick={() => setActiveSubTab('manage')}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Tambah Indikator Baru
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Aktivitas & Sub-Aktivitas (Editable Trees & Sliders) */}
      {activeSubTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-lg">Struktur Rincian Kerja (WBS)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola aktivitas utama, bobot anggaran, dan sebaran koordinasi sub-pekerjaan lapangan</p>
            </div>
            
            <button 
              onClick={() => setShowAddActivityForm(!showAddActivityForm)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Aktivitas Induk
            </button>
          </div>

          {/* Block of Add Activity Form */}
          {showAddActivityForm && (
            <form onSubmit={handleAddActivity} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-xl animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-bold text-sm text-slate-800 font-display">Daftarkan Aktivitas Baru</h4>
                <button type="button" onClick={() => setShowAddActivityForm(false)} className="text-slate-400 hover:text-slate-600 text-xs font-semibold">Tutup</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nama Aktivitas Utama:</label>
                  <input 
                    type="text"
                    required
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    className="bg-white border rounded-lg p-2 text-xs font-semibold text-slate-600 w-full focus:outline-sky-500"
                    placeholder="Contoh: Pengadaan Mesin Pompa Utama..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bobot Proyek (%):</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newActivityWeight}
                    onChange={(e) => setNewActivityWeight(Number(e.target.value))}
                    className="bg-white border rounded-lg p-2 text-xs font-mono font-bold text-slate-600 w-full focus:outline-sky-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg">Simpan Aktivitas</button>
              </div>
            </form>
          )}

          {/* Hierarchy Display of Work activities */}
          <div className="space-y-4">
            {project.activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {/* Activity Leader Bar */}
                <div className={`p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  editingActivityId === activity.id ? 'bg-sky-50/60' : 'bg-slate-50/70'
                }`}>
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 bg-sky-100 text-sky-800 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 self-center">
                      ★
                    </span>
                    <div className="min-w-0 flex-1">
                      {editingActivityId === activity.id ? (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Nama Aktivitas:</label>
                            <input
                              type="text"
                              value={editActName}
                              onChange={(e) => setEditActName(e.target.value)}
                              className="bg-white border text-xs font-bold rounded px-2.5 py-1.5 w-full focus:ring-1 focus:ring-sky-500 text-slate-800"
                              placeholder="Nama Aktivitas"
                            />
                          </div>
                          <div className="w-20">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Bobot (%):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editActWeight}
                              onChange={(e) => setEditActWeight(Number(e.target.value))}
                              className="bg-white border text-xs font-bold rounded px-2 py-1.5 font-mono text-center w-full focus:ring-1 focus:ring-sky-500 text-slate-800"
                            />
                          </div>
                          <div className="flex gap-1.5 mt-4 sm:mt-5">
                            <button
                              onClick={() => handleSaveActivity(activity.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-3xs cursor-pointer animate-pulse"
                              title="Simpan Perubahan"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Simpan</span>
                            </button>
                            <button
                              onClick={() => setEditingActivityId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-lg text-xs font-bold cursor-pointer"
                              title="Batal"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-display font-bold text-slate-800 text-sm sm:text-base leading-snug">
                            {activity.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">Bobot: <b>{activity.weight}%</b> dari total proyek</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400 font-mono"><b>{activity.subActivities.length}</b> sub-aktivitas</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {editingActivityId !== activity.id && (
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Linear progress box */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Kemajuan Fisik</span>
                        <span className="text-sm font-bold text-slate-800 font-mono block">
                          {activity.progress}%
                        </span>
                      </div>
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                        <div className="bg-sky-600 h-full rounded-full" style={{ width: `${activity.progress}%` }}></div>
                      </div>
                      {/* Tools buttons */}
                      <button 
                        onClick={() => handleStartEditActivity(activity)}
                        className="text-slate-400 hover:text-sky-600 p-1.5 transition-colors cursor-pointer"
                        title="Edit Aktivitas Utama"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                        title="Hapus Aktivitas Utama beserta isinya"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-Activities Grid Tree */}
                <div className="p-4 bg-white divide-y divide-slate-100">
                  <div className="pb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider grid grid-cols-12 gap-2">
                    <div className="col-span-5">Sub-Aktivitas Lapangan</div>
                    <div className="col-span-2 text-center">Tim / PIC</div>
                    <div className="col-span-2 text-center">Rentang Tanggal</div>
                    <div className="col-span-3 text-center">Slide Kemajuan (%)</div>
                  </div>

                  {activity.subActivities.map((sub) => (
                    editingSubId === sub.id ? (
                      <div key={sub.id} className="py-4 my-2 grid grid-cols-1 md:grid-cols-12 items-center gap-4 text-xs bg-sky-50/50 p-4 rounded-xl border border-sky-100/70 shadow-3xs animate-fade-in">
                        {/* Edit Name & Progress */}
                        <div className="md:col-span-5 flex flex-col gap-1 w-full">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detail Sub-Aktivitas Lapangan:</label>
                          <input
                            type="text"
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            className="bg-white border rounded px-2.5 py-1.5 text-xs w-full focus:ring-1 focus:ring-sky-500 text-slate-700 font-semibold"
                            placeholder="Deskripsi tugas detail"
                          />
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-slate-400 font-bold block">Slide / Input Kemajuan:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="5"
                              value={editSubProgress}
                              onChange={(e) => setEditSubProgress(Number(e.target.value))}
                              className="bg-white border rounded px-1.5 py-0.5 text-xs font-mono font-bold w-12 text-center"
                            />
                            <span className="text-[10px] text-slate-400 font-bold">%</span>
                          </div>
                        </div>

                        {/* Edit PIC */}
                        <div className="md:col-span-2 flex flex-col gap-1 w-full">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tim / PIC:</label>
                          <input
                            type="text"
                            value={editSubAssigned}
                            onChange={(e) => setEditSubAssigned(e.target.value)}
                            className="bg-white border rounded px-2.5 py-1.5 text-xs w-full focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium"
                            placeholder="Nama penanggung jawab"
                          />
                        </div>

                        {/* Edit Dates */}
                        <div className="md:col-span-3 flex flex-col gap-1 w-full">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentang Pelaksanaan:</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="date"
                              value={editSubStartDate}
                              onChange={(e) => setEditSubStartDate(e.target.value)}
                              className="bg-white border rounded p-1 text-[10px] text-slate-600 focus:ring-1 focus:ring-sky-500 w-full"
                            />
                            <input
                              type="date"
                              value={editSubEndDate}
                              onChange={(e) => setEditSubEndDate(e.target.value)}
                              className="bg-white border rounded p-1 text-[10px] text-slate-600 focus:ring-1 focus:ring-sky-500 w-full"
                            />
                          </div>
                        </div>

                        {/* Action buttons (Save/Cancel) */}
                        <div className="md:col-span-2 flex items-center justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={handleSaveSubActivity}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-3xs cursor-pointer animate-pulse"
                            title="Simpan Sub-Aktivitas"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubId(null);
                              setEditSubParentActId(null);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={sub.id} className="py-3.5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 text-xs md:text-xs">
                        {/* Sub Name & Badge Status */}
                        <div className="md:col-span-5 flex items-start gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            sub.status === 'Selesai' ? 'bg-emerald-500' : sub.status === 'Dalam Proses' ? 'bg-amber-500' : 'bg-slate-300'
                          }`} title={sub.status}></span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 leading-snug">{sub.name}</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 inline-block border ${
                              sub.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : sub.status === 'Dalam Proses' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>

                        {/* PIC Assigned */}
                        <div className="md:col-span-2 text-center md:text-left text-slate-600 font-medium font-display truncate text-xs">
                          {sub.assignedTo}
                        </div>

                        {/* Date Range */}
                        <div className="md:col-span-2 text-center text-slate-400 font-mono text-[10px]">
                          {sub.startDate} s.d {sub.endDate}
                        </div>

                        {/* Slider Input with micro-commit & Edit Button */}
                        <div className="md:col-span-3 flex items-center justify-center gap-2">
                          <span className="font-mono text-center w-8 text-slate-700 font-semibold shrink-0">
                            {sub.progress}%
                          </span>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={sub.progress}
                            onChange={(e) => handleSubActivityProgressChange(activity.id, sub.id, Number(e.target.value))}
                            className="w-full flex-1 align-middle accent-sky-600 cursor-ew-resize h-1.5 bg-slate-100 rounded-lg appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleStartEditSubActivity(activity.id, sub)}
                            className="text-slate-400 hover:text-sky-600 p-1.5 transition-colors cursor-pointer"
                            title="Edit Sub-Aktivitas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  ))}

                  {/* Add Sub Activity Trigger Block */}
                  <div className="pt-3">
                    {showAddSubFormForActivityId === activity.id ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-xs font-bold text-slate-700">Form Sub-Aktivitas</span>
                          <button type="button" onClick={() => setShowAddSubFormForActivityId(null)} className="text-xs text-rose-500 font-semibold hover:underline">Batal</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block">Nama Sub-Aktivitas / Detail Kerja:</label>
                            <input 
                              type="text"
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              className="bg-white border rounded p-1.5 text-xs w-full font-semibold"
                              placeholder="e.g. Pembelian pipa PVC diameter 2 inci..."
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block">Person In Charge (PIC):</label>
                            <input 
                              type="text"
                              value={newSubAssigned}
                              onChange={(e) => setNewSubAssigned(e.target.value)}
                              className="bg-white border rounded p-1.5 text-xs w-full font-semibold"
                              placeholder="e.g. Ir. Joni (Pengawas Sipil)..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-500 block">Progress Awal (%):</label>
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              value={newSubProgress}
                              onChange={(e) => setNewSubProgress(Number(e.target.value))}
                              className="bg-white border rounded p-1.5 text-xs font-mono font-bold w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block">Mulai Tanggal:</label>
                            <input 
                              type="date"
                              value={newSubStartDate}
                              onChange={(e) => setNewSubStartDate(e.target.value)}
                              className="bg-white border rounded p-1.5 text-xs w-full"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block">Target Selesai:</label>
                            <input 
                              type="date"
                              value={newSubEndDate}
                              onChange={(e) => setNewSubEndDate(e.target.value)}
                              className="bg-white border rounded p-1.5 text-xs w-full"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button 
                            type="button" 
                            onClick={() => handleAddSubActivity(activity.id)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-1.5 px-3 rounded"
                          >
                            Simpan Kerja Lapangan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowAddSubFormForActivityId(activity.id)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 hover:gap-1.5 transition-all p-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Sub-Aktivitas Baru
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {project.activities.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 max-w-lg mx-auto">
                <Sliders className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-700 font-display">Belum Ada Aktivitas Terdaftar</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">Setiap proyek membutuhkan minimal satu aktivitas agar target real-time dapat dikonfigurasi.</p>
                <button 
                  onClick={() => setShowAddActivityForm(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Tambah Aktivitas Anda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Config & Custom Dynamic Setup */}
      {activeSubTab === 'manage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Indicator Form Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2 block border-b pb-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Tambah Indikator Baru
            </h3>
            <p className="text-xs text-slate-450 text-slate-400 leading-relaxed">
              Daftarkan KPI (Key Performance Indicator) khusus untuk proyek ini. Data ini akan langsung terhubung ke dasbor eksekutif dan alert otomatis.
            </p>

            <form onSubmit={handleAddIndicator} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Kode Indikator unik:</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: IND-REBO-HA" 
                    value={newIndCode}
                    onChange={(e) => setNewIndCode(e.target.value)}
                    className="border rounded-lg p-2 bg-white w-full font-mono focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Satuan Unit Capaian:</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: %, Ha, Unit, L/Detik" 
                    value={newIndUnit}
                    onChange={(e) => setNewIndUnit(e.target.value)}
                    className="border rounded-lg p-2 bg-white w-full focus:outline-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Nama Indikator Pelacakan:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Luas Mangrove yang Tumbuh Subur" 
                  value={newIndName}
                  onChange={(e) => setNewIndName(e.target.value)}
                  className="border rounded-lg p-2 bg-white w-full font-semibold focus:outline-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Garis Besar Deskripsi:</label>
                <textarea 
                  placeholder="Mengukur persentase bibit mangrove yang dipantau tumbuh hidup setelah periode 3 bulan..." 
                  value={newIndDesc}
                  onChange={(e) => setNewIndDesc(e.target.value)}
                  className="border rounded-lg p-2 bg-white w-full h-16 focus:outline-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Target Mutlak:</label>
                  <input 
                    type="number" 
                    required 
                    value={newIndTarget}
                    onChange={(e) => setNewIndTarget(Number(e.target.value))}
                    className="border rounded-lg p-2 bg-white w-full font-mono font-bold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-600 block mb-1">Batas Bahaya (Alert):</label>
                  <input 
                    type="number" 
                    required 
                    value={newIndThreshold}
                    onChange={(e) => setNewIndThreshold(Number(e.target.value))}
                    className="border rounded-lg p-2 bg-white w-full font-mono font-bold focus:outline-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-600 block mb-1">Nilai Awal Saat Ini:</label>
                  <input 
                    type="number" 
                    required 
                    value={newIndCurrent}
                    onChange={(e) => setNewIndCurrent(Number(e.target.value))}
                    className="border rounded-lg p-2 bg-white w-full font-mono font-bold focus:outline-sky-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-amber-600 bg-amber-50 rounded-lg p-2.5 border border-amber-100 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span><b>Kebijakan Detektor Otomatis:</b> Jika Anda menginput nilai awal saat ini di bawah batas bahaya, sistem akan langsung mengirim pembaruan notifikasi otomatis ke dasbor pimpinan.</span>
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-xl">
                  Simpan Indikator Proyek
                </button>
              </div>
            </form>
          </div>

          {/* Quick Guidance Box / Status check */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2 block border-b pb-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Sistem Pelacakan Kinerja (Panduan)
            </h3>
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">1. Formula Capaian Kumulatif</h4>
                <p>
                  Kemajuan fisik proyek dihitung secara proporsional berdasarkan <b>bobot (%)</b> dari setiap aktivitas utama yang telah terdaftar. Pastikan akumulasi bobot berkisar dari total 100% untuk pelaporan yang akurat.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">2. Mekanisme Notifikasi Otomatis</h4>
                <p>
                  Sistem monitoring dilengkapi mesin otomatis <b>(Automatic Threshold Evaluation Engine)</b>. Setiap kali Anda (atau personil lapangan) memasukkan data capaian baru pada indikator, sistem akan mengevaluasi batas bahaya/alert. Jika capaian kurang dari nilai batas, notifikasi dengan status <b>Peringatan / Kritis</b> langsung didistribusikan.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800">3. Hubungan ke Ekspor Laporan</h4>
                <p>
                  Seluruh penambahan aktivitas, sub-aktivitas, PIC pengerjaan, dan sejarah pergeseran nilai indikator real-time ini terintegrasi secara otomatis ke menu <b>Ekspor Laporan</b>. Anda dapat mencetak visualisasi tren ke PDF atau dokumen tabular Excel (CSV).
                </p>
              </div>

              <div className="p-4 bg-indigo-25 text-indigo-900 border border-indigo-100 rounded-xl">
                <span className="font-bold block mb-0.5">Struktur Database Siap-Supabase</span>
                <p className="text-[11px] leading-relaxed text-indigo-700">
                  Model entitas internal didesain khusus agar kompatibel dengan tabel relasional PostgreSQL (Supabase): <code className="font-mono bg-indigo-50 px-1 text-[10px] rounded">projects</code> ➔ <code className="font-mono bg-indigo-50 px-1 text-[10px] rounded">activities</code> ➔ <code className="font-mono bg-indigo-50 px-1 text-[10px] rounded">sub_activities</code>, dengan tabel relasi indikator terpisah.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Jurnal Refleksi & Pemantauan Isu Aktual NGO */}
      {activeSubTab === 'reflections' && (
        <div className="space-y-6">
          {/* Top Info Banner explaining NGO contextual monitoring */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold font-display text-emerald-900 text-base">
                Refleksi Proyek & Pemantauan Isu Aktual (NGO Focus)
              </h3>
              <p className="text-xs text-emerald-700 leading-relaxed max-w-4xl">
                Sebagai lembaga non-profit, transparansi, pembelajaran adaptif, dan respons cepat terhadap dinamika eksternal (sosial, regulasi, iklim) sangat krusial. Di sini Anda dapat memantau **Refleksi Pembelajaran (Lessons Learned)** demi kesinambungan jangka panjang, serta merekam **Isu Lapangan Terkini** beserta mitigasi cepatnya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* COLUMN 1: Refleksi & Pembelajaran */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg">
                    Jurnal Refleksi & Pembelajaran
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddReflectionForm(!showAddReflectionForm)}
                  className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all outline-hidden cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddReflectionForm ? 'Tutup Form' : 'Catat Refleksi Baru'}
                </button>
              </div>

              {/* Form Tambah Refleksi (Collapsible) */}
              {showAddReflectionForm && (
                <form onSubmit={handleAddReflection} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3.5 text-xs">
                  <div className="font-semibold text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    Tambah Catatan Pembelajaran Baru
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Kategori Refleksi:</label>
                      <select
                        value={newRefType}
                        onChange={(e: any) => setNewRefType(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 bg-white w-full focus:outline-emerald-500 text-xs font-bold text-slate-700"
                      >
                        <option value="Lesson Learnt">💡 Lesson Learn</option>
                        <option value="Success">🏆 Success</option>
                        <option value="Challenge">⚠️ Challenge</option>
                        <option value="Rekomendasi">📋 Rekomendasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Kategori Pembelajaran:</label>
                      <select
                        value={newRefCategory}
                        onChange={(e: any) => setNewRefCategory(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 bg-white w-full focus:outline-emerald-500 text-xs"
                      >
                        <option value="Kemitraan">Kemitraan / Pemda</option>
                        <option value="Teknis">Teknis / Metode Fisik</option>
                        <option value="Advokasi">Advokasi / Kebijakan</option>
                        <option value="Operasional">Operasional / Anggaran</option>
                        <option value="Eksternal">Faktor Sosial / Masyarakat</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Nama Kontributor / Staff:</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Andi (Field Officer)"
                        value={newRefContributor}
                        onChange={(e) => setNewRefContributor(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 bg-white w-full focus:outline-emerald-500 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Judul Ringkasan Refleksi:</label>
                    <input
                      type="text"
                      required
                      placeholder="Tuliskan intisari kesimpulan pembelajaran..."
                      value={newRefTitle}
                      onChange={(e) => setNewRefTitle(e.target.value)}
                      className="border border-slate-200 rounded-lg p-2 bg-white w-full font-semibold focus:outline-emerald-500 text-xs text-slate-750"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Deskripsi Kondisi & Latar Belakang Lapangan:</label>
                    <textarea
                      required
                      placeholder="Ceritakan peristiwa nyata di lapangan, kendala teknis atau peluang yang mendasari munculnya refleksi ini..."
                      value={newRefDescription}
                      onChange={(e) => setNewRefDescription(e.target.value)}
                      className="border border-slate-200 rounded-lg p-2 bg-white w-full h-20 focus:outline-emerald-500 text-xs text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-800 block mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" /> Rekomendasi Adaptif Ke Depan (RTL):
                    </label>
                    <textarea
                      required
                      placeholder="Tuliskan rekomendasi konkret dan taktis untuk penyesuaian metode kerja di sisa waktu proyek..."
                      value={newRefRecommendation}
                      onChange={(e) => setNewRefRecommendation(e.target.value)}
                      className="border border-emerald-200 rounded-lg p-2 bg-emerald-25/40 w-full h-16 focus:outline-emerald-500 text-xs text-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddReflectionForm(false)}
                      className="bg-slate-200 hover:bg-slate-250 text-slate-700 py-1.5 px-3 rounded-lg font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-4 rounded-lg font-bold cursor-pointer"
                    >
                      Simpan Ke Jurnal
                    </button>
                  </div>
                </form>
              )}

              {/* Filters for Reflections */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[11px] text-slate-400 font-semibold shrink-0">Filter Kategori:</span>
                {['Semua', 'Kemitraan', 'Teknis', 'Advokasi', 'Operasional', 'Eksternal'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterRefCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      filterRefCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List of Reflections */}
              <div className="space-y-4">
                {(project.lessonsLearned || [])
                  .filter((ll) => filterRefCategory === 'Semua' || ll.category === filterRefCategory)
                  .map((ll) => (
                    <div key={ll.id} className="bg-white rounded-2xl border border-slate-150 shadow-xs p-5 space-y-3 shrink-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                            ll.category === 'Kemitraan' ? 'bg-sky-50 text-sky-750 border border-sky-100' :
                            ll.category === 'Teknis' ? 'bg-purple-50 text-purple-755 border border-purple-100' :
                            ll.category === 'Advokasi' ? 'bg-amber-50 text-amber-750 border border-amber-100' :
                            ll.category === 'Operasional' ? 'bg-indigo-50 text-indigo-755 border border-indigo-100' :
                            'bg-teal-50 text-teal-755 border border-teal-100'
                          }`}>
                            {ll.category}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                            (ll.reflectionType || 'Lesson Learnt') === 'Success' ? 'bg-emerald-100 text-emerald-850 border border-emerald-200' :
                            (ll.reflectionType || 'Lesson Learnt') === 'Challenge' ? 'bg-rose-100 text-rose-850 border border-rose-200' :
                            (ll.reflectionType || 'Lesson Learnt') === 'Rekomendasi' ? 'bg-amber-100 text-amber-850 border border-amber-200' :
                            'bg-indigo-100 text-indigo-850 border border-indigo-200'
                          }`}>
                            {(ll.reflectionType || 'Lesson Learnt') === 'Lesson Learnt' ? '💡 Lesson Learn' :
                             (ll.reflectionType || 'Lesson Learnt') === 'Success' ? '🏆 Success' :
                             (ll.reflectionType || 'Lesson Learnt') === 'Challenge' ? '⚠️ Challenge' :
                             '📋 Rekomendasi'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ll.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteReflection(ll.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                          title="Hapus Jurnal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm leading-snug">
                        {ll.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {ll.description}
                      </p>

                      {/* Recommendation Box */}
                      <div className="bg-emerald-25/50 border border-emerald-100/50 p-3.5 rounded-xl flex items-start gap-2 text-xs">
                        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-emerald-800 block uppercase tracking-wide">Rekomendasi Tindak Lanjut:</span>
                          <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                            {ll.recommendation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold border-t pt-2 border-slate-50">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dokumentasi: <span className="text-slate-600 font-bold">{ll.contributor}</span></span>
                      </div>
                    </div>
                  ))}

                {(!project.lessonsLearned || project.lessonsLearned.filter((ll) => filterRefCategory === 'Semua' || ll.category === filterRefCategory).length === 0) && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-10 px-4 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <span className="text-xs font-semibold block text-slate-500">Belum Ada Catatan Refleksi</span>
                    <span className="text-[11px] text-slate-400">Tekan tombol 'Catat Refleksi Baru' di atas untuk menulis tantangan atau best practice baru.</span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: Feeding Isu Berkembang */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-1.5">
                    Feeding Isu Aktual & Taktis
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddIssueForm(!showAddIssueForm)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all outline-hidden cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddIssueForm ? 'Tutup Form' : 'Daftarkan Isu Lapangan'}
                </button>
              </div>

              {/* Form Tambah Isu Aktual (Collapsible) */}
              {showAddIssueForm && (
                <form onSubmit={handleAddIssue} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5 text-xs">
                  <div className="font-semibold text-slate-700 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Daftarkan Isu Lapangan Baru
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Klasifikasi Isu:</label>
                      <select
                        value={newIssCategory}
                        onChange={(e: any) => setNewIssCategory(e.target.value)}
                        className="border border-slate-200 rounded-lg p-2 bg-white w-full focus:outline-rose-500 text-xs"
                      >
                        <option value="Regulasi">Regulasi / Perizinan Publik</option>
                        <option value="Sosial/Masyarakat">Sosial / Dinamika Komunitas</option>
                        <option value="Media/Publik">Media / Sentimen Publik</option>
                        <option value="Kebijakan">Kebijakan Pemerintah Daerah</option>
                        <option value="Iklim/Alam">Iklim / Ekosistem Alam</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Tingkat Kerawanan Isu:</label>
                      <select
                        value={newIssSeverity}
                        onChange={(e: any) => setNewIssSeverity(e.target.value as any)}
                        className="border border-slate-200 rounded-lg p-2 bg-white w-full font-bold focus:outline-rose-500 text-xs"
                      >
                        <option value="Rendah">Rendah (Monitor berkala)</option>
                        <option value="Sedang">Sedang (Butuh penyesuaian)</option>
                        <option value="Tinggi">Tinggi (Berpotensi block progress)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Headline Isu / Kejadian:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gelombang pasang ekstrem merusak unit pembibitan Blok B..."
                      value={newIssHeadline}
                      onChange={(e) => setNewIssHeadline(e.target.value)}
                      className="border border-slate-200 rounded-lg p-2 bg-white w-full font-semibold focus:outline-rose-500 text-xs text-slate-750"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Deskripsi & Dampak Isu Terhadap Milestone:</label>
                    <textarea
                      required
                      placeholder="Garis besar permasalahan taktis di lapangan secara obyektif..."
                      value={newIssDescription}
                      onChange={(e) => setNewIssDescription(e.target.value)}
                      className="border border-slate-200 rounded-lg p-2 bg-white w-full h-20 focus:outline-rose-500 text-xs text-slate-705"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Rencana Taktis Mitigasi NGO:
                    </label>
                    <textarea
                      required
                      placeholder="Langkah antisipatif atau pendekatan persuasif yang segera dijalankan stakeholder demi mengamankan indicator proyek..."
                      value={newIssMitigation}
                      onChange={(e) => setNewIssMitigation(e.target.value)}
                      className="border border-rose-200 rounded-lg p-2 bg-rose-25/40 w-full h-16 focus:outline-rose-500 text-xs text-slate-705"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddIssueForm(false)}
                      className="bg-slate-200 hover:bg-slate-250 text-slate-700 py-1.5 px-3 rounded-lg font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-4 rounded-lg font-bold cursor-pointer"
                    >
                      Daftarkan Isu Baru
                    </button>
                  </div>
                </form>
              )}

              {/* Filter Severity for Issues */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[11px] text-slate-400 font-semibold shrink-0">Filter Kerawanan:</span>
                {['Semua', 'Tinggi', 'Sedang', 'Rendah'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilterIssSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                      filterIssSeverity === sev
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* List of Current Issues */}
              <div className="space-y-4">
                {(project.currentIssues || [])
                  .filter((iss) => filterIssSeverity === 'Semua' || iss.severity === filterIssSeverity)
                  .map((iss) => {
                    const isClosed = iss.status === 'Teratasi';
                    return (
                      <div
                        key={iss.id}
                        className={`bg-white rounded-2xl border p-5 space-y-3 transition-opacity ${
                          isClosed ? 'border-slate-150 opacity-60' : 'border-rose-150 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Severity Level indicators built professionally and clearly */}
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md flex items-center gap-1 ${
                              iss.severity === 'Tinggi' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              iss.severity === 'Sedang' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {!isClosed && iss.severity === 'Tinggi' && (
                                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping inline-block"></span>
                              )}
                              {iss.severity}
                            </span>
                            <span className="bg-slate-100 text-[9px] font-mono font-semibold text-slate-500 px-1.5 py-0.5 rounded-sm">
                              {iss.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(iss.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleIssueStatus(iss.id)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                isClosed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                  : 'bg-rose-550 hover:bg-rose-600 text-white border-transparent'
                              }`}
                              title={isClosed ? 'Ubah menjadi Aktif kembali' : 'Selesaikan Isu'}
                            >
                              {isClosed ? '✓ Teratasi' : 'Selesaikan'}
                            </button>
                            <button
                              onClick={() => handleDeleteIssue(iss.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                              title="Hapus Isu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className={`font-semibold text-slate-800 text-sm leading-snug ${isClosed ? 'line-through text-slate-400' : ''}`}>
                            {iss.headline}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {iss.description}
                          </p>
                        </div>

                        {/* Mitigation plan box */}
                        <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-start gap-2 text-xs">
                          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isClosed ? 'text-slate-300' : 'text-slate-500'}`} />
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-600 block uppercase tracking-wide">Pendekatan Mitigasi Lapangan:</span>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                              {iss.mitigation}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {(!project.currentIssues || project.currentIssues.filter((iss) => filterIssSeverity === 'Semua' || iss.severity === filterIssSeverity).length === 0) && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-10 px-4 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <span className="text-xs font-semibold block text-slate-500">Kondisi Lapangan Kondusif</span>
                    <span className="text-[11px] text-slate-400">Belum ada isu eksternal kritis terdaftar yang dapat mengganggu keberjalanan target proyek.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DETIL TAMBAH PROYEK (POPUP DIALOG) */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden leading-normal">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-450" />
                <h3 className="font-display font-bold text-sm sm:text-base text-white">Registrasi Proyek Baru (DFW Indonesia)</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Grup 1. Informasi Proyek */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    📋 Informasi Proyek Utama
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Proyek (ID): <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. SLD-LUWU"
                      value={pCode}
                      onChange={(e) => setPCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-sky-600 focus:bg-white text-slate-750 transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Proyek: <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Konservasi Terumbu Karang & Kelola Hutan Bakau"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-755 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dinas / Instansi Mitra:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dinas Kelautan dan Perikanan Daerah"
                      value={pDept}
                      onChange={(e) => setPDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Manajer Proyek (PIC Utama):</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. H. Abdul Rasyid, M.Si."
                      value={pManager}
                      onChange={(e) => setPManager(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lembaga Donor / Co-funder:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. JICA, USAID, Yayasan DFW Indonesia"
                      value={pDonor}
                      onChange={(e) => setPDonor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi Fokus Kegiatan:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kepulauan Selayar, Sulawesi Selatan"
                      value={pLocation}
                      onChange={(e) => setPLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Grup 2. Jadwal & Keuangan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    📊 Alokasi Keuangan & Jadwal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Alokasi Anggaran (Rp):</label>
                    <input 
                      type="number" 
                      value={pBudget}
                      onChange={(e) => setPBudget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-sky-600 focus:bg-white text-slate-705 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Mulai:</label>
                    <input 
                      type="date" 
                      value={pStartDate}
                      onChange={(e) => setPStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-sky-600 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estimasi Selesai:</label>
                    <input 
                      type="date" 
                      value={pEndDate}
                      onChange={(e) => setPEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 focus:outline-sky-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Grup 3. Deskripsi & Goal */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    🎯 Tujuan & Target Capaian Hasil
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Ringkas Kegiatan:</label>
                  <textarea 
                    rows={2}
                    placeholder="Deskripsikan program secara ringkas agar dinas dan tim eksekutif memahami esensinya..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-sky-600 focus:bg-white text-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tujuan Utama (Goal):</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Meningkatkan kelestarian hutan bakau dan kemandirian ekonomi nelayan pesisir"
                    value={pGoal}
                    onChange={(e) => setPGoal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-600">Target Hasil (Outcomes):</label>
                    <button 
                      type="button" 
                      onClick={handleModalAddOutcome}
                      className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Target Hasil</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {pOutcomes.map((outcome, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={`Outcome ${idx + 1} (e.g. Penanaman 5.000 bibit mangrove)`}
                          value={outcome}
                          onChange={(e) => handleModalUpdateOutcome(idx, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700 transition-colors"
                        />
                        <button 
                          type="button"
                          onClick={() => handleModalRemoveOutcome(idx)}
                          className="text-slate-400 hover:text-rose-500 p-2 cursor-pointer transition-colors"
                          title="Hapus outcome ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grup 3.5. Indikator Pemantauan Proyek */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 uppercase tracking-wide">
                    📈 Indikator Pemantauan Proyek
                  </span>
                  <button 
                    type="button" 
                    onClick={handleModalAddIndicator}
                    className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Indikator</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {pIndicators.map((ind, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 font-display">Indikator #{idx + 1}</span>
                        {pIndicators.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleModalRemoveIndicator(idx)}
                            className="text-slate-450 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            title="Hapus indikator ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Indikator:</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Jumlah Benih Mangrove Ditanam atau Persentase Sosialisasi"
                            value={ind.name}
                            onChange={(e) => handleModalUpdateIndicator(idx, 'name', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-sky-600 text-slate-700 transition-colors"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Angka:</label>
                          <input 
                            type="number" 
                            required
                            placeholder="e.g. 100"
                            value={ind.target}
                            onChange={(e) => handleModalUpdateIndicator(idx, 'target', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium focus:outline-sky-600 text-slate-700 transition-colors"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Satuan:</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. orang, event, %, dokumen"
                            value={ind.unit}
                            onChange={(e) => handleModalUpdateIndicator(idx, 'unit', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-sky-600 text-slate-700 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-100/60 flex items-start gap-2">
                <div className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0">💡 Note</div>
                <p className="leading-relaxed">
                  Proyek baru akan diinisiasi dengan <b>kemajuan fisik 0%</b>, menyertakan 1 aktivitas sosialisasi default, dan 1 indikator tingkat kehadiran demi validitas pemantauan dashboard. Anda dapat melengkapi aktivitas lainnya kapan pun melalui tab konfigurasi.
                </p>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
              <button 
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="bg-white border hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleCreateProject}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
              >
                Simpan Proyek Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
