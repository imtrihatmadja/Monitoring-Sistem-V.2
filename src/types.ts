export interface SubActivity {
  id: string;
  name: string;
  assignedTo: string;
  progress: number; // 0 - 100
  status: 'Belum Mulai' | 'Dalam Proses' | 'Selesai';
  startDate: string;
  endDate: string;
}

export interface Activity {
  id: string;
  name: string;
  weight: number; // weight of this activity in the overall project (e.g. 40%)
  progress: number; // 0 - 100
  subActivities: SubActivity[];
}

export interface IndicatorHistory {
  date: string;
  achievement: number; // percentage or unit value
  target: number;
}

export interface ProjectIndicator {
  id: string;
  name: string;
  code: string;
  description: string;
  unit: string; // e.g. "%", "Unit", "Rupiah", "Ha"
  target: number; // e.g. 90
  currentAchievement: number; // e.g. 78
  thresholdAlert: number; // if currentAchievement drops below this, trigger system alert
  lastUpdated: string;
  history: IndicatorHistory[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
  department: string;
  manager: string;
  status: 'Sesuai Rencana' | 'Beresiko' | 'Kritis';
  startDate: string;
  endDate: string;
  budget: number; // in IDR
  description: string;
  activities: Activity[];
  indicators: ProjectIndicator[];
  lessonsLearned?: LessonLearned[];
  currentIssues?: CurrentIssue[];
  location?: string;
  pic?: string;
  donor?: string;
  goal?: string;
  outcomes?: string[];
  priorityIssue?: string;
  budgetRealization?: number;
  metrics?: {
    beneficiaries: string;
    events: string;
    documents: string;
    weight?: string;
  };
}

export interface LessonLearned {
  id: string;
  date: string;
  category: 'Kemitraan' | 'Teknis' | 'Advokasi' | 'Operasional' | 'Eksternal';
  title: string;
  description: string;
  recommendation: string;
  contributor: string;
  reflectionType?: 'Lesson Learnt' | 'Success' | 'Challenge' | 'Rekomendasi' | string;
}

export interface CurrentIssue {
  id: string;
  date: string;
  severity: 'Rendah' | 'Sedang' | 'Tinggi';
  category: 'Regulasi' | 'Sosial/Masyarakat' | 'Media/Publik' | 'Kebijakan' | 'Iklim/Alam';
  headline: string;
  description: string;
  mitigation: string;
  status: 'Aktif' | 'Teratasi';
  newsUrl?: string;
  newsSource?: string;
  developments?: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  projectName: string;
  indicatorName: string;
  message: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  read: boolean;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  registeredAt?: string;
}
