import React, { useState } from 'react';
import { Project, SystemAlert } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowRight,
  ShieldAlert,
  BellRing,
  Activity as ActivityIcon
} from 'lucide-react';

interface ExecutiveDashboardProps {
  projects: Project[];
  alerts: SystemAlert[];
  onSelectProject: (projectId: string) => void;
  onNavigate: (tab: string) => void;
  onMarkAllAlertsRead: () => void;
}

export default function ExecutiveDashboard({ 
  projects, 
  alerts, 
  onSelectProject, 
  onNavigate,
  onMarkAllAlertsRead
}: ExecutiveDashboardProps) {

  // Colors for Budget distribution pie chart
  const COLOR_PALETTE = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // 1. Calculate aggregated indicators
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  
  // Calculate average progress based on activity weights
  const calculateProjectOverallProgress = (project: Project): number => {
    const totalWeight = project.activities.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedProgress = project.activities.reduce((acc, curr) => {
      return acc + (curr.progress * (curr.weight / totalWeight));
    }, 0);
    return Math.round(weightedProgress * 10) / 10;
  };

  const avgProgress = projects.length > 0 ? Math.round(
    projects.reduce((acc, curr) => acc + calculateProjectOverallProgress(curr), 0) / projects.length
  ) : 0;

  const activeAlerts = alerts.filter(a => !a.read);
  const criticalAlertsCount = alerts.filter(a => a.type === 'critical').length;

  // 2. Prepare charts data
  // Project performance comparison
  const projectComparisonData = projects.map(p => {
    const progress = calculateProjectOverallProgress(p);
    // Average achievement of indicators
    const avgIndicatorAchievement = p.indicators.length > 0 
      ? Math.round(p.indicators.reduce((acc, curr) => acc + curr.currentAchievement, 0) / p.indicators.length)
      : 0;
    return {
      name: p.code,
      progress: progress,
      indikator: avgIndicatorAchievement,
      fullName: p.name
    };
  });

  // Budget distribution data
  const budgetDistributionData = projects.map(p => ({
    name: p.code,
    value: p.budget,
    formattedBudget: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.budget)
  }));

  // Identify worst performing indicators currently (below threshold alert)
  const criticalIndicatorsList = projects.flatMap(p => 
    p.indicators
      .filter(i => i.currentAchievement < i.thresholdAlert)
      .map(i => ({
        projectName: p.name,
        projectId: p.id,
        projectCode: p.code,
        indicatorName: i.name,
        current: i.currentAchievement,
        unit: i.unit,
        target: i.target,
        threshold: i.thresholdAlert,
        status: p.status
      }))
  );

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-105 p-8 sm:p-14 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <Briefcase className="w-8 h-8 text-sky-600" />
        </div>
        <h2 className="font-display font-black text-slate-800 text-xl sm:text-2xl tracking-tight">Kondisi Database Kosong Total</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed max-w-md mx-auto font-medium">
          Semua data bawaan demo berhasil dibersihkan dari sistem. Anda berada di dashboard yang sepenuhnya baru dan siap mendukung pemantauan real-time proyek program nyata <b>DFW Indonesia</b>.
        </p>
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onNavigate('projects')} 
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-600/20 active:scale-95"
          >
            <span>Tambah Proyek Pertama Anda ➔</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div id="metric-budget" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-display">Total Anggaran Portofolio</p>
            <h3 className="text-xl font-bold font-display text-slate-800 mt-0.5">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalBudget)}
            </h3>
            <span className="text-xs text-sky-600 font-medium font-display flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block animate-pulse"></span>
              {projects.length} Proyek Aktif
            </span>
          </div>
        </div>

        {/* Avg Progress Card */}
        <div id="metric-progress" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-display">Rata-rata Progress Fisik</p>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-0.5">
              {avgProgress}%
            </h3>
            <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full" 
                style={{ width: `${avgProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Active Alerts Card */}
        <div id="metric-alerts" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activeAlerts.length > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-display">Notifikasi Belum Dibaca</p>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-0.5">
              {activeAlerts.length} Peringatan
            </h3>
            {activeAlerts.length > 0 ? (
              <button 
                onClick={onMarkAllAlertsRead}
                className="text-xs text-amber-600 font-medium hover:underline mt-1 block text-left"
              >
                Tandai semua dibaca
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                Sistem Aman & Kondusif
              </span>
            )}
          </div>
        </div>

        {/* Critical Indicators Card */}
        <div id="metric-critical" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-slate-200 transition-colors">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${criticalIndicatorsList.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-display">Indikator Kritis</p>
            <h3 className="text-2xl font-bold font-display text-slate-800 mt-0.5">
              {criticalIndicatorsList.length} Capaian
            </h3>
            <span className={`text-xs font-medium font-display flex items-center gap-1 mt-1 ${criticalIndicatorsList.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {criticalIndicatorsList.length > 0 ? 'Butuh Penanganan Segera' : 'Semua di Atas Batas Aman'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project performance Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-lg">Perbandingan Progress Fisik vs Indikator Capaian</h3>
              <p className="text-xs text-slate-400 mt-0.5">Membandingkan kemajuan pengerjaan proyek fisik dengan nilai rata-rata indikator kinerja utama (%)</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectComparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  formatter={(value) => [`${value}%`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="progress" name="Progress Konstruksi/Fisik" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="indikator" name="Rata-rata Capaian Indikator" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-slate-800 text-lg">Distribusi Anggaran</h3>
            <p className="text-xs text-slate-400 mt-0.5">Proporsi pembagian pagu anggaran per proyek dalam portofolio</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {budgetDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [
                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value), 
                    'Anggaran'
                  ]}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text inside Donut Chart */}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Total Anggaran</span>
              <span className="text-sm font-bold text-slate-800 font-display">
                Rp {Math.round(totalBudget / 1000000000 * 10) / 10} M
              </span>
            </div>
          </div>
          {/* Legend Table */}
          <div className="mt-2 space-y-2 max-h-24 overflow-y-auto pr-1">
            {projects.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}></span>
                  <span className="text-slate-600 font-medium truncate max-w-[120px]">{p.code}</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px] shrink-0">
                  Rp {Math.round(p.budget / 100000000 * 10) / 10} Jt
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Critical Indicators & Recent Alert Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Indicators List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Indikator Kritis Di Bawah Target
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Indikator dengan tingkat capaian di bawah target peringatan (Threshold Alert %)</p>
              </div>
              <span className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 text-xs rounded-full">
                {criticalIndicatorsList.length} Isu
              </span>
            </div>

            {criticalIndicatorsList.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2 space-y-2 mt-2">
                {criticalIndicatorsList.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3 group first:pt-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px] items-center rounded-sm font-mono font-bold shrink-0">
                          {item.projectCode}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-700 truncate">{item.indicatorName}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.projectName}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold font-mono text-rose-600">{item.current}</span>
                        <span className="text-[10px] text-slate-400">/ target {item.target}{item.unit}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-semibold bg-rose-50 text-rose-700 px-1 py-0.2 rounded-sm border border-rose-100">
                        Batas Aman {item.threshold}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-100 rounded-xl mt-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-600 font-display">Semua Indikator Berjalan Prima!</p>
                <p className="text-xs text-slate-400 text-center max-w-[280px] mt-1">Seluruh indikator capaian berada di atas batas peringatan minimum proyek masing-masing.</p>
              </div>
            )}
          </div>
          
          {criticalIndicatorsList.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center bg-sky-50/50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold leading-tight">Gunakan detail proyek untuk memperbarui progress.</span>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-xs text-sky-700 font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              >
                Atasi Isu <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Real-time Project Status and Recent Alert Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-500" />
                Log Peringatan Otomatis Real-Time
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Deteksi anomali performa indikator saat jatuh di bawah baseline target</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-xl border flex gap-3 transition-colors ${
                    alert.read 
                      ? 'bg-slate-50 border-slate-100 text-slate-500 opacity-75' 
                      : alert.type === 'critical'
                        ? 'bg-rose-50/70 border-rose-100 text-slate-800'
                        : 'bg-amber-50/70 border-amber-100 text-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.type === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {alert.type === 'critical' ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">
                        {alert.type === 'critical' ? 'Kritis' : 'Peringatan'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{alert.indicatorName}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400">Capaian: <b className="text-slate-700">{alert.currentValue}{alert.unit}</b></span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-400">Batas: <b className="text-slate-700">{alert.targetValue}{alert.unit}</b></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-100 rounded-xl">
                <BellRing className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-slate-600 font-display">Belum Ada Riwayat Notifikasi</p>
                <p className="text-xs text-slate-400 text-center max-w-[260px] mt-1">Perbarui data indikator secara manual di detil proyek untuk memicu sistem deteksi.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Status Ticker Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-lg">Portofolio Proyek Terdaftar (NGO ME Tools)</h3>
          <p className="text-xs text-slate-400 mt-1">Sistem kartu termonitoring lengkap mencakup status, lokasi, penanggung jawab, donor, and persentase serapan anggaran.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {projects.map((p) => {
            const progress = calculateProjectOverallProgress(p);
            
            // Standard Status Colors
            let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100'; // Aktif atau Selesai
            if (p.status === 'Beresiko') statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
            if (p.status === 'Kritis') statusColor = 'bg-rose-50 text-rose-700 border-rose-100'; // Terlambat

            // Standard Progress Quality Labels (Kualitas Progres)
            let qLabel = 'Perlu Perhatian';
            let qColor = 'bg-rose-50 text-rose-700 border-rose-100';
            let qProgressColor = 'bg-rose-500';

            if (progress >= 90) {
              qLabel = 'Sangat Baik';
              qColor = 'bg-emerald-50 text-emerald-750 border-emerald-150';
              qProgressColor = 'bg-emerald-500';
            } else if (progress >= 70) {
              qLabel = 'Baik';
              qColor = 'bg-sky-50 text-sky-750 border-sky-150';
              qProgressColor = 'bg-sky-500';
            } else if (progress >= 50) {
              qLabel = 'Sedang';
              qColor = 'bg-amber-50 text-amber-750 border-amber-150';
              qProgressColor = 'bg-amber-500';
            }

            // Budget Values Mapping
            const formatRupiah = (val: number) => {
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(val);
            };

            const budgetApproved = p.budget;
            const realization = p.budgetRealization || Math.round(p.budget * 0.78);
            const serapanPct = Math.round((realization / budgetApproved) * 100);

            // Metadata field fallbacks
            const locationVal = p.location || 'Kepulauan Luwu, Sulawesi Selatan';
            const picVal = p.pic || p.manager;
            const donorVal = p.donor || 'USAID / DFW-I';
            const goalVal = p.goal || p.description;
            const outcomesList = p.outcomes || [
              'Penyaluran fasilitas sarana dan prasarana kemasyarakatan terpenuhi.',
              'Kompensasi dan analisis dampak lingkungan terlaksana sesuai SOP.'
            ];
            const prioritizedIssueVal = p.priorityIssue || 'Keterbatasan jadwal kordinasi teknis desa setempat.';

            return (
              <div 
                key={p.id} 
                onClick={() => onSelectProject(p.id)}
                className="bg-white rounded-xl border border-slate-150 hover:border-sky-350 cursor-pointer shadow-sm hover:shadow-md group transition-all duration-300 transform hover:scale-[1.005] flex flex-col justify-between overflow-hidden"
              >
                {/* Header Kartu */}
                <div className="p-5 space-y-3 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-650">
                      {p.code}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {p.status === 'Sesuai Rencana' ? 'Aktif/Selesai' : p.status === 'Beresiko' ? 'Sedang' : 'Terlambat'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {p.name}
                  </h4>

                  {/* Metadata: Lokasi, PIC, Donor - Rounded Xl and clean typography */}
                  <div className="grid grid-cols-1 gap-1.5 text-[10.5px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>📍 <span className="font-bold text-slate-700">Lokasi:</span> {locationVal}</div>
                    <div>👤 <span className="font-bold text-slate-700">PIC:</span> {picVal.split(',')[0]}</div>
                    <div>📄 <span className="font-bold text-slate-700">Donor:</span> {donorVal}</div>
                  </div>
                </div>

                {/* Bar Progres */}
                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-b border-slate-150/75 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Kumulatif Progres Fisik</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${qColor}`}>
                      {progress}% {qLabel}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${qProgressColor}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Data Anggaran */}
                <div className="p-5 pt-3 pb-3 text-[11px] grid grid-cols-2 gap-3 border-b border-slate-150/75">
                  <div className="font-mono">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Anggaran Disetujui</span>
                    <span className="font-bold text-slate-800 text-xs">{formatRupiah(budgetApproved)}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Realisasi & Serapan</span>
                    <span className="font-bold text-slate-800 text-xs block">{formatRupiah(realization)}</span>
                    <span className="text-[9px] text-sky-700 font-bold bg-sky-50 border border-sky-100 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                      {serapanPct}% Serapan
                    </span>
                  </div>
                </div>

                {/* Hierarki Konten (Ikonografi): Goal, Outcomes, Isu */}
                <div className="p-5 pt-4 pb-4 space-y-3 font-sans text-xs">
                  {/* Goal (Biru) */}
                  <div className="space-y-1 p-3 bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100/60 rounded-xl transition-all">
                    <div className="font-bold text-blue-700 flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase">
                      <span>🎯</span>
                      <span>Goal Proyek</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {goalVal}
                    </p>
                  </div>

                  {/* Outcomes (Ungu) */}
                  <div className="space-y-1 p-3 bg-purple-50/40 hover:bg-purple-50/80 border border-purple-100/60 rounded-xl transition-all">
                    <div className="font-bold text-purple-700 flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase">
                      <span>🏆</span>
                      <span>Expected Outcomes</span>
                    </div>
                    <ul className="list-disc pl-4 text-[10.5px] text-slate-700 space-y-1 leading-normal font-medium">
                      {outcomesList.map((oc, idx) => (
                        <li key={idx}>{oc}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prioritas / Isu (Merah) */}
                  <div className="space-y-1 p-3 bg-rose-50/40 hover:bg-rose-50 border border-rose-100/60 rounded-xl transition-all">
                    <div className="font-bold text-rose-700 flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase">
                      <span>⚠️</span>
                      <span>Hambatan / Isu Kritis</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed italic">
                      {prioritizedIssueVal}
                    </p>
                  </div>
                </div>

                {/* Grid Metrik (Kaki Kartu) */}
                <div className="bg-slate-50 p-4 border-t border-slate-150 grid grid-cols-4 gap-2 text-center text-[10.5px] font-bold text-slate-600">
                  <div className="flex flex-col items-center justify-center bg-white p-1.5 rounded-lg border border-slate-100" title="Penerima Manfaat">
                    <span className="text-base mb-0.5">👥</span>
                    <span className="text-[9px] font-mono whitespace-nowrap block mt-0.5 font-bold text-slate-700">
                      {p.metrics?.beneficiaries.split(' ')[0] || '1.250'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-white p-1.5 rounded-lg border border-slate-100" title="Koordinasi / Event">
                    <span className="text-base mb-0.5">📅</span>
                    <span className="text-[9px] font-mono whitespace-nowrap block mt-0.5 font-bold text-slate-700">
                      {p.metrics?.events.split(' ')[0] || '12'} Ev
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-1.5 rounded-lg border border-slate-100" title="Dokumen Legal/Teknis">
                    <span className="text-base mb-0.5">📄</span>
                    <span className="text-[9px] font-mono whitespace-nowrap block mt-0.5 font-bold text-slate-700">
                      {p.metrics?.documents.split(' ')[0] || '8'} Doc
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-1.5 rounded-lg border border-slate-100" title="Debit Air / Berat Fisik">
                    <span className="text-base mb-0.5">⚖</span>
                    <span className="text-[9px] font-mono whitespace-nowrap block mt-0.5 font-bold text-slate-700">
                      {p.metrics?.weight || '4.5M'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
