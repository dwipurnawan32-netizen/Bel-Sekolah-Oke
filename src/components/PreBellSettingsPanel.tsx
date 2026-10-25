import React from 'react';
import { PreBellConfig } from '../types';
import { Bell, Play, Sliders, Eye, VolumeX, Sparkles, AlertCircle } from 'lucide-react';

interface PreBellSettingsPanelProps {
  config: PreBellConfig;
  onChange: (newConfig: PreBellConfig) => void;
  onTestPreBell: () => void;
  isSystemActive: boolean;
}

export const PreBellSettingsPanel: React.FC<PreBellSettingsPanelProps> = ({
  config,
  onChange,
  onTestPreBell,
  isSystemActive
}) => {
  const soundOptions: Array<{
    id: PreBellConfig['soundPattern'];
    label: string;
    desc: string;
  }> = [
    {
      id: 'soft_dual',
      label: 'Nada Ganda Lembut (Dual Chime)',
      desc: 'Dua nada harmonik lembut beruntun (E5 → A5)'
    },
    {
      id: 'radar_beep',
      label: 'Ping Radar Peringatan (Radar Beep)',
      desc: 'Dua nada peringatan elektronik singkat berpresisi tinggi'
    },
    {
      id: 'short_ding',
      label: 'Ketukan Bel Singkat (Bell Ding)',
      desc: 'Satu dentingan bel segitiga tajam dan jernih'
    },
    {
      id: 'mute',
      label: 'Hening (Hanya Visual)',
      desc: 'Tidak ada suara awal, hanya notifikasi visual layar'
    }
  ];

  const secondOptions = [3, 5, 10, 15, 20, 30];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Sistem Notifikasi Pra-Bel (Pre-Bell Imminent Alert)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                Fitur Baru
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Membunyikan nada tanda awal atau memunculkan peringatan visual beberapa detik sebelum bel utama berbunyi.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none self-start sm:self-center">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {config.enabled ? 'Pra-Bel Aktif' : 'Pra-Bel Non-Aktif'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Waktu Hitung Mundur (Detik Sebelum Bel) */}
        <div className="md:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Waktu Peringatan Awal:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {secondOptions.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={!config.enabled}
                  onClick={() => onChange({ ...config, secondsBefore: sec })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    config.secondsBefore === sec
                      ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 dark:bg-amber-950/50 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  } ${!config.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sec} Detik {sec === 5 && '⭐'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              *Tanda awal akan berbunyi tepat <strong className="text-slate-700 dark:text-slate-300">{config.secondsBefore} detik</strong> sebelum jam bel utama tiba (misal: 06:59:{60 - config.secondsBefore} untuk bel 07:00).
            </p>
          </div>

          {/* Toggle Alert Visual */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                disabled={!config.enabled}
                checked={config.showVisualAlert}
                onChange={(e) => onChange({ ...config, showVisualAlert: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tampilkan Spanduk Countdown Visual di Layar</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Menampilkan banner hitung mundur animasi 5 detik di bagian atas layar.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Pilihan Suara Tanda Awal */}
        <div className="md:col-span-7 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Pilihan Nada Suara Pra-Bel:
          </label>

          <div className="space-y-2">
            {soundOptions.map((opt) => {
              const isSelected = config.soundPattern === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => config.enabled && onChange({ ...config, soundPattern: opt.id })}
                  className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700/80'
                  } ${!config.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="preBellSoundPattern"
                      disabled={!config.enabled}
                      checked={isSelected}
                      onChange={() => onChange({ ...config, soundPattern: opt.id })}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  {opt.id !== 'mute' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Web Audio</span>
                    </span>
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Test Button & System active note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onTestPreBell}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Uji Coba Notifikasi Pra-Bel Sekarang</span>
            </button>

            {!isSystemActive && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>*Pra-bel aktif saat sistem sedang berjalan</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
