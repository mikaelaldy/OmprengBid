import React, { useState } from 'react';
import { X, Plus, Sparkles, ShieldCheck, Globe, AtSign, Tag, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { registerNewProject, setStoredPlayerHandle } from '../utils/storage';
import { sound } from '../utils/audio';
import { trackProjectRegistered } from '../lib/analytics';
import { validateProjectSubmission } from '../utils/moderation';

interface SubmitProjectModalProps {
  isOpen: boolean;
  initialScore?: number;
  onClose: () => void;
  onSuccess: (newProject: Project) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'AI & ML',
  'SaaS',
  'DevTool',
  'Agritech & Food',
  'EdTech & Health',
  'FinTech',
  'Open Source',
];

export const SubmitProjectModal: React.FC<SubmitProjectModalProps> = ({
  isOpen,
  initialScore,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [handle, setHandle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('AI & ML');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nama proyek wajib diisi.');
      return;
    }
    if (name.trim().length > 40) {
      setError('Nama proyek terlalu panjang (maksimal 40 karakter).');
      return;
    }

    if (!url.trim()) {
      setError('URL proyek/website wajib diisi.');
      return;
    }

    // Auto-format URL and validate
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      const parsedUrl = new URL(formattedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
      if (!parsedUrl.hostname.includes('.')) {
        throw new Error('Invalid domain');
      }
    } catch (e) {
      setError('Format URL tidak valid. Pastikan alamat web benar (contoh: myproject.com).');
      return;
    }

    if (!handle.trim()) {
      setError('Builder handle (@username Discord/X/IG) wajib diisi.');
      return;
    }
    if (handle.trim().length > 30) {
      setError('Builder handle terlalu panjang (maksimal 30 karakter).');
      return;
    }

    // Automated Moderation Check against Prohibited Content (Judol, Porno, SARA, Scam, Malware)
    const modCheck = validateProjectSubmission({
      name: name.trim(),
      url: formattedUrl,
      handle: handle.trim(),
      tagline: tagline.trim(),
    });

    if (!modCheck.isValid) {
      setError(modCheck.errorMessage || 'Proyek melanggar aturan konten terlarang.');
      return;
    }

    try {
      sound.playClick();
      setIsSubmitting(true);
      setError(null);

      const newProj = await registerNewProject({
        name: name.trim(),
        url: formattedUrl,
        handle: handle.trim(),
        tagline: tagline.trim() || 'Inovasi ekosistem digital builder nusantara',
        category,
        initialScore: initialScore && initialScore > 0 ? initialScore : 0,
      });

      trackProjectRegistered(newProj.name, newProj.category, newProj.handle);

      setStoredPlayerHandle(handle.trim());
      onSuccess(newProj);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Gagal mendaftarkan proyek ke database global. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#071E49]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl">
        
        {/* Institutional Modal Header */}
        <div className="bg-[#071E49] text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#162C5A] to-[#0A1D40] text-[#D1B06C] flex items-center justify-center font-bold text-xs font-mono border border-[#D1B06C]/40 shrink-0">
              OB
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Pendaftaran Proyek Builder
              </h3>
              <p className="text-xs text-[#D1B06C]">
                Papan Peringkat & Tumpukan Ompreng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {initialScore && initialScore > 0 && (
            <div className="bg-gradient-to-r from-[#071E49] to-[#0D2C66] text-white p-3.5 rounded-xl flex items-center justify-between border border-[#D1B06C]/40 shadow-xs">
              <div className="space-y-0.5">
                <div className="text-[11px] text-[#D1B06C] font-semibold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
                  <span>Klaim Rekor Sesi Main</span>
                </div>
                <div className="text-xs text-slate-200">
                  Proyek ini akan langsung terdaftar dengan rekor awal:
                </div>
              </div>
              <div className="text-right pl-3">
                <span className="text-lg font-bold font-mono text-[#D1B06C]">
                  {initialScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-300 ml-1">pts</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Proyek / Startup *
            </label>
            <div className="relative">
              <input
                id="input-project-name"
                type="text"
                required
                placeholder="Contoh: NasiBox.ai atau HalalScan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:bg-white transition"
              />
            </div>
          </div>

          {/* URL & Handle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Website URL */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>URL Website / App *</span>
              </label>
              <input
                id="input-project-url"
                type="text"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:bg-white transition"
              />
            </div>

            {/* Builder Handle */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1">
                <AtSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Builder Handle *</span>
              </label>
              <input
                id="input-project-handle"
                type="text"
                required
                placeholder="@username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:bg-white transition font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Kategori Proyek</span>
            </label>
            <select
              id="select-project-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tagline / Deskripsi */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Deskripsi Singkat / Tagline
            </label>
            <textarea
              id="textarea-project-tagline"
              rows={2}
              placeholder="Jelaskan nilai inovasi atau fitur utama proyekmu..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-base sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#071E49] focus:bg-white transition"
            />
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="text-[11px] font-medium text-slate-500 mb-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
              <span>Pratinjau di Papan Peringkat</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm text-[#071E49]">
                  {name || 'Nama Proyekmu'}
                </div>
                <div className="text-xs text-slate-500">
                  {tagline || 'Deskripsi singkat inovasimu akan muncul di sini...'}
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                {handle || '@handle'}
              </span>
            </div>
          </div>

          {/* Prohibited Content Rules Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-amber-900">
            <div className="font-semibold flex items-center space-x-1.5 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Aturan Konten & Larangan Proyek</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Dilarang keras mendaftarkan proyek terkait <strong>Judi Online (Judol/Slot)</strong>, <strong>Pornografi/Dewasa</strong>, <strong>Ujaran Kebencian/SARA</strong>, <strong>Penipuan/Scam/Phishing</strong>, atau <strong>Malware/Piracy</strong>. Proyek yang melanggar akan otomatis ditolak dan dihapus permanen.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-1">
            <button
              id="btn-confirm-submit-project"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#071E49] hover:bg-[#0c2a63] disabled:opacity-60 text-white font-medium text-sm py-3 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition active:scale-[0.98] min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Database Global...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#D1B06C]" />
                  <span>Daftarkan & Mulai Mainkan</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Proyek tersimpan secara global di Cloud Firestore dan langsung dapat dimainkan semua orang.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
