import React, { useState } from 'react';
import { X, Plus, Sparkles, ShieldCheck, Globe, AtSign, Tag, CheckCircle2 } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { registerNewProject, setStoredPlayerHandle } from '../utils/storage';
import { sound } from '../utils/audio';
import { trackProjectRegistered } from '../lib/analytics';

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
    if (!url.trim()) {
      setError('URL proyek/website wajib diisi.');
      return;
    }
    if (!handle.trim()) {
      setError('Builder handle (@username Discord/X/IG) wajib diisi.');
      return;
    }

    try {
      sound.playClick();
      setIsSubmitting(true);
      setError(null);

      const newProj = await registerNewProject({
        name: name.trim(),
        url: url.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden border border-black/10 shadow-xl">
        
        {/* Institutional Modal Header */}
        <div className="bg-white text-black p-5 sm:p-6 flex items-center justify-between border-b border-black/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
              OB
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Pendaftaran Proyek Builder
              </h3>
              <p className="text-xs text-black/50">
                Papan Peringkat & Tumpukan Ompreng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-black/45 hover:text-black p-1.5 rounded-lg hover:bg-black/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {initialScore && initialScore > 0 && (
            <div className="bg-black/[0.03] text-black p-3.5 rounded-lg flex items-center justify-between border border-black/10">
              <div className="space-y-0.5">
                <div className="text-[11px] text-black/60 font-semibold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black/50" />
                  <span>Klaim Rekor Sesi Main</span>
                </div>
                <div className="text-xs text-black/55">
                  Proyek ini akan langsung terdaftar dengan rekor awal:
                </div>
              </div>
              <div className="text-right pl-3">
                <span className="text-lg font-bold font-mono text-black">
                  {initialScore}
                </span>
                <span className="text-[10px] text-black/45 ml-1">ompreng</span>
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
            <label className="block text-xs font-medium text-black/75 mb-1">
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
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-black/35 focus:outline-none focus:ring-2 focus:ring-black/25 focus:bg-white transition"
              />
            </div>
          </div>

          {/* URL & Handle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Website URL */}
            <div>
              <label className="block text-xs font-medium text-black/75 mb-1 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-black/45" />
                <span>URL Website / App *</span>
              </label>
              <input
                id="input-project-url"
                type="text"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-black/35 focus:outline-none focus:ring-2 focus:ring-black/25 focus:bg-white transition"
              />
            </div>

            {/* Builder Handle */}
            <div>
              <label className="block text-xs font-medium text-black/75 mb-1 flex items-center space-x-1">
                <AtSign className="w-3.5 h-3.5 text-black/45" />
                <span>Builder Handle *</span>
              </label>
              <input
                id="input-project-handle"
                type="text"
                required
                placeholder="@username"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-black placeholder-black/35 focus:outline-none focus:ring-2 focus:ring-black/25 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-black/75 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-black/45" />
              <span>Kategori Proyek</span>
            </label>
            <select
              id="select-project-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              className="w-full bg-black/[0.02] border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/25 focus:bg-white transition"
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
            <label className="block text-xs font-medium text-black/75 mb-1">
              Deskripsi Singkat / Tagline
            </label>
            <textarea
              id="textarea-project-tagline"
              rows={2}
              placeholder="Jelaskan nilai inovasi atau fitur utama proyekmu..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-black/[0.02] border border-black/10 rounded-xl px-3.5 py-2 text-sm text-black placeholder-black/35 focus:outline-none focus:ring-2 focus:ring-black/25 focus:bg-white transition"
            />
          </div>

          {/* Live Preview Card */}
          <div className="bg-black/[0.02] border border-black/10 p-3.5 rounded-xl">
            <div className="text-[11px] font-medium text-black/55 mb-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-black/50" />
              <span>Pratinjau di Papan Peringkat</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm text-black">
                  {name || 'Nama Proyekmu'}
                </div>
                <div className="text-xs text-black/55">
                  {tagline || 'Deskripsi singkat inovasimu akan muncul di sini...'}
                </div>
              </div>
              <span className="text-xs font-mono text-black/65 bg-white px-2 py-0.5 rounded border border-black/10">
                {handle || '@handle'}
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              id="btn-confirm-submit-project"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-neutral-800 disabled:opacity-60 text-white font-medium text-sm py-3 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan ke Database Global...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan & Mulai Mainkan</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-black/55 mt-2">
              Proyek tersimpan secara global di Cloud Firestore dan langsung dapat dimainkan semua orang.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};
