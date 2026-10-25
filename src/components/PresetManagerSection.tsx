import React, { useState, useRef } from 'react';
import { ScheduleItem, SchedulePreset } from '../types';
import { BookmarkPlus, Check, Download, Upload, Trash2, Layers, FileJson, AlertCircle } from 'lucide-react';

interface PresetManagerSectionProps {
  currentSchedules: ScheduleItem[];
  presets: SchedulePreset[];
  activePresetName?: string;
  onApplyPreset: (preset: SchedulePreset) => void;
  onSaveCurrentAsPreset: (name: string, description?: string) => void;
  onDeletePreset: (presetId: string) => void;
  onImportSchedules: (imported: ScheduleItem[]) => void;
}

export const PresetManagerSection: React.FC<PresetManagerSectionProps> = ({
  currentSchedules,
  presets,
  activePresetName,
  onApplyPreset,
  onSaveCurrentAsPreset,
  onDeletePreset,
  onImportSchedules
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      showFeedback('Masukkan nama profil jadwal terlebih dahulu.', 'error');
      return;
    }
    onSaveCurrentAsPreset(newPresetName.trim(), newPresetDesc.trim());
    setNewPresetName('');
    setNewPresetDesc('');
    showFeedback(`Profil "${newPresetName.trim()}" berhasil disimpan ke perpustakaan!`, 'success');
  };

  // Export current schedule as JSON
  const handleExportJSON = () => {
    try {
      const exportData = {
        app: "Bel Sekolah SD N Kartika Sejahtera 01",
        exportedAt: new Date().toISOString(),
        totalSchedules: currentSchedules.length,
        schedules: currentSchedules
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      const nowStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Jadwal_Bel_SDN_Kartika_01_${nowStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback('Berkas cadangan jadwal JSON berhasil diunduh.', 'success');
    } catch (err) {
      showFeedback('Gagal mengekspor file: ' + String(err), 'error');
    }
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        let itemsToLoad: ScheduleItem[] = [];

        if (Array.isArray(parsed)) {
          itemsToLoad = parsed;
        } else if (parsed && Array.isArray(parsed.schedules)) {
          itemsToLoad = parsed.schedules;
        } else {
          throw new Error('Format JSON tidak sesuai (harus berupa daftar jadwal).');
        }

        if (itemsToLoad.length === 0) {
          throw new Error('Berkas JSON tidak berisi jadwal aktif.');
        }

        const confirmMsg = `Ditemukan ${itemsToLoad.length} jadwal dari berkas "${file.name}".\n\nApakah Anda yakin ingin memuat jadwal ini? Jadwal saat ini akan diperbarui.`;
        if (window.confirm(confirmMsg)) {
          onImportSchedules(itemsToLoad);
          showFeedback(`Berhasil memuat ${itemsToLoad.length} jadwal dari file "${file.name}"!`, 'success');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'File tidak valid';
        showFeedback(`Gagal membaca berkas JSON: ${message}`, 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  // Download standalone bel-sekolah.html
  const handleDownloadStandaloneHTML = () => {
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', '/bel-sekolah.html');
    downloadAnchor.setAttribute('download', 'bel-sekolah.html');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Perpustakaan & Manajemen Profil Jadwal (Preset Manager)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simpan susunan jadwal ke template (Reguler, PTS, Ramadhan), atau ekspor/impor cadangan JSON antar-komputer sekolah.
            </p>
          </div>
        </div>

        {activePresetName && (
          <span className="self-start sm:self-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Aktif: {activePresetName}
          </span>
        )}
      </div>

      {feedbackMsg && (
        <div className={`p-3.5 mb-5 rounded-xl text-sm flex items-center gap-2.5 border ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Simpan Sebagai Template Baru & List Template */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSavePreset} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Simpan Susunan Jadwal Saat Ini sebagai Profil Baru:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nama profil (misal: Jadwal Ujian PAS 2026)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="sm:col-span-2 px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Simpan Profil</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              *Akan menyimpan seluruh {currentSchedules.length} jadwal aktif saat ini ke daftar template.
            </p>
          </form>

          {/* List Saved Presets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Daftar Profil Jadwal Tersimpan:
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {presets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  Belum ada template profil jadwal.
                </div>
              ) : (
                presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {preset.name}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {preset.schedules.length} Jadwal
                        </span>
                      </div>
                      {preset.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {preset.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          if (window.confirm(`Terapkan profil "${preset.name}"? Jadwal aktif saat ini akan diganti dengan ${preset.schedules.length} jadwal dari profil ini.`)) {
                            onApplyPreset(preset);
                            showFeedback(`Profil "${preset.name}" berhasil diterapkan!`, 'success');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Terapkan</span>
                      </button>

                      {preset.id !== 'preset_reguler' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus template profil "${preset.name}"?`)) {
                              onDeletePreset(preset.id);
                              showFeedback(`Profil "${preset.name}" telah dihapus.`, 'success');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Hapus Profil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Cadangan & Pindahkan Berkas Jadwal (.JSON) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900/60 dark:to-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm mb-1">
              <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cadangkan / Pindahkan Berkas Jadwal (.JSON)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Gunakan fitur ini untuk memindahkan konfigurasi bel sekolah ke laptop operator lain, atau mencadangkan jadwal sebelum format/ganti komputer.
            </p>

            <div className="space-y-3">
              {/* Tombol Unduh JSON */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Unduh Cadangan Jadwal (.JSON)</span>
              </button>

              {/* Upload JSON */}
              <div className="p-3.5 bg-white/70 dark:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="upload-json-file"
                />
                <label
                  htmlFor="upload-json-file"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Upload File Jadwal Tersimpan (.JSON)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik untuk memilih berkas .json cadangan sekolah
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Unduh Standalone File bel-sekolah.html */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleDownloadStandaloneHTML}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
              title="Unduh satu file mandiri bel-sekolah.html yang bisa dibuka offline tanpa internet"
            >
              <span>💾</span>
              <span>Unduh File Offline (bel-sekolah.html)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
