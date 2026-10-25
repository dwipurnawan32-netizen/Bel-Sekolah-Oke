import React from 'react';
import { AudioItem } from '../types';
import { BellRing, Coffee, DoorOpen, AlertTriangle } from 'lucide-react';

interface QuickBellPanelProps {
  audioLibrary: AudioItem[];
  onTriggerQuickBell: (label: string, soundId: string) => void;
  isSystemActive: boolean;
}

export const QuickBellPanel: React.FC<QuickBellPanelProps> = ({
  audioLibrary,
  onTriggerQuickBell,
  isSystemActive
}) => {
  // Find appropriate sounds
  const chimeSound = audioLibrary.find(a => a.id === 'snd_westminster') || audioLibrary[0];
  const breakSound = audioLibrary.find(a => a.id === 'snd_bugle') || audioLibrary[0];
  const electricSound = audioLibrary.find(a => a.id === 'snd_electric') || audioLibrary[0];

  const quickActions = [
    {
      label: 'Bel Masuk / Apel',
      icon: BellRing,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      soundId: chimeSound?.id ?? ''
    },
    {
      label: 'Bel Istirahat',
      icon: Coffee,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      soundId: breakSound?.id ?? ''
    },
    {
      label: 'Bel Pulang',
      icon: DoorOpen,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      soundId: chimeSound?.id ?? ''
    },
    {
      label: 'Peringatan Darurat',
      icon: AlertTriangle,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      soundId: electricSound?.id ?? ''
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Tombol Bel Manual Cepat (Guru Piket):</span>
        </span>
        <span className="text-[11px] text-slate-400">
          Klik tombol di bawah untuk membunyikan bel seketika tanpa menunggu jadwal
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onTriggerQuickBell(action.label, action.soundId)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${action.color}`}
              title={`Bunyikan nada ${action.label} sekarang`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
