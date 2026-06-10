import React, { useState } from 'react';
import { Project, CurrentIssue, LessonLearned } from '../types';
import { 
  FileText, 
  Users, 
  AlertTriangle, 
  Archive, 
  Briefcase, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Download, 
  UserCheck, 
  BarChart, 
  Layers,
  MapPin,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  X
} from 'lucide-react';

interface ExtraViewsProps {
  activeTab: string;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpdateProject?: (p: Project) => void;
}

interface Beneficiary {
  id: string;
  projectCode: string;
  activityName: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  origin: string;
  phone: string;
  occupation: string;
  age: number;
  notes: string;
  vulnerable: boolean;
}

export default function ExtraViews({ activeTab, projects, onSelectProject, onUpdateProject }: ExtraViewsProps) {
  // Database Penerima Manfaat State
  const [selectedProjFilter, setSelectedProjFilter] = useState<string>(''); // empty means All Projects
  const [beneficiarySearch, setBeneficiarySearch] = useState<string>('');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  
  // Manual Registration State Form
  const [mProjectCode, setMProjectCode] = useState<string>('');
  const [mActivityName, setMActivityName] = useState<string>('');
  const [mName, setMName] = useState<string>('');
  const [mGender, setMGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [mOrigin, setMOrigin] = useState<string>('');
  const [mPhone, setMPhone] = useState<string>('');
  const [mOccupation, setMOccupation] = useState<string>('');
  const [mAge, setMAge] = useState<number>(35);
  const [mNotes, setMNotes] = useState<string>('');
  const [mVulnerable, setMVulnerable] = useState<boolean>(false);

  // ================= FEEDING ISU AKTUAL STATES =================
  const [selectedIssueProj, setSelectedIssueProj] = useState<string>('all'); // 'all', 'external', or projectCode
  const [selectedIssueStatus, setSelectedIssueStatus] = useState<string>('all'); // 'all', 'Aktif', 'Teratasi'
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [editingIssue, setEditingIssue] = useState<any | null>(null); // for progress developments update
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  // New Issue Create Form State
  const [iAffiliation, setIAffiliation] = useState<string>('external'); // 'external' or project ID (e.g., 'proj-1')
  const [iSeverity, setISeverity] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [iCategory, setICategory] = useState<'Regulasi' | 'Sosial/Masyarakat' | 'Media/Publik' | 'Kebijakan' | 'Iklim/Alam'>('Kebijakan');
  const [iHeadline, setIHeadline] = useState<string>('');
  const [iDescription, setIDescription] = useState<string>('');
  const [iMitigation, setIMitigation] = useState<string>('');
  const [iNewsUrl, setINewsUrl] = useState<string>('');
  const [iNewsSource, setINewsSource] = useState<string>('');
  const [iDevelopments, setIDevelopments] = useState<string>('');

  // Update Status / Progress developments State
  const [uStatus, setUStatus] = useState<'Aktif' | 'Teratasi'>('Aktif');
  const [uDevelopments, setUDevelopments] = useState<string>('');
  const [uMitigation, setUMitigation] = useState<string>('');

  // Local storage external issues state
  const [externalIssues, setExternalIssues] = useState<CurrentIssue[]>(() => {
    const saved = localStorage.getItem('monitoring_external_issues');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ext-1',
        date: '2026-06-08',
        severity: 'Sedang',
        category: 'Kebijakan',
        headline: 'Implementasi Aturan Penangkapan Ikan Terukur (PIT) Ditolak Asosiasi Nelayan Tradisional',
        description: 'Kebijakan kuota penangkapan kuantitatif dinilai mendiskriminasi nelayan kecil skala tradisional di perbatasan WPP 718 Kelautan.',
        mitigation: 'DFW Indonesia melakukan advokasi regulasi dampingan bersama Serikat Nelayan agar kuota khusus nelayan lokal dijamin tanpa biaya tambahan.',
        status: 'Aktif',
        newsUrl: 'https://kkp.go.id/artikel/42681-kkp-penerapan-penangkapan-ikan-terukur-berbasis-kuota-mulai-2025',
        newsSource: 'Humas KKP RI',
        developments: '08 Juni 2026: Menggelar Focus Group Discussion bersama perwakilan KKP dan DPP HNSI di Merauke untuk draf kesepakatan jaminan nelayan lokal.'
      },
      {
        id: 'ext-2',
        date: '2026-06-06',
        severity: 'Tinggi',
        category: 'Iklim/Alam',
        headline: 'Ancaman Pemutihan Karang (Coral Bleaching) Akibat Gelombang Panas Maritim di Indonesia Timur',
        description: 'Suhu permukaan air laut meningkat hingga mencapai 31.5°C di sekitar perairan Wakatobi dan Laut Banda secara mengkhawatirkan.',
        mitigation: 'Monitoring berkala dengan sensor suhu bawah air dan mempercepat transplantasi karang tahan panas (heat-resistant thermal strains).',
        status: 'Aktif',
        newsUrl: 'https://news.detik.com/berita/d-7325608/suhu-laut-meningkat-terumbu-karang-indonesia-terancam-puso',
        newsSource: 'Detik News',
        developments: '07 Juni 2026: DFW menurunkan tim selam pemantau terumbu karang di kawasan zona penutupan sasi adat pulau Tomia.'
      }
    ];
  });

  // Sync external issues to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('monitoring_external_issues', JSON.stringify(externalIssues));
  }, [externalIssues]);

  // Initial rich database of beneficiaries 
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: 'ben-1',
      projectCode: 'SIPP-LUWU',
      activityName: 'Sosialisasi & Rembug Tani Desa',
      name: 'Irwan Wahyudi',
      gender: 'Laki-laki',
      origin: 'Kec. Bua, Luwu',
      phone: '081245678912',
      occupation: 'Petani Patih',
      age: 44,
      notes: 'Ketua Kelompok Tani Bua Mandiri',
      vulnerable: false
    },
    {
      id: 'ben-2',
      projectCode: 'SIPP-LUWU',
      activityName: 'Sosialisasi & Rembug Tani Desa',
      name: 'Herlina Susanti',
      gender: 'Perempuan',
      origin: 'Kec. Bajo, Luwu',
      phone: '081398765432',
      occupation: 'Buruh Tani & Pengolah Sagu',
      age: 39,
      notes: 'Keluarga rentan stunting, aktif mengurus PKK',
      vulnerable: true
    },
    {
      id: 'ben-3',
      projectCode: 'MANGROVE-RES',
      activityName: 'Pelatihan Pembibitan Mangrove & Sosialisasi',
      name: 'Rahmat Hidayat',
      gender: 'Laki-laki',
      origin: 'Trimulyo, Demak',
      phone: '085712345678',
      occupation: 'Nelayan Tangkap',
      age: 52,
      notes: 'Kehilangan 5m tambak akibat abrasi pesisir',
      vulnerable: true
    },
    {
      id: 'ben-4',
      projectCode: 'MANGROVE-RES',
      activityName: 'Pengolahan Hilir Sirup Mangrove Pidada',
      name: 'Siti Wardah',
      gender: 'Perempuan',
      origin: 'Bedono, Demak',
      phone: '081255554444',
      occupation: 'Pengolah Hasil Laut',
      age: 36,
      notes: 'Anggota Koperasi Mitra Wahana Mulia',
      vulnerable: false
    },
    {
      id: 'ben-5',
      projectCode: 'SABK-SAN',
      activityName: 'Instalasi MCK Komunal & Filter Pompa',
      name: 'Samuel Radja',
      gender: 'Laki-laki',
      origin: 'Kalabahi, Alor',
      phone: '082233445566',
      occupation: 'Petani Serabutan',
      age: 31,
      notes: 'Penerima MCK komunal sehat di wilayah krisis air',
      vulnerable: true
    },
    {
      id: 'ben-6',
      projectCode: 'SABK-SAN',
      activityName: 'Pembentukan Pengelola Air Komunal KPS-SM',
      name: 'Anjelina Ndolu',
      gender: 'Perempuan',
      origin: 'Alor Barat Daya, NTT',
      phone: '081198273645',
      occupation: 'Ibu Rumah Tangga',
      age: 28,
      notes: 'Anggota komite keuangan iuran warga',
      vulnerable: false
    },
    {
      id: 'ben-7',
      projectCode: 'HSP-2',
      activityName: 'Penyuluhan Air Bersih Terdistribusi',
      name: 'I Ketut Gde Wiratha',
      gender: 'Laki-laki',
      origin: 'Nusa Penida, Bali',
      phone: '085344445555',
      occupation: 'Pelaku Usaha Homestay',
      age: 46,
      notes: 'Penerima manfaat filter ultrafiltrasi air tawar',
      vulnerable: false
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Download Template Excel (.csv)
  const handleDownloadTemplate = () => {
    const headers = 'Project,Aktivitas,Nama,Jenis Kelamin,Asal,Handphone,Pekerjaan,Usia,Catatan\n';
    const sampleRows = [
      'SIPP-LUWU,Sosialisasi & Rembug Tani Desa,Budi Santoso,Laki-laki,Bua Luwu,08123456789,Petani,35,Aktif diskusi\n',
      'MANGROVE-RES,Penanaman Bibit Mangrove,Siti Rahma,Perempuan,Bedono Demak,08139876543,Ibu Rumah Tangga,42,Ketua kelompok perempuan\n'
    ].join('');
    
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_penerima_manfaat.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berhasil mengunduh template spreadsheet CSV!');
  };

  // 2. Export Excel Data (.csv)
  const handleExportCSV = () => {
    const headers = 'Project,Aktivitas,Nama,Jenis Kelamin,Asal,Handphone,Pekerjaan,Usia,Catatan\n';
    const activeCode = selectedProjFilter;
    const filtered = activeCode 
      ? beneficiaries.filter(b => b.projectCode.toLowerCase() === activeCode.toLowerCase())
      : beneficiaries;

    const csvContent = filtered.map(b => {
      const cleanProj = (b.projectCode || '').replace(/"/g, '""');
      const cleanAct = (b.activityName || '').replace(/"/g, '""');
      const cleanName = (b.name || '').replace(/"/g, '""');
      const cleanGen = b.gender;
      const cleanOrigin = (b.origin || '').replace(/"/g, '""');
      const cleanPhone = (b.phone || '').replace(/"/g, '""');
      const cleanJob = (b.occupation || '').replace(/"/g, '""');
      const cleanAge = b.age || 0;
      const cleanNotes = (b.notes || '').replace(/"/g, '""');

      return `"${cleanProj}","${cleanAct}","${cleanName}","${cleanGen}","${cleanOrigin}","${cleanPhone}","${cleanJob}",${cleanAge},"${cleanNotes}"`;
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = activeCode 
      ? `ekspor_penerima_manfaat_${activeCode.toLowerCase()}.csv`
      : 'ekspor_semua_penerima_manfaat.csv';
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Berhasil mengekspor ${filtered.length} baris data ke CSV!`);
  };

  // 3. Handle File Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        showToast('File kosong atau rusak!');
        return;
      }

      const rows = text.split('\n');
      if (rows.length <= 1) {
        showToast('Tidak ada baris data tambahan yang dideteksi!');
        return;
      }

      let importCount = 0;
      const parsedBeneficiaries: Beneficiary[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
        
        if (cols.length >= 3) {
          const projectCode = cols[0] || 'SIPP-LUWU';
          const activityName = cols[1] || 'Sosialisasi Program';
          const name = cols[2];
          if (!name) continue;

          const genderRaw = cols[3] || 'Laki-laki';
          const gender: 'Laki-laki' | 'Perempuan' = (genderRaw.toLowerCase().includes('perempuan') || genderRaw.toLowerCase() === 'p') ? 'Perempuan' : 'Laki-laki';
          
          const origin = cols[4] || 'Umum';
          const phone = cols[5] || '-';
          const occupation = cols[6] || 'Lainnya';
          const age = parseInt(cols[7]) || 30;
          const notes = cols[8] || '-';

          parsedBeneficiaries.push({
            id: `ben-imported-${Date.now()}-${importCount}`,
            projectCode,
            activityName,
            name,
            gender,
            origin,
            phone,
            occupation,
            age,
            notes,
            vulnerable: notes.toLowerCase().includes('rentan') || notes.toLowerCase().includes('miskin') || notes.toLowerCase().includes('stunting')
          });
          importCount++;
        }
      }

      if (parsedBeneficiaries.length > 0) {
        setBeneficiaries(prev => [...prev, ...parsedBeneficiaries]);
        showToast(`Berhasil mengimpor ${parsedBeneficiaries.length} data Penerima Manfaat!`);
      } else {
        showToast('Gagal memproses file. Pastikan format kolom sesuai dengan template.');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Handle Deletion
  const handleDeleteBeneficiary = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data penerima manfaat ini?')) {
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      showToast('Data berhasil dihapus dari database.');
    }
  };

  // 5. Handle Manual Form Submit
  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) {
      alert('Nama Penerima Manfaat wajib diisi!');
      return;
    }

    const newBen: Beneficiary = {
      id: `ben-manual-${Date.now()}`,
      projectCode: mProjectCode || (projects[0]?.code || 'UMUM'),
      activityName: mActivityName.trim() || 'Aktivitas Umum',
      name: mName.trim(),
      gender: mGender,
      origin: mOrigin.trim() || 'Internal DFW',
      phone: mPhone.trim() || '-',
      occupation: mOccupation.trim() || 'Lainnya',
      age: mAge || 35,
      notes: mNotes.trim() || '-',
      vulnerable: mVulnerable
    };

    setBeneficiaries(prev => [newBen, ...prev]);
    setShowManualModal(false);
    showToast(`Berhasil menambahkan "${mName}" secara manual!`);

    // Reset Form
    setMName('');
    setMActivityName('');
    setMPhone('');
    setMOrigin('');
    setMOccupation('');
    setMNotes('');
    setMVulnerable(false);
  };

  // ================= FEEDING ISU AKTUAL ACTIONS =================
  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iHeadline.trim() || !iDescription.trim()) {
      alert('Headline dan Deskripsi wajib diisi!');
      return;
    }

    const newIssue: CurrentIssue = {
      id: 'iss-manual-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      severity: iSeverity,
      category: iCategory,
      headline: iHeadline.trim(),
      description: iDescription.trim(),
      mitigation: iMitigation.trim() || 'Belum diisi - sedang dirumuskan oleh tim lapangan.',
      status: 'Aktif',
      newsUrl: iNewsUrl.trim() || undefined,
      newsSource: iNewsSource.trim() || undefined,
      developments: iDevelopments.trim() || undefined
    };

    if (iAffiliation === 'external') {
      setExternalIssues(prev => [newIssue, ...prev]);
      showToast('✓ Berhasil menambahkan Isu Eksternal baru!');
    } else {
      const proj = projects.find(p => p.id === iAffiliation);
      if (proj && onUpdateProject) {
        const updatedIssues = [newIssue, ...(proj.currentIssues || [])];
        onUpdateProject({
          ...proj,
          currentIssues: updatedIssues
        });
        showToast(`✓ Berhasil menambahkan Isu Lapangan untuk proyek ${proj.code}!`);
      }
    }

    // Reset Form
    setIHeadline('');
    setIDescription('');
    setIMitigation('');
    setINewsUrl('');
    setINewsSource('');
    setIDevelopments('');
    setShowIssueModal(false);
  };

  const handleUpdateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIssue) return;

    if (editingIssue.isExternal) {
      setExternalIssues(prev => prev.map(iss => {
        if (iss.id === editingIssue.id) {
          return {
            ...iss,
            status: uStatus,
            mitigation: uMitigation.trim(),
            developments: uDevelopments.trim()
          };
        }
        return iss;
      }));
      showToast('✓ Perkembangan Isu Eksternal berhasil diperbarui!');
    } else {
      const proj = projects.find(p => p.id === editingIssue.projectId);
      if (proj && onUpdateProject) {
        const updatedIssues = (proj.currentIssues || []).map(iss => {
          if (iss.id === editingIssue.id) {
            return {
              ...iss,
              status: uStatus,
              mitigation: uMitigation.trim(),
              developments: uDevelopments.trim()
            };
          }
          return iss;
        });
        onUpdateProject({
          ...proj,
          currentIssues: updatedIssues
        });
        showToast(`✓ Perkembangan Isu proyek ${proj.code} berhasil diperbarui!`);
      }
    }

    setEditingIssue(null);
    setShowUpdateModal(false);
  };

  // Mock files state for "Dokumen" tab
  const [documents, setDocuments] = useState([
    { id: 'doc-1', name: 'DED_Gambar_Teknis_SIPP_Luwu.pdf', size: '4.8 MB', date: '2026-02-12', project: 'SIPP-LUWU', category: 'Desain Gambar Teknis', status: 'Disetujui' },
    { id: 'doc-2', name: 'MoU_SIPP_Luwu_USAID_DFW.pdf', size: '2.5 MB', date: '2026-01-20', project: 'SIPP-LUWU', category: 'Perjanjian Kerjasama', status: 'Disetujui' },
    { id: 'doc-3', name: 'Laporan_Amdal_Sabuk_Hijau_Mangrove.pdf', size: '8.2 MB', date: '2026-03-05', project: 'MANGROVE-RES', category: 'Analisis Lingkungan', status: 'Disetujui' },
    { id: 'doc-4', name: 'Adat_Sasi_Pesisir_Nelayan_Berdikari.pdf', size: '1.1 MB', date: '2026-05-25', project: 'MANGROVE-RES', category: 'Regulasi Komunitas', status: 'Draft' },
    { id: 'doc-5', name: 'Rencana_Aksi_Komunal_SABK_NTT.pdf', size: '3.4 MB', date: '2025-12-05', project: 'SABK-SAN', category: 'Rencana Kerja', status: 'Disetujui' }
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFilesFeedback, setUploadedFilesFeedback] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate adding file
    const file = e.dataTransfer.files[0];
    if (file) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        project: projects[0]?.code || 'UMUM',
        category: 'Dokumen Pendukung',
        status: 'Disetujui'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploadedFilesFeedback(`Berhasil mengunggah dokumen "${file.name}"!`);
      setTimeout(() => setUploadedFilesFeedback(null), 4000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
        project: projects[0]?.code || 'UMUM',
        category: 'Dokumen Pendukung',
        status: 'Disetujui'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploadedFilesFeedback(`Berhasil mengunggah dokumen "${file.name}"!`);
      setTimeout(() => setUploadedFilesFeedback(null), 4000);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus arsip dokumen ini?')) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
    }
  };

  // 1. RENDER TAB: DOKUMEN
  if (activeTab === 'documents') {
    return (
      <div className="space-y-6">
        <div id="document-tab-card" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-sky-600" />
                Arsip & Manajemen Dokumen Proyek
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Kelola dokumen perencanaan, sertifikasi AMDAL, naskah kerja sama (MoU), serta pelaporan berkala NGO.
              </p>
            </div>
            {uploadedFilesFeedback && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 animate-pulse font-semibold">
                {uploadedFilesFeedback}
              </span>
            )}
          </div>

          {/* Area Drag-and-Drop */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 relative cursor-pointer ${
              isDragging 
                ? 'border-sky-500 bg-sky-25 text-sky-800 scale-[0.99]' 
                : 'border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50 text-slate-500'
            }`}
          >
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileSelect} 
            />
            <div className={`p-3.5 rounded-xl ${isDragging ? 'bg-sky-100 text-sky-600' : 'bg-white text-slate-400 shadow-xs'}`}>
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm text-slate-800">Tarik & Lepaskan dokumen pendukung di sini, atau klik untuk memilih</p>
              <p className="text-xs text-slate-400">Mendukung format PDF, XLSX, DOCX, dan PNG (Maksimum 10 MB per file)</p>
            </div>
          </div>

          {/* Document list table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-105">
                <tr>
                  <th className="p-3.5">Nama Dokumen</th>
                  <th className="p-3.5 text-center">Proyek</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5 text-center">Ukuran</th>
                  <th className="p-3.5 text-center">Tanggal Unggah</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-3.5 font-semibold flex items-center gap-2 text-slate-800">
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      {doc.name}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {doc.project}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{doc.category}</td>
                    <td className="p-3.5 text-center font-mono text-slate-400">{doc.size}</td>
                    <td className="p-3.5 text-center font-mono text-slate-505">
                      {new Date(doc.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        doc.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right flex justify-end gap-1.5">
                      <button className="text-slate-400 hover:text-sky-600 p-1 rounded-md" title="Unduh">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDoc(doc.id)} 
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-md" 
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER TAB: PENERIMA MANFAAT
  if (activeTab === 'beneficiaries') {
    const filteredBeneficiaries = beneficiaries.filter(b => {
      const matchesProj = selectedProjFilter ? b.projectCode.toLowerCase() === selectedProjFilter.toLowerCase() : true;
      const matchesSearch = beneficiarySearch ? (
        b.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) || 
        b.activityName.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        b.origin.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        b.occupation.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        b.projectCode.toLowerCase().includes(beneficiarySearch.toLowerCase())
      ) : true;
      return matchesProj && matchesSearch;
    });

    // Calculates base totals with dynamic addition adjustments
    const getBaseCount = () => {
      if (selectedProjFilter === 'SIPP-LUWU') return 1250;
      if (selectedProjFilter === 'MANGROVE-RES') return 850;
      if (selectedProjFilter === 'SABK-SAN') return 2100;
      if (selectedProjFilter === 'HSP-2') return 340;
      return 4540;
    };

    const currentAddedFiltered = beneficiaries.filter(b => 
      b.id.startsWith('ben-manual') || b.id.startsWith('ben-imported')
    ).filter(b => !selectedProjFilter || b.projectCode === selectedProjFilter).length;

    const totalJiwa = getBaseCount() + currentAddedFiltered;

    // Female ratio
    const currentListFemales = filteredBeneficiaries.filter(b => b.gender === 'Perempuan').length;
    const currentListTotal = filteredBeneficiaries.length;
    
    const getBaseFemaleRatio = () => {
      if (selectedProjFilter === 'SIPP-LUWU') return 32.5;
      if (selectedProjFilter === 'MANGROVE-RES') return 44.0;
      if (selectedProjFilter === 'SABK-SAN') return 31.2;
      return 34.2;
    };
    const femalePct = currentListTotal > 0 
      ? ((currentListFemales / currentListTotal) * 100).toFixed(1) 
      : getBaseFemaleRatio().toFixed(1);

    // Vulnerable headcount
    const getVulnerableBase = () => {
      if (selectedProjFilter === 'SIPP-LUWU') return 45;
      if (selectedProjFilter === 'MANGROVE-RES') return 85;
      if (selectedProjFilter === 'SABK-SAN') return 50;
      return 180;
    };
    const addedVulnerable = beneficiaries.filter(b => 
      b.vulnerable && (b.id.startsWith('ben-manual') || b.id.startsWith('ben-imported'))
    ).filter(b => !selectedProjFilter || b.projectCode === selectedProjFilter).length;
    const vulnerableCount = getVulnerableBase() + addedVulnerable;

    return (
      <div className="space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-2xl transition-all border border-slate-700 animate-fade-in animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Manual Addition Slide-over/Modal Backdrop */}
        {showManualModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-display text-sm uppercase tracking-wide flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-emerald-400" />
                    Registrasi Penerima Manfaat Baru (Manual)
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium">Lengkapi parameter data demi keabsahan pelaporan kuantitatif DFW.</p>
                </div>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                <form onSubmit={handleManualAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Proyek:</label>
                      <select
                        value={mProjectCode}
                        onChange={(e) => setMProjectCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-sky-600 focus:bg-white text-slate-705 cursor-pointer"
                        required
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.code}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-605 mb-1">Aktivitas Kegiatan:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sosialisasi Kelompok Tani atau FGD Sanitasi"
                        value={mActivityName}
                        onChange={(e) => setMActivityName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Penerima Manfaat:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ahmad Sudarto"
                        value={mName}
                        onChange={(e) => setMName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Kelamin:</label>
                      <select
                        value={mGender}
                        onChange={(e) => setMGender(e.target.value as 'Laki-laki' | 'Perempuan')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-sky-600 focus:bg-white text-slate-700 cursor-pointer"
                      >
                        <option value="Laki-laki">👨 Laki-laki</option>
                        <option value="Perempuan">👩 Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Asal / Kelurahan / Kecamatan:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bedono, Demak"
                        value={mOrigin}
                        onChange={(e) => setMOrigin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Handphone:</label>
                      <input
                        type="text"
                        placeholder="e.g. 08123456789"
                        value={mPhone}
                        onChange={(e) => setMPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Pekerjaan:</label>
                      <input
                        type="text"
                        placeholder="e.g. Nelayan Tangkap"
                        value={mOccupation}
                        onChange={(e) => setMOccupation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Usia / Umur (Tahun):</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={mAge}
                        onChange={(e) => setMAge(parseInt(e.target.value) || 30)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Catatan Tambahan:</label>
                      <input
                        type="text"
                        placeholder="e.g. Aktif berdiskusi, kelompok rentan"
                        value={mNotes}
                        onChange={(e) => setMNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-sky-600 focus:bg-white text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="modal-vulnerable"
                      checked={mVulnerable}
                      onChange={(e) => setMVulnerable(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="modal-vulnerable" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      ⚠️ Centang jika merupakan Kelompok Rentan (Sangat miskin, keluarga stunting, atau buruh termarginalkan)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowManualModal(false)}
                      className="px-4 py-2 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Simpan Penerima Manfaat
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
                <Users className="w-5.5 h-5.5 text-sky-600" />
                Database Penerima Manfaat Kontraktual per Proyek
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sistem database dinamis yang memetakan, mengimpor, melakukan kualifikasi gender kuota, serta memfilter data real-time penerima manfaat program DFW Indonesia.
              </p>
            </div>
          </div>

          {/* Compact Responsive Interactive Toolbar / Filtering & Operations Actions */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block font-display">Pilih Proyek (Dropdown):</span>
                <select
                  value={selectedProjFilter}
                  onChange={(e) => setSelectedProjFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl p-2 font-bold cursor-pointer text-slate-700 focus:outline-sky-600 focus:ring-1 focus:ring-sky-500 min-w-[210px] shadow-4xs"
                >
                  <option value="">🗺️ Semua Portofolio Proyek</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.code}>📁 {p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block font-display">Cari Berdasarkan Nama:</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Irwan, Herlina, Rahmat..."
                    value={beneficiarySearch}
                    onChange={(e) => setBeneficiarySearch(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-slate-200 text-xs rounded-xl pl-3 pr-8 py-2 text-slate-700 focus:outline-sky-500 font-semibold shadow-4xs placeholder-slate-350"
                  />
                  {beneficiarySearch && (
                    <button 
                      onClick={() => setBeneficiarySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Actions Buttons with responsive text labels */}
            <div className="flex items-center gap-1.5 flex-wrap self-end lg:self-center">
              {/* Template Download */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-white border hover:bg-slate-100 text-slate-700 p-2 md:px-3 md:py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-4xs"
                title="Unduh contoh file CSV dengan struktur kolom lengkap"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Template</span>
              </button>

              {/* Import Upload */}
              <label className="bg-white border hover:bg-slate-100 text-slate-700 p-2 md:px-3 md:py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-4xs relative">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-150 p-2 md:px-3 md:py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-4xs"
                title="Ekspor list penerima manfaat aktif ke file CSV spreadsheet"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {/* Tambah Manual */}
              <button
                type="button"
                onClick={() => {
                  setMProjectCode(selectedProjFilter || projects[0]?.code || 'SIPP-LUWU');
                  setShowManualModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 md:px-3 md:py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all hover:scale-[1.015] shadow-xs cursor-pointer"
                title="Tambah Penerima Manfaat Secara Manual"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-100" />
                <span>＋ Tambah</span>
              </button>
            </div>
          </div>

          {/* Dynamic numerical metrics cards, adapting to current selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-4">
              <div className="p-3.5 bg-sky-600 text-white rounded-xl shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-sky-700 uppercase tracking-wider block font-bold">Total Jiwa Terjangkau</span>
                <span className="text-2xl font-bold font-display text-sky-950 mt-0.5">
                  {totalJiwa.toLocaleString('id-ID')} Jiwa
                </span>
                <span className="text-[11px] text-sky-600 block mt-0.5 font-medium">
                  {selectedProjFilter ? `Data spesifik Proyek ${selectedProjFilter}` : 'Konsolidasi Seluruh Portofolio'}
                </span>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 uppercase tracking-wider block font-bold">Kuota Keterlibatan Perempuan</span>
                <span className="text-2xl font-bold font-display text-emerald-950 mt-0.5">
                  {femalePct}%
                </span>
                <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
                  {parseFloat(femalePct) >= 30.0 ? '✓ Batas minimum target 30% terpenuhi' : '⚠️ Perlu penguatan sosialisasi gender'}
                </span>
              </div>
            </div>

            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
              <div className="p-3.5 bg-amber-600 text-white rounded-xl shadow-xs">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 uppercase tracking-wider block font-bold">Kelompok Rentan Tersentuh</span>
                <span className="text-2xl font-bold font-display text-amber-950 mt-0.5">
                  {vulnerableCount} Jiwa
                </span>
                <span className="text-[11px] text-amber-600 block mt-0.5 font-medium">Keluarga nelayan miskin & rawan stunting</span>
              </div>
            </div>
          </div>

          {/* New Rich Beneficiaries Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block font-display">
                📋 Daftar Penerima Manfaat ({filteredBeneficiaries.length} dari {beneficiaries.length} Terdaftar)
              </span>
              <span className="text-[11px] text-slate-400 font-mono font-bold">
                *Template : Project, Aktivitas, Nama, Jenis Kelamin, Asal, Handphone, Pekerjaan, Usia, Catatan
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-3xs">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-[#1e293b] text-slate-100 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Proyek</th>
                    <th className="p-3.5">Aktivitas</th>
                    <th className="p-3.5">Nama Lengkap</th>
                    <th className="p-3.5 text-center">Jenis Kelamin</th>
                    <th className="p-3.5">Asal / Domisili</th>
                    <th className="p-3.5">No. Handphone</th>
                    <th className="p-3.5">Pekerjaan</th>
                    <th className="p-3.5 text-center">Usia</th>
                    <th className="p-3.5">Catatan</th>
                    <th className="p-3.5 text-right w-12">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBeneficiaries.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono bg-sky-50 text-sky-800 border border-sky-100 text-[10px] px-2 py-0.5 font-black uppercase rounded-lg">
                          {b.projectCode}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium max-w-[160px] truncate" title={b.activityName}>
                        {b.activityName}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 flex items-center gap-1.5">
                        {b.vulnerable && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.2 rounded font-black cursor-help" title="Kategori Kelompok Rentan">
                            Rent
                          </span>
                        )}
                        {b.name}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                          b.gender === 'Perempuan' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-105'
                        }`}>
                          {b.gender === 'Perempuan' ? '👩 Perempuan' : '👨 Laki-Laki'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{b.origin}</td>
                      <td className="p-3.5 font-mono text-slate-400 font-semibold">{b.phone}</td>
                      <td className="p-3.5 text-slate-600">{b.occupation}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">{b.age} Bln/Thn</td>
                      <td className="p-3.5 text-slate-500 max-w-[180px] truncate" title={b.notes}>{b.notes}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteBeneficiary(b.id)}
                          className="text-slate-350 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Hapus data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBeneficiaries.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400 bg-slate-25/30 font-semibold">
                        📂 Tidak ada data penerima manfaat terdaftar untuk filter proyek ini. Anda dapat mengimpor atau menambahkan data baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid of Komunitas / Lembaga Pengelola Lokal - Preserved from initial implementation */}
          <div className="border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
              Kelompok Masyarakat & Lembaga Pengelola Lokal Program DFW Indonesia
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Kelompok SIPP-LUWU</span>
                <p className="font-bold text-slate-700">Perkumpulan Petani Pemakai Air (P3A)</p>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Berjumlah 5 komite tani pengatur katup irigasi persawahan cerdas.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Kelompok MANGROVE-RES</span>
                <p className="font-bold text-slate-700">Nelayan Berdikari & Koperasi Wanita Pesisir</p>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Kelompok mandiri pembibit pohon bakau dan koperasi hilir sirup mangrove pidada.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Kelompok SABK-SAN</span>
                <p className="font-bold text-slate-700">Komite Pengelola Sanitasi Swadaya Masyarakat (KPS-SM)</p>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">Organisasi pengumpul iuran perawatan pompa komunal di pedesaan NTT agar berkelanjutan jangka panjang.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 3. RENDER TAB: CONSOLIDATED ISSUES (ISU LEDGER)
  if (activeTab === 'issues') {
    // 1. Projects-specific issues
    const projectIssues = projects.flatMap(p => 
      (p.currentIssues || []).map(iss => ({
        ...iss,
        projectCode: p.code,
        projectName: p.name,
        projectId: p.id,
        isExternal: false
      }))
    );

    // 2. External relevant issues (news articles)
    const extIssuesMapped = externalIssues.map(iss => ({
      ...iss,
      projectCode: 'EKSTERNAL',
      projectName: 'Isu Eksternal / Berita Luar',
      projectId: 'external',
      isExternal: true
    }));

    // Merge both
    const allIssues = [...projectIssues, ...extIssuesMapped];

    // Filter by selection dropdown & status
    const filteredIssues = allIssues.filter(iss => {
      // 1. Filter by project association
      let matchProj = true;
      if (selectedIssueProj === 'all') matchProj = true;
      else if (selectedIssueProj === 'external') matchProj = iss.isExternal;
      else matchProj = iss.projectCode === selectedIssueProj;

      // 2. Filter by status
      let matchStatus = true;
      if (selectedIssueStatus !== 'all') {
        matchStatus = iss.status === selectedIssueStatus;
      }

      return matchProj && matchStatus;
    });

    return (
      <div className="space-y-6">
        {/* Compact Responsive Interactive Filter & Addition Toolbar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5.5 h-5.5 text-rose-600" />
                Feeding Isu Aktual & Taktis Lapangan DFW
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ikhtisar kendala lapangan beserta siasat mitigasi NGO dan integrasi isu berita eksternal terpercaya.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-rose-50 text-rose-700 px-3 py-1 text-xs font-bold rounded-full border border-rose-100">
                {filteredIssues.filter(i => i.status === 'Aktif').length} Aktif
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold rounded-full border border-emerald-100">
                {filteredIssues.filter(i => i.status === 'Teratasi').length} Teratasi
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 flex-wrap">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block font-display">Pilih Asosiasi Isu / Proyek:</span>
                <select
                  value={selectedIssueProj}
                  onChange={(e) => setSelectedIssueProj(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl p-2 font-bold cursor-pointer text-slate-700 focus:outline-sky-600 min-w-[240px] shadow-4xs"
                >
                  <option value="all">🌍 Semua Isu (Internal & Berita Luar)</option>
                  <option value="external">📰 Hanya Isu Eksternal / Berita Luar</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.code}>📁 Proyek: {p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block font-display">Pilih Status Isu:</span>
                <select
                  value={selectedIssueStatus}
                  onChange={(e) => setSelectedIssueStatus(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-xl p-2 font-bold cursor-pointer text-slate-705 focus:outline-sky-600 min-w-[150px] shadow-4xs"
                >
                  <option value="all">🔍 Semua Status</option>
                  <option value="Aktif">🔴 Hanya Status Aktif</option>
                  <option value="Teratasi">🟢 Hanya Status Teratasi</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIAffiliation('external');
                setShowIssueModal(true);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.015] shadow-sm cursor-pointer self-end md:self-center"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>＋ Tambah Isu Manual</span>
            </button>
          </div>

          {/* Issues feed list container */}
          <div className="space-y-4 pt-2">
            {filteredIssues.map((iss) => {
              const isClosed = iss.status === 'Teratasi';
              return (
                <div 
                  key={iss.id} 
                  className={`bg-white rounded-2xl border p-5 space-y-4 transition-all ${
                    isClosed ? 'border-slate-150 opacity-65 bg-slate-25/50' : 'border-rose-150 shadow-xs hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`font-mono text-[9px] font-extrabold px-2 py-0.5 rounded ${
                        iss.isExternal 
                        ? 'bg-blue-50 text-blue-700 border border-blue-105'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {iss.projectCode}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg flex items-center gap-1 ${
                        iss.severity === 'Tinggi' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        iss.severity === 'Sedang' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {!isClosed && iss.severity === 'Tinggi' && (
                          <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping inline-block"></span>
                        )}
                        {iss.severity} Severity
                      </span>
                      <span className="bg-slate-50 border border-slate-150 text-[10px] font-mono font-bold text-slate-550 px-2 py-0.5 rounded-lg">
                        {iss.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(iss.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {isClosed ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">✓ Teratasi</span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse">● Aktif</span>
                      )}
                    </div>

                    {!iss.isExternal && (
                      <button 
                        onClick={() => onSelectProject(iss.projectId)}
                        className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Buka Proyek →
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold text-slate-800 ${isClosed ? 'line-through text-slate-400 font-medium' : ''}`}>
                      {iss.headline}
                    </h3>
                    <p className={`text-xs text-slate-500 leading-relaxed mt-1 ${isClosed ? 'text-slate-400' : ''}`}>
                      {iss.description}
                    </p>
                  </div>

                  {/* News URL Reference block (if news is present/clickable) */}
                  {iss.newsUrl && (
                    <div className="flex items-center gap-2 bg-sky-50/50 p-2 border border-sky-100 rounded-xl max-w-fit">
                      <span className="text-[9px] text-sky-800 font-black uppercase tracking-wider">Sumber Berita Eksternal:</span>
                      <a 
                        href={iss.newsUrl} 
                        target="_blank" 
                        rel="noreferrer referrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-extrabold hover:underline hover:text-sky-800"
                        title="Klik untuk membuka pranala berita asli"
                      >
                        {iss.newsSource || 'Kunjungi Situs Berita'} ↗
                      </a>
                    </div>
                  )}

                  {/* Mitigation Plan section */}
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isClosed ? 'text-slate-300' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-mono text-[9px] font-bold text-slate-600 block uppercase tracking-wide">Rencana Siasat NGO:</span>
                      <p className="text-[11px] text-slate-650 leading-relaxed mt-0.5 font-medium">
                        {iss.mitigation}
                      </p>
                    </div>
                  </div>

                  {/* Developments log tracker timeline update block */}
                  <div className="border border-slate-150 p-3.5 rounded-xl space-y-2 bg-slate-25/40">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-bold text-slate-500 block uppercase tracking-wide">
                        📈 Perkembangan Terbaru Tindak Lanjut:
                      </span>
                      <button
                        onClick={() => {
                          setEditingIssue(iss);
                          setUStatus(iss.status);
                          setUMitigation(iss.mitigation);
                          setUDevelopments(iss.developments || '');
                          setShowUpdateModal(true);
                        }}
                        className="text-[10px] text-sky-700 hover:text-sky-800 font-extrabold bg-white border border-slate-200 hover:border-slate-350 px-2 py-1 rounded-md transition-all shadow-4xs"
                      >
                        ✏️ Update Perkembangan
                      </button>
                    </div>

                    {iss.developments ? (
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold italic border-l-2 border-amber-400 bg-amber-50/30 p-2 rounded">
                        ℹ️ {iss.developments}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada memo perkembangan lapangan yang tercatat. Silakan klik tombol di samping untuk mencantumkan rilis kemajuan masalah.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredIssues.length === 0 && (
              <div className="bg-slate-50 rounded-2xl py-12 text-center text-slate-400 border border-dashed border-slate-200">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-650">Tidak ada isu terdaftar!</p>
                <p className="text-xs text-slate-400">Silakan ganti kategori filter atau tambahkan isu manual baru jika dibutuhkan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Issue Addition Slider/Modal Backdrop */}
        {showIssueModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold font-display text-sm uppercase tracking-wide flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-sky-450" />
                    Tambah Isu Lapangan / Berita Manual
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium">Tambah data isu internal lapangan atau rujukan berita eksternal krusial.</p>
                </div>
                <button 
                  onClick={() => setShowIssueModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddIssue} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Afiliasi Isu / Proyek:</label>
                      <select
                        value={iAffiliation}
                        onChange={(e) => setIAffiliation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-bold cursor-pointer text-slate-700 focus:bg-white focus:outline-sky-500 shadow-5xs"
                      >
                        <option value="external">📰 Berita Eksternal / Isu Publik (Masyarakat)</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>📁 Proyek internal: {p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Kategori Hambatan:</label>
                      <select
                        value={iCategory}
                        onChange={(e) => setICategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-bold cursor-pointer text-slate-700 focus:bg-white focus:outline-sky-500 shadow-5xs"
                      >
                        <option value="Regulasi">Regulasi</option>
                        <option value="Sosial/Masyarakat">Sosial & Kemasyarakatan</option>
                        <option value="Media/Publik">Media & Publik</option>
                        <option value="Kebijakan">Kebijakan Publik</option>
                        <option value="Iklim/Alam">Iklim & Faktor Alam</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Tingkat Kerawanan (Severity):</label>
                      <select
                        value={iSeverity}
                        onChange={(e) => setISeverity(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-bold cursor-pointer text-slate-705 focus:bg-white focus:outline-sky-500 shadow-5xs"
                      >
                        <option value="Rendah">🟢 Severity Rendah</option>
                        <option value="Sedang">🟡 Severity Sedang</option>
                        <option value="Tinggi">🔴 Severity Tinggi (Segera Tangani)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Tanggal Pelaporan:</label>
                      <input
                        type="text"
                        disabled
                        value={new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl p-2.5 font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Headline Utama Isu / Berita:</label>
                    <input
                      type="text"
                      placeholder="e.g. Suhu Air Laut Naik Mengancam Pertumbuhan Karang di Demak"
                      value={iHeadline}
                      onChange={(e) => setIHeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-bold focus:bg-white focus:outline-sky-550 shadow-5xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Uraian / Deskripsi Isu Selengkapnya:</label>
                    <textarea
                      placeholder="Deskripsikan isu, lokasi kejadian, implikasi ke program kerja, serta rincian data pendukung terdaftar..."
                      rows={3}
                      value={iDescription}
                      onChange={(e) => setIDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-semibold focus:bg-white focus:outline-sky-500 shadow-5xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Rencana Siasat Lapangan NGO DFW (Mitigasi):</label>
                    <textarea
                      placeholder="Bagaimana mitigasi, rencana gerak tim DFW, koordinasi Pemda, atau pelibatan kepolisian/tokoh adat..."
                      rows={2}
                      value={iMitigation}
                      onChange={(e) => setIMitigation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-semibold focus:bg-white focus:outline-sky-500 shadow-5xs"
                    />
                  </div>

                  {/* News Specific fields if affiliated as external news */}
                  {iAffiliation === 'external' && (
                    <div className="bg-sky-50/45 p-4 rounded-2xl border border-sky-100 space-y-3">
                      <span className="text-[9px] font-black text-sky-800 uppercase tracking-wider block">📰 Metadata Berita / Media Luar (Tambahan):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nama Penerbit Sumber:</label>
                          <input
                            type="text"
                            placeholder="e.g. Antara News, Kompas ID, Mongabay"
                            value={iNewsSource}
                            onChange={(e) => setINewsSource(e.target.value)}
                            className="w-full bg-white border border-slate-250 text-xs rounded-lg p-2 font-bold focus:outline-sky-500 shadow-5xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Asal Tautan Berita URL:</label>
                          <input
                            type="url"
                            placeholder="https://www.kompas.id/..."
                            value={iNewsUrl}
                            onChange={(e) => setINewsUrl(e.target.value)}
                            className="w-full bg-white border border-slate-250 text-xs rounded-lg p-2 font-semibold focus:outline-sky-500 shadow-5xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Catatan Perkembangan Awal / Logs (Optional):</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 Juni 2026: DFW sedang mengedarkan kuesioner awal..."
                      value={iDevelopments}
                      onChange={(e) => setIDevelopments(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-semibold focus:bg-white focus:outline-sky-500 shadow-5xs"
                    />
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-4 py-2 hover:bg-slate-200 text-xs font-bold text-slate-655 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Simpan Isu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Developments & Status Modal */}
        {showUpdateModal && editingIssue && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-display text-sm uppercase tracking-wide flex items-center gap-2">
                    <span>✏️ Update Perkembangan Isu Lapangan</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-medium truncate max-w-sm">Isu: {editingIssue.headline}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingIssue(null);
                    setShowUpdateModal(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateIssue} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Status Penyelesaian Isu:</label>
                  <div className="flex gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 max-w-fit">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-755 cursor-pointer">
                      <input 
                        type="radio" 
                        name="uStatus" 
                        value="Aktif" 
                        checked={uStatus === 'Aktif'}
                        onChange={() => setUStatus('Aktif')}
                        className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-rose-700">🔴 Isu Masih Aktif</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-755 cursor-pointer">
                      <input 
                        type="radio" 
                        name="uStatus" 
                        value="Teratasi" 
                        checked={uStatus === 'Teratasi'}
                        onChange={() => setUStatus('Teratasi')}
                        className="text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-emerald-750">🟢 Berhasil Teratasi / Selesai</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Rencana Siasat NGO Terbaru:</label>
                  <textarea
                    rows={2}
                    value={uMitigation}
                    onChange={(e) => setUMitigation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-bold focus:bg-white focus:outline-sky-505 shadow-5xs"
                    placeholder="Tuliskan siasat baru tim lapangan..."
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Catatan Perkembangan Terakhir (Audit Log/Memo):</label>
                  <textarea
                    rows={3}
                    value={uDevelopments}
                    onChange={(e) => setUDevelopments(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 text-slate-800 font-bold focus:bg-white focus:outline-sky-500 shadow-5xs"
                    placeholder="Contoh: 10 Juni 2026: Rapat adat telah sepakat tidak menarik retribusi pompa untuk masa prapanen..."
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block font-mono">Tips: Awali dengan tanggal rilis memo demi kerapian pelaporan.</span>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIssue(null);
                      setShowUpdateModal(false);
                    }}
                    className="px-4 py-2 hover:bg-slate-150 text-xs font-bold text-slate-600 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Simpan Memo Perkembangan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. RENDER TAB: ARSIP PROYEK
  if (activeTab === 'archives') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
              <Archive className="w-5.5 h-5.5 text-sky-600" />
              Arsip & Sejarah Portofolio Proyek (2024-2025)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Catatan historis proyek-proyek DFW Indonesia yang telah diselesaikan pengerjaan fisiknya secara paripurna (Selasai 100%).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-150 rounded-2xl p-5 space-y-4 shadow-3xs bg-slate-25/30">
              <div className="flex items-center justify-between">
                <span className="font-mono bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded">
                  WAKATOBI-CORAL
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Selesai Paripurna
                </span>
              </div>
              <h3 className="font-display font-bold text-slate-800 text-base">Rehabilitasi Terumbu Karang Wakatobi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pemasangan 300 unit substrat karang buatan (biorock) di pesisir pulau Wangi-Wangi serta advokasi Peraturan Desa Kawasan Lindung Laut Adat.
              </p>
              <div className="pt-3 border-t grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Durasi Operasional</span>
                  <p className="font-bold text-slate-700">Feb 2024 - Mar 2025</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Tingkat Kelulusan</span>
                  <p className="font-bold text-emerald-600 font-mono">94.2% Sangat Baik</p>
                </div>
              </div>
            </div>

            <div className="border border-slate-150 rounded-2xl p-5 space-y-4 shadow-3xs bg-slate-25/30">
              <div className="flex items-center justify-between">
                <span className="font-mono bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded">
                  KUPANG-SAN
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Selesai Paripurna
                </span>
              </div>
              <h3 className="font-display font-bold text-slate-800 text-base">Sanitasi Higienis Kupang Barat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penyalinan 120 septic tank individual sehat untuk wilayah rawan air tanah di NTT guna mencegah polusi feses menyebar ke sumur gali warga.
              </p>
              <div className="pt-3 border-t grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Durasi Operasional</span>
                  <p className="font-bold text-slate-700">Mei 2024 - Des 2025</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Penurunan Stunting</span>
                  <p className="font-bold text-emerald-600 font-mono">15% Penurunan Drastis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. RENDER TAB: STAFF & BEBAN KERJA
  if (activeTab === 'workload') {
    const staffList = [
      { name: 'Ir. Ahmad Subagio, M.T.', role: 'Project Manager SIPP-LUWU', projects: 1, taskCount: 4, workload: 45, status: 'Mengawasi' },
      { name: 'Dian Permatasari, M.Si.', role: 'Project Manager MANGROVE-RES', projects: 1, taskCount: 5, workload: 85, status: 'Padat' },
      { name: 'drg. Luh Putu Citrawati', role: 'Project Manager SABK-SAN', projects: 1, taskCount: 6, workload: 92, status: 'Kritis' },
      { name: 'Danang Prasetyo', role: 'Software & IoT Engineer', projects: 2, taskCount: 3, workload: 60, status: 'Optimal' },
      { name: 'Andi Nurhaliza', role: 'Field Officer - Advokasi & Sosial', projects: 3, taskCount: 7, workload: 75, status: 'Optimal' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5.5 h-5.5 text-sky-600" />
              Alokasi Staff & Analisis Beban Kerja
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pemantauan penyebaran tugas, tanggung jawab, dan estimasi beban kerja bagi tim teknis serta field officer di lapangan secara berkala.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-105">
                <tr>
                  <th className="p-3.5">Nama Staff Koordinator</th>
                  <th className="p-3.5">Gelar / Peran Lapangan</th>
                  <th className="p-3.5 text-center">Multi-Proyek</th>
                  <th className="p-3.5 text-center">Sub-Aktivitas Aktif</th>
                  <th className="p-3.5">Estimasi Beban Kerja</th>
                  <th className="p-3.5 text-center">Tingkat Kesibukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map((staff, idx) => {
                  let alertBg = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                  if (staff.status === 'Optimal') alertBg = 'bg-sky-50 text-sky-700 border border-sky-100';
                  if (staff.status === 'Padat') alertBg = 'bg-amber-50 text-amber-700 border border-amber-100';
                  if (staff.status === 'Kritis') alertBg = 'bg-rose-50 text-rose-700 border border-rose-100';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800">{staff.name}</td>
                      <td className="p-3.5 text-slate-500">{staff.role}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">{staff.projects} Proyek</td>
                      <td className="p-3.5 text-center font-mono text-slate-500">{staff.taskCount} Pekerjaan</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-700 w-10 shrink-0">{staff.workload}%</span>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${
                                staff.workload > 90 ? 'bg-rose-500' : staff.workload > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${staff.workload}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-lg ${alertBg}`}>
                          {staff.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
