import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { X, UserPlus, Shield, Mail, Phone, Briefcase } from 'lucide-react';

interface AddStaffModalProps {
  onClose: () => void;
  onAddStaff: (s: Staff) => void;
  existingRoles?: string[];
}

export default function AddStaffModal({ onClose, onAddStaff, existingRoles = [
  'Program Director',
  'Project Manager',
  'Software & IoT Engineer',
  'Field Officer',
  'Sipil Air Engineer',
  'M&E Specialist',
  'Finance & Admin Officer'
] }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(existingRoles[1]); // default to Project Manager
  const [customRole, setCustomRole] = useState('');
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorArr, setErrorArr] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!name.trim()) errors.push('Nama staff tidak boleh kosong.');
    
    const finalRole = useCustomRole ? customRole.trim() : role;
    if (!finalRole) errors.push('Peran / Jabatan tidak boleh kosong.');

    if (errors.length > 0) {
      setErrorArr(errors);
      return;
    }

    const newStaff: Staff = {
      id: `st-${Date.now()}`,
      name: name.trim(),
      role: finalRole,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      registeredAt: new Date().toISOString().split('T')[0]
    };

    onAddStaff(newStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto leading-normal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-250 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-850 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-white tracking-tight">Pendaftaran Staff Internal</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Tambah staff baru DFW Indonesia untuk penugasan proyek.</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorArr.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs font-semibold space-y-1">
              {errorArr.map((err, idx) => (
                <p key={idx}>⚠️ {err}</p>
              ))}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Nama Lengkap Staff & Gelar</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Shield className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Ir. Ahmad Trihatmadja, M.Si."
                className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:outline-sky-600 rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          {/* Role mapping */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Peran / Gelar Jabatan rill</label>
              <button
                type="button"
                onClick={() => setUseCustomRole(!useCustomRole)}
                className="text-[10px] text-sky-600 hover:underline font-bold"
              >
                {useCustomRole ? 'Pilih dari Template' : 'Tulis Kustom Sendiri'}
              </button>
            </div>

            {useCustomRole ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                  <Briefcase className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="misal: Koordinator Lapangan WPP 718"
                  className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:outline-sky-600 rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
                />
              </div>
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:outline-sky-600 rounded-xl px-3 py-2 text-xs font-medium"
              >
                {existingRoles.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Alamat Email Kerja (Opsional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misal: staff@dfw.or.id"
                className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:outline-sky-600 rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">No. Telepon / WhatsApp (Opsional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="misal: 0812-xxxx-xxxx"
                className="w-full bg-slate-50 border border-slate-205 focus:bg-white focus:outline-sky-600 rounded-xl pl-9 pr-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer shadow-md shadow-sky-600/10"
            >
              Simpan Staff Baru
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
