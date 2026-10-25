import React, { useEffect, useState } from 'react';
import { ScheduleItem } from '../types';
import { Bell, Clock, X, Zap } from 'lucide-react';

interface PreBellAlertToastProps {
  schedule: ScheduleItem | null;
  secondsRemaining: number;
  totalSeconds: number;
  onDismiss: () => void;
  onTriggerNow: (schedule: ScheduleItem) => void;
}

export const PreBellAlertToast: React.FC<PreBellAlertToastProps> = ({
  schedule,
  secondsRemaining,
  totalSeconds,
  onDismiss,
  onTriggerNow
}) => {
  if (!schedule) return null;

  const progressPercent = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-amber-400 p-4 sm:p-5 backdrop-blur-md">
        {/* Animated Progress Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-start justify-between gap-3 pt-1">
          {/* Left Icon with pulse */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400/20 text-amber-300 uppercase tracking-wider border border-amber-400/30">
                  ⚠️ Peringatan Pra-Bel
                </span>
                <span className="text-xs text-amber-200/80 font-medium">
                  Bel Utama Siap Berbunyi
                </span>
              </div>

              <h4 className="font-bold text-base sm:text-lg text-white mt-0.5 line-clamp-1">
                [{schedule.time}] {schedule.label}
              </h4>

              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Akan berbunyi otomatis dalam{' '}
                  <strong className="text-amber-300 font-mono text-sm font-extrabold tabular-nums">
                    {secondsRemaining} Detik
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Countdown Circle & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Big Countdown Number */}
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-black text-lg text-amber-300 bg-amber-500/10">
              {secondsRemaining}
            </div>

            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Tutup Notifikasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onTriggerNow(schedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Bunyikan Bel Sekarang Tanpa Menunggu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
