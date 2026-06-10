import React, { useState } from 'react';
import { Project } from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Briefcase, 
  Info, 
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface ExportPanelProps {
  projects: Project[];
}

export default function ExportPanel({ projects }: ExportPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Helper: get project overall progress
  const calculateProjectProgress = (p: Project): number => {
    const totalWeight = p.activities.reduce((acc, curr) => acc + curr.weight, 0);
    if (totalWeight === 0) return 0;
    const weightedProgress = p.activities.reduce((acc, curr) => {
      return acc + (curr.progress * (curr.weight / totalWeight));
    }, 0);
    return Math.round(weightedProgress * 10) / 10;
  };

  const activeProjects = selectedFilter === 'ALL' 
    ? projects 
    : projects.filter(p => p.id === selectedFilter);

  // 1. Excel (CSV) generator
  const exportToExcelCSV = () => {
    // We will build a highly-formatted, professional table structure in CSV
    let csvContent = '\uFEFF'; // UTF-8 BOM to display Indonesian accents in Excel correctly
    
    // Header Info
    csvContent += 'LAPORAN MANAJERIAL KINERJA MULTI-PROYEK (REAL-TIME)\n';
    csvContent += `Tanggal Cetak:;${new Date().toLocaleString('id-ID')}\n`;
    csvContent += `Total Anggaran Portfolio:;Rp ${projects.reduce((acc, c) => acc + c.budget, 0).toLocaleString('id-ID')}\n`;
    csvContent += '\n';

    // 1. Projects General Summary sheet
    csvContent += 'RINGKASAN PORTFOLIO PROYEK\n';
    csvContent += 'Kode Proyek;Nama Proyek;Departemen/Instansi;Manajer Proyek;Status;Anggaran;Progress Fisik (%)\n';
    
    projects.forEach(p => {
      const prog = calculateProjectProgress(p);
      csvContent += `"${p.code}";"${p.name}";"${p.department}";"${p.manager}";"${p.status}";${p.budget};${prog}%\n`;
    });
    
    csvContent += '\n\n';

    // 2. Indicators Tracking Sheet
    csvContent += 'DETAIL METRIK PELACAKAN INDIKATOR CAPAIAN\n';
    csvContent += 'Kode Proyek;Proyek;Kode Indikator;Nama Indikator;Deskripsi;Satuan;Target;Pencapaian Saat Ini;Batas Bahaya (Threshold);Status Mutu;Update Terakhir\n';
    
    activeProjects.forEach(p => {
      p.indicators.forEach(ind => {
        const statusMutu = ind.currentAchievement >= ind.target 
          ? 'Melampaui Target' 
          : ind.currentAchievement >= ind.thresholdAlert 
            ? 'Aman / Sesuai Rencana' 
            : 'Kritis (Di Bawah Target)';
            
        csvContent += `"${p.code}";"${p.name}";"${ind.code}";"${ind.name}";"${ind.description.replace(/"/g, '""')}";"${ind.unit}";${ind.target};${ind.currentAchievement};${ind.thresholdAlert};"${statusMutu}";"${ind.lastUpdated}"\n`;
      });
    });

    csvContent += '\n\n';

    // 3. Detailed Work stream activities sheet
    csvContent += 'RINCIAN STRUKTUR KERJA (WBS) AKTIVITAS & SUB-AKTIVITAS\n';
    csvContent += 'Kode Proyek;Aktivitas Induk;Bobot (%);Progress Aktivitas;Nama Sub-Aktivitas;PIC Pelaksana;Tingkat Kemajuan (%);Status Pelaksanaan;Mulai Pekerjaan;Rencana Selesai\n';
    
    activeProjects.forEach(p => {
      p.activities.forEach(act => {
        if (act.subActivities.length > 0) {
          act.subActivities.forEach(sub => {
            csvContent += `"${p.code}";"${act.name}";${act.weight}%;${act.progress}%;"${sub.name}";"${sub.assignedTo}";${sub.progress}%;"${sub.status}";"${sub.startDate}";"${sub.endDate}"\n`;
          });
        } else {
          csvContent += `"${p.code}";"${act.name}";${act.weight}%;${act.progress}%;"No sub-activities allocated";"-";0%;"-";"-";"-"\n`;
        }
      });
    });

    csvContent += '\n\n';

    // 4. Lessons Learned & Reflections Sheet
    csvContent += 'CATATAN PEMBELAJARAN & REFLEKSI (LESSONS LEARNED)\n';
    csvContent += 'Kode Proyek;Proyek;Tanggal;Kategori;Tipe Refleksi;Judul Pembelajaran;Deskripsi/Refleksi;Rekomendasi Tindakan;Kontributor/PIC\n';

    activeProjects.forEach(p => {
      (p.lessonsLearned || []).forEach(ll => {
        const cleanTitle = (ll.title || '').replace(/"/g, '""');
        const cleanDesc = (ll.description || '').replace(/"/g, '""');
        const cleanRec = (ll.recommendation || '').replace(/"/g, '""');
        const cleanCat = (ll.category || '').replace(/"/g, '""');
        const cleanRefType = (ll.reflectionType || 'Lesson Learnt').replace(/"/g, '""');
        
        csvContent += `"${p.code}";"${p.name}";"${ll.date}";"${cleanCat}";"${cleanRefType}";"${cleanTitle}";"${cleanDesc}";"${cleanRec}";"${ll.contributor}"\n`;
      });
    });

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Monitoring_Indikator_${selectedFilter === 'ALL' ? 'Portofolio' : activeProjects[0]?.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerFeedback('Laporan Excel (format CSV kompatibel) berhasil diunduh!');
  };

  // Trigger feedback message
  const triggerFeedback = (msg: string) => {
    setExportSuccessMsg(msg);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 4500);
  };

  // 2. PDF (Browser Print) caller
  const handlePrintPDF = () => {
    triggerFeedback('Menyiapkan pratinjau cetak PDF... Mohon sesuaikan tujuan cetak ke "Simpan sebagai PDF" di jendela browser.');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Pusat Laporan & Ekspor Eksekutif
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Unduh berkas audit kinerja dalam format Excel atau simpan dokumen ringkasan visual menjadi berkas PDF formal untuk rapat manajerial.
        </p>
      </div>

      {feedbackMsgSection(exportSuccessMsg)}

      {/* Export Options Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 lg:col-span-1">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-base">Konfigurasi Cakupan Ekspor</h3>
            <p className="text-xs text-slate-400 mt-1">Tentukan cakupan data proyek yang ingin disematkan dalam laporan.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Filter Proyek:</label>
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-lg block w-full p-2.5 font-bold text-slate-700 focus:outline-sky-600 cursor-pointer"
              >
                <option value="ALL">Semua Proyek (Laporan Portofolio)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name.substring(0, 30)}...</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Info className="w-4 h-4 text-sky-500" /> Informasi Berkas:
              </span>
              <p className="leading-relaxed">
                Unduhan <b>Excel (.csv)</b> memisahkan ringkasan proyek, progres aktivitas komunal, dan daftar melintang indikator capaian mingguan agar mempermudah pengolahan Pivot Table.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {/* Download Excel */}
            <button 
              onClick={exportToExcelCSV}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4.5 h-4.5" />
              Ekspor ke Excel (.CSV)
            </button>

            {/* Click PDF */}
            <button 
              onClick={handlePrintPDF}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors"
            >
              <FileText className="w-4.5 h-4.5" />
              Simpan / Cetak Laporan PDF
            </button>
          </div>
        </div>

        {/* Right Preview Card (What the PDF report looks like, also perfect print-target styles!) */}
        <div id="print-area" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6 print-container print-card">
          
          {/* Print Header inside the PDF mockup */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block tracking-wider">Laporan Kinerja Resmi</span>
              <h2 className="font-display font-extrabold text-slate-900 text-xl tracking-tight uppercase">
                Sistem Monitoring Indikator Proyek Komunike
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">YAYASAN DESTRUCTIVE FISHING WATCH (DFW) INDONESIA & MITRA KERJA</p>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              <span className="block font-bold text-slate-700">STATUS PORTOFOLIO</span>
              <span>Dibuat: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Portfolio Stats Block */}
          <div className="grid grid-cols-3 gap-4 py-1.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Cakupan Proyek</span>
              <span className="text-sm font-bold text-slate-800 font-display">
                {selectedFilter === 'ALL' ? `${projects.length} Proyek Terdaftar` : '1 Proyek Terpilih'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Anggaran Pagu</span>
              <span className="text-sm font-bold text-slate-800 font-display">
                Rp {Math.round(activeProjects.reduce((acc, c) => acc + c.budget, 0) / 100000000) / 10} Miliar
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Rata-rata Kemajuan</span>
              <span className="text-sm font-bold text-slate-800 font-display">
                {Math.round(activeProjects.reduce((acc, c) => acc + calculateProjectProgress(c), 0) / activeProjects.length)}% Progress
              </span>
            </div>
          </div>

          {/* Table List of Projects under this print filter scope */}
          <div className="space-y-6">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1 border-b pb-1">
                <Printer className="w-3.5 h-3.5 print-hidden" /> Status Kinerja Kerja Proyek
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-2 font-bold text-slate-600">Kode</th>
                      <th className="p-2 font-bold text-slate-700">Nama Intervensi Proyek</th>
                      <th className="p-2 font-bold text-slate-650 text-center">Fisik (%)</th>
                      <th className="p-2 font-bold text-slate-650 text-center">Status</th>
                      <th className="p-2 font-bold text-slate-650 text-right">Anggaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProjects.map(p => {
                      const progress = calculateProjectProgress(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2 font-mono font-bold text-slate-600">{p.code}</td>
                          <td className="p-2">
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400">Manajer: {p.manager}</p>
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-slate-700">{progress}%</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Sesuai Rencana' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              p.status === 'Beresiko' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-semibold text-slate-750">
                            Rp {p.budget.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print detail of each project's indicators */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
                Tindakan Rinci & Capaian Indikator Utama
              </h4>

              {activeProjects.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 print-break-inside-avoid">
                  <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    {p.code} - {p.name.substring(0,60)}...
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* List Indicators of this project */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Status Indikator Kerja</span>
                      {p.indicators.map(ind => {
                        const isBellow = ind.currentAchievement < ind.thresholdAlert;
                        return (
                          <div key={ind.id} className="bg-white p-2.5 rounded-lg border border-slate-250 flex justify-between items-center text-[11px] hover:border-slate-300">
                            <div>
                              <p className="font-bold text-slate-700 leading-tight">{ind.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Target: {ind.target} • Batas: {ind.thresholdAlert}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`font-mono font-bold text-xs ${isBellow ? 'text-rose-600 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded' : 'text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded'}`}>
                                {ind.currentAchievement}{ind.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* List Activities of this project */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Kemajuan Kerja Fisik / WBS</span>
                      {p.activities.map(act => (
                        <div key={act.id} className="bg-white p-2.5 rounded-lg border border-slate-250 flex items-center justify-between text-[11px] hover:border-slate-300">
                          <p className="font-semibold text-slate-700 leading-tight truncate max-w-[150px]">{act.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500">Bobot {act.weight}%</span>
                            <span className="font-mono font-bold text-slate-800">{act.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan Pembelajaran & Refleksi List */}
                  {p.lessonsLearned && p.lessonsLearned.length > 0 && (
                    <div className="border-t border-slate-200/80 pt-3.5 space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">
                        💡 Catatan Pembelajaran & Refleksi Lapangan
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {p.lessonsLearned.map(ll => (
                          <div key={ll.id} className="bg-white p-3 rounded-xl border border-slate-200/85 hover:border-slate-350 text-[11px] space-y-2 transition-all">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-800 font-display block leading-tight">
                                {ll.title}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider leading-none shrink-0 border ${
                                (ll.reflectionType || 'Lesson Learnt') === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                                (ll.reflectionType || 'Lesson Learnt') === 'Challenge' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                                (ll.reflectionType || 'Lesson Learnt') === 'Rekomendasi' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                                {ll.reflectionType || ll.category || 'Refleksi'}
                              </span>
                            </div>
                            
                            <p className="text-slate-500 font-medium leading-relaxed">
                              {ll.description}
                            </p>

                            {ll.recommendation && (
                              <div className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-dashed border-slate-200 text-[10px]">
                                <span className="font-extrabold text-slate-700 block uppercase tracking-wide text-[8px] mb-0.5">Rekomendasi Tindakan:</span>
                                <p className="text-slate-600 font-semibold italic">“{ll.recommendation}”</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[9px] text-slate-400 pt-0.5 font-mono">
                              <span>Kategori: {ll.category}</span>
                              <span>PIC: {ll.contributor}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formal signature blocks for high fidelity executive feel */}
            <div className="pt-8 grid grid-cols-2 gap-6 text-center text-xs border-t border-dashed border-slate-300 print-break-inside-avoid">
              <div>
                <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Dilaporkan Oleh:</p>
                <div className="h-16"></div> {/* Spacer for signature */}
                <p className="font-bold text-slate-800">Dian Permatasari, M.Si.</p>
                <p className="text-slate-500 font-mono text-[10px]">Manajer Pemantauan Portofolio</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Disetujui Oleh:</p>
                <div className="h-16"></div> {/* Spacer for signature */}
                <p className="font-bold text-slate-800">Ir. Ahmad Subagio, M.T.</p>
                <p className="text-slate-500 font-mono text-[10px]">Direktur Pelaksana / Pembina Program</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Function to assist feedback render to keep code beautiful
function feedbackMsgSection(msg: string | null) {
  if (!msg) return null;
  return (
    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center gap-2.5 animate-pulse text-sm font-semibold">
      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}
