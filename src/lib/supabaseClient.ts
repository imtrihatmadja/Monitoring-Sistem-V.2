import { createClient } from '@supabase/supabase-js';
import { Project, SystemAlert, CurrentIssue } from '../types';

// Real Supabase credentials provided by the user
const DEFAULT_SUPABASE_URL = 'https://kvaktoebwxpgmydihajx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2YWt0b2Vid3hwZ215ZGloYWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzY0NjUsImV4cCI6MjA5NjY1MjQ2NX0.DILybLnaEqQNpfAZvz8SrsMJwMSo_PDnLSF5cPfGzn4';

// Prioritize environment variables, fallback is the user's direct credentials
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL script template to help users setup their Supabase Database
export const SUPABASE_SQL_SETUP_SCRIPT = `-- =========================================================
-- SQL SETUP SCRIPT UNTUK DASHBOARD PEMANTAUAN DFW INDONESIA
-- =========================================================
-- Salin dan jalankan script ini di SQL Editor Supabase Anda
-- Dashboard Anda -> Select Project -> SQL Editor -> New Query -> Run

-- 1. Tabel Proyek (Menyimpan seluruh data proyek terstruktur-dalam)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Alerts (Riwayat notifikasi otomatis sistem)
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL,
  project_name TEXT NOT NULL,
  indicator_name TEXT NOT NULL,
  message TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  unit TEXT,
  read BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Isu Eksternal (Kliping berita luar)
CREATE TABLE IF NOT EXISTS external_issues (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT,
  status TEXT NOT NULL,
  news_url TEXT,
  news_source TEXT,
  developments TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Matikan RLS demi kemudahan akses cepat Anon Key (Sangat cocok untuk prototipe internal DFW)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE external_issues DISABLE ROW LEVEL SECURITY;

-- 5. Beri izin penuh kepada anon (jika RLS tidak sengaja aktif kembali)
GRANT ALL ON TABLE projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE alerts TO anon, authenticated, service_role;
GRANT ALL ON TABLE external_issues TO anon, authenticated, service_role;
`;

/**
 * Checks connection and tables capability
 * Returns true if table exists, false if setup is missing
 */
export async function verifySupabaseSchema(): Promise<{ connected: boolean; tablesCreated: boolean; errorMsg?: string }> {
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (error) {
      // Postgres error code "42P01": relation does not exist
      if (error.code === '42P01' || error.message.includes('relation "public.projects" does not exist')) {
        return { connected: true, tablesCreated: false };
      }
      return { connected: false, tablesCreated: false, errorMsg: error.message };
    }
    return { connected: true, tablesCreated: true };
  } catch (err: any) {
    return { connected: false, tablesCreated: false, errorMsg: err?.message || 'Gagal koneksi' };
  }
}

/**
 * PROJECT SYNC SERVICES
 */
export async function dbFetchProjects(defaultProjects: Project[]): Promise<Project[]> {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;

    if (!data || data.length === 0) {
      // Seed database with initial data
      console.log('Database kosong. Melakukan seeding proyek bawaan...');
      await dbSaveAllProjects(defaultProjects);
      return defaultProjects;
    }

    // Map database data back to Project list
    return data.map((row: any) => {
      return {
        ...row.data,
        id: row.id,
        code: row.code,
        name: row.name,
        status: row.status
      } as Project;
    });
  } catch (err) {
    console.error('Gagal mengambil data proyek dari Supabase, beralih ke lokal:', err);
    throw err;
  }
}

export async function dbSaveProject(project: Project): Promise<void> {
  try {
    const { error } = await supabase.from('projects').upsert({
      id: project.id,
      code: project.code,
      name: project.name,
      status: project.status,
      data: project,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  } catch (err) {
    console.error(`Gagal menyimpan proyek ${project.code} ke Supabase:`, err);
    throw err;
  }
}

export async function dbSaveAllProjects(projects: Project[]): Promise<void> {
  const rows = projects.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    status: p.status,
    data: p,
    updated_at: new Date().toISOString()
  }));

  try {
    const { error } = await supabase.from('projects').upsert(rows);
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menyimpan semua proyek ke Supabase:', err);
    throw err;
  }
}


/**
 * ALERTS SYNC SERVICES
 */
export async function dbFetchAlerts(defaultAlerts: SystemAlert[]): Promise<SystemAlert[]> {
  try {
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false });
    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('Database alerts kosong. Melakukan seeding...');
      await dbSaveAllAlerts(defaultAlerts);
      return defaultAlerts;
    }

    return data.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      projectName: row.project_name,
      indicatorName: row.indicator_name,
      message: row.message,
      currentValue: row.current_value,
      targetValue: row.target_value,
      unit: row.unit,
      read: row.read
    }));
  } catch (err) {
    console.error('Gagal mengambil data alert dari Supabase:', err);
    throw err;
  }
}

export async function dbSaveAlert(alert: SystemAlert): Promise<void> {
  try {
    const { error } = await supabase.from('alerts').upsert({
      id: alert.id,
      timestamp: alert.timestamp,
      type: alert.type,
      project_name: alert.projectName,
      indicator_name: alert.indicatorName,
      message: alert.message,
      current_value: alert.currentValue,
      target_value: alert.targetValue,
      unit: alert.unit,
      read: alert.read,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menyimpan alert ke Supabase:', err);
    throw err;
  }
}

export async function dbSaveAllAlerts(alerts: SystemAlert[]): Promise<void> {
  const rows = alerts.map(a => ({
    id: a.id,
    timestamp: a.timestamp,
    type: a.type,
    project_name: a.projectName,
    indicator_name: a.indicatorName,
    message: a.message,
    current_value: a.currentValue,
    target_value: a.targetValue,
    unit: a.unit,
    read: a.read,
    updated_at: new Date().toISOString()
  }));

  try {
    const { error } = await supabase.from('alerts').upsert(rows);
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menyimpan semua alert ke Supabase:', err);
    throw err;
  }
}

export async function dbDeleteAllAlerts(): Promise<void> {
  try {
    const { error } = await supabase.from('alerts').delete().neq('id', 'dummy_keep_all');
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menghapus semua alert dari Supabase:', err);
    throw err;
  }
}


/**
 * EXTERNAL ISSUES SYNC SERVICES
 */
export async function dbFetchExternalIssues(defaultIssues: CurrentIssue[]): Promise<CurrentIssue[]> {
  try {
    const { data, error } = await supabase.from('external_issues').select('*').order('date', { ascending: false });
    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('Database isu eksternal kosong. Melakukan seeding...');
      await dbSaveAllExternalIssues(defaultIssues);
      return defaultIssues;
    }

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      severity: row.severity,
      category: row.category,
      headline: row.headline,
      description: row.description,
      mitigation: row.mitigation,
      status: row.status,
      newsUrl: row.news_url,
      newsSource: row.news_source,
      developments: row.developments
    }));
  } catch (err) {
    console.error('Gagal mengambil data isu eksternal dari Supabase:', err);
    throw err;
  }
}

export async function dbSaveExternalIssue(issue: CurrentIssue): Promise<void> {
  try {
    const { error } = await supabase.from('external_issues').upsert({
      id: issue.id,
      date: issue.date,
      severity: issue.severity,
      category: issue.category,
      headline: issue.headline,
      description: issue.description,
      mitigation: issue.mitigation,
      status: issue.status,
      news_url: issue.newsUrl,
      news_source: issue.newsSource,
      developments: issue.developments,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menyimpan isu eksternal ke Supabase:', err);
    throw err;
  }
}

export async function dbSaveAllExternalIssues(issues: CurrentIssue[]): Promise<void> {
  const rows = issues.map(i => ({
    id: i.id,
    date: i.date,
    severity: i.severity,
    category: i.category,
    headline: i.headline,
    description: i.description,
    mitigation: i.mitigation,
    status: i.status,
    news_url: i.newsUrl,
    news_source: i.newsSource,
    developments: i.developments,
    updated_at: new Date().toISOString()
  }));

  try {
    const { error } = await supabase.from('external_issues').upsert(rows);
    if (error) throw error;
  } catch (err) {
    console.error('Gagal menyimpan semua isu eksternal ke Supabase:', err);
    throw err;
  }
}
