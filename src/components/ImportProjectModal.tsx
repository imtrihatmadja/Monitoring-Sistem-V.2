import React, { useState, useRef } from 'react';
import { Project, ProjectIndicator } from '../types';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Clipboard, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Plus
} from 'lucide-react';

interface ImportProjectModalProps {
  onClose: () => void;
  onImport: (projects: Project[]) => void;
}

export default function ImportProjectModal({ onClose, onImport }: ImportProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedProjects, setParsedProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<{ row: number; field: string; message: string }[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template Headers & Dummies
  const headers = [
    'Kode Proyek',
    'Nama Proyek',
    'Mitra / Instansi',
    'Manajer / PIC',
    'Donor / Funder',
    'Lokasi Fokus',
    'Anggaran (Rp)',
    'Tanggal Mulai (YYYY-MM-DD)',
    'Tanggal Selesai (YYYY-MM-DD)',
    'Tujuan (Goal)',
    'Deskripsi Singkat',
    'Target Outcomes (Pisahkan dengan ;)',
    'Indikator (Format: Nama:Target:Satuan, Pisahkan dengan ;)'
  ];

  const dummyRow = [
    'SIAP-2026',
    'Program Rehabilitasi Pesisir Selayar',
    'Dinas Kelautan dan Perikanan',
    'Andi Wijaya, S.Pi',
    'World Bank & DFW',
    'Kepulauan Selayar, Sulawesi Selatan',
    '750000000',
    '2026-02-01',
    '2026-12-31',
    'Mengembalikan fungsi ekologis hutan bakau pesisir',
    'Proyek rehabilitasi lingkungan di wilayah pesisir melalui pembibitan dan penanaman mangrove.',
    'Pembibitan 10.000 bibit mangrove; Pelatihan 5 kelompok tani nelayan',
    'Jumlah Bibit Mangrove Ditanam:10000:pohon; Tingkat Kelulusan Pelatihan:85:%'
  ];

  // Excel CSV file Generation
  const downloadCSVEnergy = () => {
    // Generate content separated by semicolon to prevent issue with Indonesian Excel decimal separators
    const csvContent = "\uFEFF" + [
      headers.join(';'),
      dummyRow.join(';'),
      'BAIT-OFF;Bait-Free Sustainable Fisheries;Kementerian Kelautan;Dr. Abdul Gani;JICA;Bitung, Sulawesi Utara;1200000000;2026-03-10;2026-09-30;Meningkatkan kepatuhan nelayan lokal;Pelaksanaan uji tanding alat pancing ramah lingkungan bebas umpan hidup.;Sosialisasi di 5 pelabuhan;Jumlah Nelayan Terlibat:250:orang;Peningkatan Kepatuhan:80:%'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Import_Proyek_DFW.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy template format to clipboard
  const handleCopyTemplate = () => {
    const tsvContent = [
      headers.join('\t'),
      dummyRow.join('\t')
    ].join('\n');

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  // Advanced Parser for CSV or TSV (from Copy Paste)
  const parseData = (text: string, isPasteMode: boolean) => {
    if (!text.trim()) {
      setParsedProjects([]);
      setErrors([]);
      return;
    }

    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return;

    // Detect separator
    // Excel copy paste usually yields TSV (tabs)
    // CSV files can be semicolon or comma
    let delimiter = '\t';
    if (!isPasteMode) {
      const firstLine = lines[0];
      if (firstLine.includes(';')) {
        delimiter = ';';
      } else if (firstLine.includes(',')) {
        delimiter = ',';
      }
    } else {
      // If paste mode doesn't contain tabs, but has semicolons or commas
      const sample = lines[0];
      if (!sample.includes('\t')) {
        if (sample.includes(';')) delimiter = ';';
        else if (sample.includes(',')) delimiter = ',';
      }
    }

    const parsedList: Project[] = [];
    const errorList: { row: number; field: string; message: string }[] = [];

    // Helper parser line respecting quotes
    const parseLine = (line: string, delim: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Check if first line is header
    let startIndex = 0;
    const firstColumns = parseLine(lines[0], delimiter);
    const looksLikeHeader = firstColumns.some(col => 
      col.toLowerCase().includes('kode') || 
      col.toLowerCase().includes('code') || 
      col.toLowerCase().includes('nama') || 
      col.toLowerCase().includes('project')
    );

    if (looksLikeHeader) {
      startIndex = 1;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = parseLine(lines[i], delimiter);
      // Skip empty row
      if (cols.length === 1 && cols[0] === '') continue;

      const pCodeRaw = cols[0] || '';
      const pNameRaw = cols[1] || '';

      if (!pCodeRaw) {
        errorList.push({
          row: i + 1,
          field: 'Kode Proyek',
          message: 'Kode Proyek wajib diisi pada Kolom 1.'
        });
        continue;
      }

      if (!pNameRaw) {
        errorList.push({
          row: i + 1,
          field: 'Nama Proyek',
          message: 'Nama Lengkap Proyek wajib diisi pada Kolom 2.'
        });
        continue;
      }

      // Read values or template defaults
      const code = pCodeRaw.toUpperCase().trim();
      const name = pNameRaw.trim();
      const department = cols[2]?.trim() || 'Dinas / Departemen Eksternal';
      const manager = cols[3]?.trim() || 'Staff Pelaksana';
      const donor = cols[4]?.trim() || 'Yayasan DFW Indonesia';
      const location = cols[5]?.trim() || 'Indonesia';
      
      // Clean budget string
      const budgetStr = cols[6] || '0';
      const budgetCleaned = Number(budgetStr.replace(/[^0-9.-]+/g, "")) || 0;

      const startDate = cols[7]?.trim() || todayStr;
      const endDate = cols[8]?.trim() || (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().split('T')[0];
      })();
      
      const goal = cols[9]?.trim() || 'Menyelesaikan seluruh target fisik tepat waktu.';
      const description = cols[10]?.trim() || 'Tidak ada deskripsi rinci proyek.';

      // Parse Outcomes list split by semicolon
      const outcomesRaw = cols[11] || '';
      const outcomes = outcomesRaw
        ? outcomesRaw.split(';').map(o => o.trim()).filter(o => o.length > 0)
        : ['Mencapai target sosialisasi fisik program'];

      // Parse Indicators
      const indicatorsRaw = cols[12] || '';
      const rawIndicators = indicatorsRaw ? indicatorsRaw.split(';') : [];
      
      const indicators: ProjectIndicator[] = rawIndicators.map((indStr, indIdx) => {
        const parts = indStr.split(':');
        const indName = parts[0]?.trim() || `Indikator Keberhasilan ${indIdx + 1}`;
        const indTargetStr = parts[1]?.trim() || '100';
        const indTarget = Number(indTargetStr) || 100;
        const indUnit = parts[2]?.trim() || '%';

        return {
          id: `ind-${Date.now()}-${i}-${indIdx + 1}`,
          name: indName,
          code: `IND-${code}-${indIdx + 1}`,
          description: `Pelacakan indikator: ${indName}`,
          unit: indUnit,
          target: indTarget,
          currentAchievement: 0,
          thresholdAlert: Math.round(indTarget * 0.8),
          lastUpdated: todayStr,
          history: [{ date: 'Initial', achievement: 0, target: indTarget }]
        };
      });

      // If no indicators are specified, provide a default indicator to prevent crash
      if (indicators.length === 0) {
        indicators.push({
          id: `ind-${Date.now()}-${i}-1`,
          name: 'Tingkat Kehadiran & Partisipasi Sosialisasi',
          code: `IND-${code}-1`,
          description: 'Pelacakan indikator: Tingkat Kehadiran & Partisipasi Sosialisasi',
          unit: '%',
          target: 95,
          currentAchievement: 0,
          thresholdAlert: 76,
          lastUpdated: todayStr,
          history: [{ date: 'Initial', achievement: 0, target: 95 }]
        });
      }

      // Setup default activities structure
      const project: Project = {
        id: `proj-${Date.now()}-${i}-${Math.round(Math.random() * 1000)}`,
        name,
        code,
        department,
        manager,
        status: 'Sesuai Rencana',
        startDate,
        endDate,
        budget: budgetCleaned,
        budgetRealization: 0,
        description,
        location,
        pic: manager,
        donor,
        goal,
        outcomes,
        priorityIssue: 'Belum ada prioritas isu utama terdeklarasikan.',
        metrics: {
          beneficiaries: '100 Penerima Manfaat',
          events: '5 Pertemuan',
          documents: '2 Laporan',
          weight: '0 Kg'
        },
        activities: [
          {
            id: `act-${Date.now()}-${i}-1`,
            name: 'Inisiasi Program & Sosialisasi Awal',
            weight: 100,
            progress: 0,
            subActivities: [
              {
                id: `sub-${Date.now()}-${i}-1-1`,
                name: 'Sosialisasi program kepada Pokja dan Kelompok Penerima Manfaat',
                assignedTo: manager,
                progress: 0,
                status: 'Belum Mulai',
                startDate: startDate,
                endDate: endDate
              }
            ]
          }
        ],
        indicators,
        lessonsLearned: [],
        currentIssues: []
      };

      parsedList.push(project);
    }

    setParsedProjects(parsedList);
    setErrors(errorList);
  };

  // Handle textarea change
  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteText(text);
    parseData(text, true);
  };

  // Handle file uploads (CSV parsing)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseData(text, false);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (parsedProjects.length === 0) return;
    onImport(parsedProjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto leading-normal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-white tracking-tight">Impor Bulk Proyek (Excel / CSV)</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Tambah banyak proyek rill DFW Indonesia secara instan dalam 1 klik.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all bg-slate-900 hover:bg-slate-800 p-2 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick instructions & template downloader */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4.5 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            <div className="space-y-1.5 max-w-xl">
              <h4 className="text-slate-850 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="p-1 bg-sky-200/60 rounded-md inline-block">📦</span> Panduan Format Berkas / Excel Anda
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                Sistem kami mendukung copy-paste baris Excel secara langsung. Gunakan urutan kolom berikut dari kiri ke kanan:
              </p>
              <div className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2 font-mono scrollbar-thin overflow-x-auto whitespace-nowrap">
                KodeProyek | NamaProyek | Mitra | Manajer | Donor | Lokasi | Anggaran | TglMulai | TglSelesai | Goal | Deskripsi | Outcomes | Indikator
              </div>
              <p className="text-[10px] text-slate-450 font-medium leading-normal">
                💡 <b>Indikator</b> diisi dengan format: <code className="bg-slate-100 text-slate-600 px-1 rounded">NamaIndikator:Target:Satuan</code> (misal: <code className="bg-slate-100 text-sky-700 px-1 rounded font-bold font-mono">Partisipasi Nelayan:95:%</code>). Pisahkan beberapa indikator dengan titik koma (<code className="font-bold">;</code>).
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-[11px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Clipboard className="w-4 h-4 text-slate-500" />
                <span>{copySuccess ? '✓ Tersalin!' : 'Salin Format Excel'}</span>
              </button>

              <button
                type="button"
                onClick={downloadCSVEnergy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Template .CSV</span>
              </button>
            </div>
          </div>

          {/* Tab selector for paste vs file upload */}
          <div className="border-b border-slate-200">
            <nav className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`py-3 px-1 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${activeTab === 'paste' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-650'}`}
              >
                📝 Opsi A: Paste langsung dari Excel (Rekomendasi)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-3 px-1 text-xs font-bold uppercase tracking-wider relative transition-all cursor-pointer ${activeTab === 'upload' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-650'}`}
              >
                📤 Opsi B: Unggah Berkas .CSV / .TXT
              </button>
            </nav>
          </div>

          {/* Conditional Input UI elements */}
          {activeTab === 'paste' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Paste Baris Kolom Excel Di Sini:</label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={handlePasteChange}
                placeholder="Buka file Excel Anda, seleksi tabel data proyek yang ingin Anda impor, klik Ctrl+C (Copy), lalu klik di sini dan tekan Ctrl+V (Paste)..."
                className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-sky-600 rounded-2xl p-4 text-xs font-mono leading-relaxed placeholder-slate-400 text-slate-700 shadow-inner"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">Pilih Berkas CSV Kompatibel:</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-250 hover:border-sky-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50/20 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 bg-sky-100 text-sky-600 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Klik atau Seret Berkas ke Area Ini</span>
                  <span className="text-[11px] text-slate-400">Berkas berekstensi .csv atau .txt beralas pemisah tab / titik-koma.</span>
                </div>
                {fileName && (
                  <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-sky-100 block max-w-xs truncate">
                    📄 {fileName}
                  </span>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {/* Live Preview of parsed items */}
          {parsedProjects.length > 0 && (
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md inline-block">✓</span> Preview Proyek Terbaca ({parsedProjects.length} Proyek)
                </h5>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-sm border border-emerald-100">Siap Diimpor</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse bg-white">
                  <thead className="bg-slate-900 text-white sticky top-0">
                    <tr>
                      <th className="p-2.5 font-bold">Kode</th>
                      <th className="p-2.5 font-bold">Nama Proyek</th>
                      <th className="p-2.5 font-bold">Mitra</th>
                      <th className="p-2.5 font-bold">Manajer</th>
                      <th className="p-2.5 font-bold">Anggaran</th>
                      <th className="p-2.5 font-bold">Lokasi</th>
                      <th className="p-2.5 font-bold">Indikator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {parsedProjects.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-2.5 font-mono font-bold text-slate-850">{p.code}</td>
                        <td className="p-2.5 font-semibold text-slate-800 truncate max-w-[200px]" title={p.name}>{p.name}</td>
                        <td className="p-2.5 truncate max-w-[120px]" title={p.department}>{p.department}</td>
                        <td className="p-2.5">{p.manager}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-600">Rp {p.budget.toLocaleString('id-ID')}</td>
                        <td className="p-2.5">{p.location}</td>
                        <td className="p-2.5" title={`${p.indicators.length} indikator terdeteksi`}>
                          <span className="bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {p.indicators.length} Indikator
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parsed Errors & Warnings */}
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-100/60 text-rose-850 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-rose-800">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Format Baris Tidak Valid ({errors.length} Baris Diabaikan)</span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc pl-5 font-semibold text-rose-700/90 leading-relaxed">
                {errors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>
                    Baris {err.row}: <b>{err.field}</b> - {err.message}
                  </li>
                ))}
                {errors.length > 5 && (
                  <li>Dan {errors.length - 5} baris kesalahan lainnya... Mohon cek kelengkapan data.</li>
                )}
              </ul>
            </div>
          )}

          {/* Empty state instruction inside popup if nothing entered yet */}
          {parsedProjects.length === 0 && errors.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <span className="text-xs font-bold block text-slate-500">Belum Ada Data Terbaca</span>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Gunakan template Excel yang kami sediakan di kanan atas agar kolom Anda terbaca secara akurat oleh parser otomatis.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-705 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedProjects.length === 0}
            className={`font-semibold font-display text-xs py-2.5 px-6 rounded-xl flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${parsedProjects.length > 0 ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/10 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Impor Massal {parsedProjects.length} Proyek Baru</span>
          </button>
        </div>

      </div>
    </div>
  );
}
