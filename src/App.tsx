/**
 * Aplikasi Bel Sekolah Otomatis
 * SD N KARTIKA SEJAHTERA 01 - Kec. Tajurhalang, Kab. Bogor
 * Penanggung Jawab: Dwi Purnawan, S.Pd.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ScheduleItem,
  AudioItem,
  SchedulePreset,
  DayOfWeek,
  ALL_DAYS,
  DEFAULT_AUDIO_LIBRARY,
  DEFAULT_SCHEDULES,
  DEFAULT_PRESETS,
  PreBellConfig,
  DEFAULT_PRE_BELL_CONFIG
} from './types';
import {
  unlockAudioSystem,
  playSoundItem,
  stopAllPlayback,
  playPreBellCue
} from './audioEngine';
import { EditScheduleModal } from './components/EditScheduleModal';
import { PresetManagerSection } from './components/PresetManagerSection';
import { AudioLibrarySection } from './components/AudioLibrarySection';
import { QuickBellPanel } from './components/QuickBellPanel';
import { PreBellSettingsPanel } from './components/PreBellSettingsPanel';
import { PreBellAlertToast } from './components/PreBellAlertToast';
import {
  Bell,
  Play,
  Square,
  Plus,
  Trash2,
  Edit,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Search,
  Filter,
  CheckSquare,
  Sparkles
} from 'lucide-react';

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('bel_sekolah_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Main system state
  const [isSystemActive, setIsSystemActive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'idle' | 'active' | 'playing' | 'warning' }>({
    text: 'Sistem Bel Belum Aktif — Klik "Aktifkan Sistem Bel" agar bel dapat berbunyi otomatis',
    type: 'warning'
  });

  // Audio Library State
  const [audioLibrary, setAudioLibrary] = useState<AudioItem[]>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_audio_lib');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_AUDIO_LIBRARY;
  });

  // Schedules State
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_schedules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_SCHEDULES;
  });

  // Presets State
  const [presets, setPresets] = useState<SchedulePreset[]>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_PRESETS;
  });

  const [activePresetName, setActivePresetName] = useState<string>(() => {
    return localStorage.getItem('bel_sekolah_active_preset') || 'Jadwal Reguler Standar (KBM Penuh)';
  });

  // Pre-bell configuration state
  const [preBellConfig, setPreBellConfig] = useState<PreBellConfig>(() => {
    try {
      const saved = localStorage.getItem('bel_sekolah_prebell_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRE_BELL_CONFIG;
  });

  // Pre-bell visual alert toast state
  const [preBellAlert, setPreBellAlert] = useState<{
    schedule: ScheduleItem;
    secondsRemaining: number;
    totalSeconds: number;
  } | null>(null);

  // Currently playing sound ID for test indicator
  const [currentPlayingSoundId, setCurrentPlayingSoundId] = useState<string | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(1);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New schedule form state
  const [newTime, setNewTime] = useState('07:00');
  const [newLabel, setNewLabel] = useState('');
  const [newSoundId, setNewSoundId] = useState('');
  const [newDays, setNewDays] = useState<DayOfWeek[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

  // Table filters & search
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Bell triggering state refs
  const lastTriggeredKeyRef = useRef<string>('');
  const lastPreBellTriggerKeyRef = useRef<string>('');

  // Sync theme with document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('bel_sekolah_theme', theme);
  }, [theme]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('bel_sekolah_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('bel_sekolah_presets', JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem('bel_sekolah_audio_lib', JSON.stringify(audioLibrary));
  }, [audioLibrary]);

  useEffect(() => {
    localStorage.setItem('bel_sekolah_active_preset', activePresetName);
  }, [activePresetName]);

  useEffect(() => {
    localStorage.setItem('bel_sekolah_prebell_config', JSON.stringify(preBellConfig));
  }, [preBellConfig]);

  // Default soundId init
  useEffect(() => {
    if (!newSoundId && audioLibrary.length > 0) {
      setNewSoundId(audioLibrary[0].id);
    }
  }, [audioLibrary, newSoundId]);

  // Timer Tick Engine: checks time every second, handles pre-bell warnings & triggers scheduled bells
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const dayIndex = now.getDay();
      const currentDayName = INDONESIAN_DAYS[dayIndex] as DayOfWeek | 'Minggu';

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = now.getSeconds();
      const currentHM = `${hours}:${minutes}`;

      if (isSystemActive && currentDayName !== 'Minggu') {
        const nowSecondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + seconds;

        // 1. Pre-Bell Imminent Notification Check
        if (preBellConfig.enabled) {
          schedules.forEach((s) => {
            if (s.enabled === false || !s.days.includes(currentDayName as DayOfWeek)) return;
            const [h, m] = s.time.split(':').map(Number);
            const targetSeconds = h * 3600 + m * 60;
            const diff = targetSeconds - nowSecondsToday;

            // Trigger pre-bell warning exact N seconds before main bell
            if (diff === preBellConfig.secondsBefore) {
              const preBellKey = `pre-${currentDayName}-${s.id}-${s.time}`;
              if (lastPreBellTriggerKeyRef.current !== preBellKey) {
                lastPreBellTriggerKeyRef.current = preBellKey;

                // Play distinct pre-bell audio cue if sound is enabled
                if (preBellConfig.soundPattern !== 'mute') {
                  playPreBellCue(preBellConfig.soundPattern);
                }

                // Show visual alert toast if enabled
                if (preBellConfig.showVisualAlert) {
                  setPreBellAlert({
                    schedule: s,
                    secondsRemaining: diff,
                    totalSeconds: preBellConfig.secondsBefore
                  });
                }
              }
            }
          });
        }

        // 2. Main Scheduled Bell Trigger Check (at second 0)
        if (seconds === 0) {
          const matchingSchedule = schedules.find(
            s => (s.enabled !== false) && s.days.includes(currentDayName) && s.time === currentHM
          );

          if (matchingSchedule) {
            const triggerKey = `${currentDayName}-${currentHM}-${matchingSchedule.id}`;
            if (lastTriggeredKeyRef.current !== triggerKey) {
              lastTriggeredKeyRef.current = triggerKey;
              setPreBellAlert(null); // Clear any pending pre-bell toast
              handleExecuteBell(matchingSchedule);
            }
          }
        }
      }

      // Progress active pre-bell toast countdown (if one is showing)
      setPreBellAlert((prev) => {
        if (!prev) return null;
        const nextSec = prev.secondsRemaining - 1;
        if (nextSec <= 0) return null;
        return { ...prev, secondsRemaining: nextSec };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSystemActive, schedules, audioLibrary, repeatCount, preBellConfig]);

  // Play Bell Execution
  const handleExecuteBell = async (schedule: ScheduleItem) => {
    const soundItem = audioLibrary.find(a => a.id === schedule.soundId) || audioLibrary[0];
    setStatusMessage({
      text: `🔔 Membunyikan: [${schedule.time}] ${schedule.label}`,
      type: 'playing'
    });
    setCurrentPlayingSoundId(soundItem?.id ?? null);

    try {
      await playSoundItem(soundItem, repeatCount);
    } catch (e) {
      console.error('Playback error:', e);
    } finally {
      setCurrentPlayingSoundId(null);
      if (isSystemActive) {
        setStatusMessage({
          text: 'Sistem Berjalan Normal (Memantau Jadwal Otomatis)',
          type: 'active'
        });
      }
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Activate Audio System
  const handleActivateSystem = async () => {
    const success = await unlockAudioSystem();
    if (success) {
      setIsSystemActive(true);
      setStatusMessage({
        text: 'Sistem Berjalan Normal (Memantau Jadwal Otomatis)',
        type: 'active'
      });
    } else {
      alert('Gagal mengaktifkan sistem audio. Pastikan browser mengizinkan audio.');
    }
  };

  // Stop All Audio
  const handleStopAll = () => {
    stopAllPlayback();
    setCurrentPlayingSoundId(null);
    if (isSystemActive) {
      setStatusMessage({
        text: 'Sistem Berjalan Normal (Audio Dihentikan)',
        type: 'active'
      });
    }
  };

  // Sound testing
  const handleTestSound = async (soundId: string) => {
    const sound = audioLibrary.find(s => s.id === soundId) || audioLibrary[0];
    if (!sound) return;

    if (!isSystemActive) {
      await unlockAudioSystem();
      setIsSystemActive(true);
    }

    setCurrentPlayingSoundId(sound.id);
    setStatusMessage({
      text: `▶️ Sedang Menguji Nada: ${sound.name}`,
      type: 'playing'
    });

    try {
      await playSoundItem(sound, 1);
    } finally {
      setCurrentPlayingSoundId(null);
      if (isSystemActive) {
        setStatusMessage({
          text: 'Sistem Berjalan Normal (Memantau Jadwal Otomatis)',
          type: 'active'
        });
      }
    }
  };

  // Quick Manual Bell
  const handleTriggerQuickBell = async (label: string, soundId: string) => {
    const sound = audioLibrary.find(s => s.id === soundId) || audioLibrary[0];
    if (!isSystemActive) {
      await unlockAudioSystem();
      setIsSystemActive(true);
    }

    setCurrentPlayingSoundId(sound.id);
    setStatusMessage({
      text: `🔔 Membunyikan Manual: ${label}`,
      type: 'playing'
    });

    try {
      await playSoundItem(sound, repeatCount);
    } finally {
      setCurrentPlayingSoundId(null);
      if (isSystemActive) {
        setStatusMessage({
          text: 'Sistem Berjalan Normal (Memantau Jadwal Otomatis)',
          type: 'active'
        });
      }
    }
  };

  // Test Pre-Bell Notification Simulation
  const handleTestPreBell = async () => {
    if (!isSystemActive) {
      await unlockAudioSystem();
      setIsSystemActive(true);
    }

    if (preBellConfig.soundPattern !== 'mute') {
      playPreBellCue(preBellConfig.soundPattern);
    }

    const testItem: ScheduleItem = {
      id: 'test_pre_bell',
      time: currentHM,
      label: 'Bel Masuk Kelas & Pembiasaan (Simulasi Uji Coba Pra-Bel)',
      soundId: audioLibrary[0]?.id ?? 'snd_westminster',
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      enabled: true
    };

    setPreBellAlert({
      schedule: testItem,
      secondsRemaining: preBellConfig.secondsBefore,
      totalSeconds: preBellConfig.secondsBefore
    });

    setStatusMessage({
      text: `⚠️ Menguji Notifikasi Pra-Bel (${preBellConfig.secondsBefore} detik sebelum bel)`,
      type: 'warning'
    });
  };

  // Add new schedule
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || !newLabel.trim()) {
      alert('Harap isi jam dan keterangan agenda!');
      return;
    }
    if (newDays.length === 0) {
      alert('Pilih minimal satu hari (Senin s/d Sabtu)!');
      return;
    }

    const itemToAdd: ScheduleItem = {
      id: Date.now(),
      time: newTime,
      label: newLabel.trim(),
      soundId: newSoundId || (audioLibrary[0]?.id ?? 'snd_westminster'),
      days: newDays,
      enabled: true
    };

    const updated = [...schedules, itemToAdd].sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(updated);
    setNewLabel('');
    setActivePresetName('Kustom (Belum Disimpan)');
  };

  // Edit schedule
  const handleOpenEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedItem: ScheduleItem) => {
    const updated = schedules.map(s => (s.id === updatedItem.id ? updatedItem : s));
    updated.sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(updated);
    setActivePresetName('Kustom (Telah Diubah)');
  };

  // Delete schedule
  const handleDeleteSchedule = (id: number | string) => {
    if (window.confirm('Hapus jadwal kegiatan ini?')) {
      const updated = schedules.filter(s => s.id !== id);
      setSchedules(updated);
      setActivePresetName('Kustom (Belum Disimpan)');
    }
  };

  // Toggle item active
  const handleToggleScheduleEnabled = (id: number | string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: s.enabled === false ? true : false } : s))
    );
  };

  // Presets Handlers
  const handleApplyPreset = (preset: SchedulePreset) => {
    const copy = JSON.parse(JSON.stringify(preset.schedules));
    setSchedules(copy);
    setActivePresetName(preset.name);
  };

  const handleSaveCurrentAsPreset = (name: string, description?: string) => {
    const newPreset: SchedulePreset = {
      id: 'preset_' + Date.now(),
      name,
      description: description || `Disimpan pada ${new Date().toLocaleDateString('id-ID')}`,
      createdAt: new Date().toISOString().slice(0, 10),
      schedules: JSON.parse(JSON.stringify(schedules))
    };
    setPresets(prev => [...prev, newPreset]);
    setActivePresetName(name);
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
  };

  const handleImportSchedules = (imported: ScheduleItem[]) => {
    const sorted = [...imported].sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(sorted);
    setActivePresetName('Impor Berkas Cadangan');
  };

  // Audio Library Handlers
  const handleAddAudio = (newItem: AudioItem) => {
    setAudioLibrary(prev => [...prev, newItem]);
  };

  const handleDeleteAudio = (id: string) => {
    setAudioLibrary(prev => prev.filter(a => a.id !== id));
  };

  // Current Day info
  const dayIndex = currentTime.getDay();
  const currentIndoDay = INDONESIAN_DAYS[dayIndex] as DayOfWeek | 'Minggu';
  const currentDateFormatted = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const currentTimeFormatted = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Calculate upcoming bell for today
  const todaySchedules = schedules
    .filter(s => (s.enabled !== false) && s.days.includes(currentIndoDay as DayOfWeek))
    .sort((a, b) => a.time.localeCompare(b.time));

  const currentHM = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  const nextBell = todaySchedules.find(s => s.time > currentHM);

  // Filtered schedules for table display
  const filteredSchedules = schedules.filter(item => {
    // Day filter
    if (selectedDayFilter === 'Hari Ini') {
      if (currentIndoDay === 'Minggu' || !item.days.includes(currentIndoDay as DayOfWeek)) return false;
    } else if (selectedDayFilter !== 'Semua') {
      if (!item.days.includes(selectedDayFilter as DayOfWeek)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const soundObj = audioLibrary.find(a => a.id === item.soundId);
      const soundName = soundObj ? soundObj.name.toLowerCase() : '';
      return (
        item.label.toLowerCase().includes(q) ||
        item.time.includes(q) ||
        soundName.includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* FLOATING PRE-BELL IMMINENT ALERT TOAST */}
      <PreBellAlertToast
        schedule={preBellAlert?.schedule ?? null}
        secondsRemaining={preBellAlert?.secondsRemaining ?? 0}
        totalSeconds={preBellAlert?.totalSeconds ?? preBellConfig.secondsBefore}
        onDismiss={() => setPreBellAlert(null)}
        onTriggerNow={(s) => {
          setPreBellAlert(null);
          handleExecuteBell(s);
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* HEADER SEKOLAH */}
        <header className="bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/25 shrink-0 ring-4 ring-blue-50 dark:ring-slate-700/50">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Sistem Otomasi
                </span>
                <span className="text-xs text-slate-400">Versi 2.5 Pro</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                SD N KARTIKA SEJAHTERA 01
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Kecamatan Tajurhalang, Kabupaten Bogor
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-2.5 py-0.5 rounded-full">
                  <span>Penanggung Jawab:</span>
                  <span className="font-bold">Dwi Purnawan, S.Pd.</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300/60 dark:border-slate-600 transition shadow-sm"
              title="Ganti Mode Gelap/Terang"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* PANEL JAM DIGITAL & KONTROL SISTEM */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

          {/* Tanggal & Hari */}
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold tracking-wide uppercase">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Jam Digital Besar */}
          <div className="my-2 sm:my-3 font-mono font-black text-5xl sm:text-7xl tracking-wider text-blue-600 dark:text-blue-400 tabular-nums drop-shadow-sm select-none">
            {currentTimeFormatted}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 my-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                statusMessage.type === 'playing'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 animate-pulse border border-blue-300 dark:border-blue-700'
                  : statusMessage.type === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
              }`}
            >
              {statusMessage.type === 'playing' ? (
                <Bell className="w-4 h-4 animate-bounce text-blue-600 dark:text-blue-400" />
              ) : statusMessage.type === 'active' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>

            {/* Next upcoming bell info */}
            {nextBell && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                Berikutnya: <strong className="text-blue-600 dark:text-blue-400">[{nextBell.time}] {nextBell.label}</strong>
              </span>
            )}

            {/* Pre-bell status indicator */}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className={preBellConfig.enabled ? 'text-amber-500 font-bold' : 'text-slate-400'}>⚡</span>
              <span>
                Pra-Bel:{' '}
                <strong className={preBellConfig.enabled ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400'}>
                  {preBellConfig.enabled
                    ? `${preBellConfig.secondsBefore} dtk (${preBellConfig.soundPattern !== 'mute' ? 'Nada & Visual' : 'Hanya Visual'})`
                    : 'Non-Aktif'}
                </strong>
              </span>
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {!isSystemActive ? (
              <button
                onClick={handleActivateSystem}
                type="button"
                className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Aktifkan Sistem Bel Otomatis</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sistem Sedang Memantau</span>
              </div>
            )}

            <button
              onClick={handleStopAll}
              type="button"
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition cursor-pointer"
              title="Hentikan semua suara yang sedang bersuara"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Suara / Matikan Bel</span>
            </button>
          </div>
        </section>

        {/* QUICK MANUAL BELL PANEL */}
        <QuickBellPanel
          audioLibrary={audioLibrary}
          onTriggerQuickBell={handleTriggerQuickBell}
          isSystemActive={isSystemActive}
        />

        {/* PENGATURAN NOTIFIKASI PRA-BEL (PRE-BELL ALERT) */}
        <PreBellSettingsPanel
          config={preBellConfig}
          onChange={setPreBellConfig}
          onTestPreBell={handleTestPreBell}
          isSystemActive={isSystemActive}
        />

        {/* FORM TAMBAH JADWAL MANUAL */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Atur Jadwal Baru (Manual)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambahkan jam kegiatan pembelajaran, istirahat, maupun kepulangan siswa.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Waktu */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Waktu Bel (Jam:Menit)
                </label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Keterangan */}
              <div className="md:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Keterangan Kegiatan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jam Masuk / Istirahat Siang / Pulang"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Suara Bel */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Pilih Suara Bel
                </label>
                <div className="flex gap-2">
                  <select
                    value={newSoundId}
                    onChange={(e) => setNewSoundId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    {audioLibrary.map((snd) => (
                      <option key={snd.id} value={snd.id}>
                        {snd.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Tes Suara Ini"
                    onClick={() => handleTestSound(newSoundId)}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800 transition flex items-center justify-center shrink-0"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist Hari Aktif */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pilih Hari Aktif (Senin s/d Sabtu):
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewDays([...ALL_DAYS])}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Centang Semua
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setNewDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Senin–Jumat
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setNewDays([])}
                    className="text-slate-500 hover:underline font-medium"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {ALL_DAYS.map((day) => {
                  const isChecked = newDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setNewDays(newDays.filter(d => d !== day));
                        } else {
                          setNewDays([...newDays, day]);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 dark:bg-blue-950/40'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-sm border border-slate-400 shrink-0" />
                      )}
                      <span>{day}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah ke Tabel Jadwal</span>
              </button>
            </div>
          </form>
        </section>

        {/* TABEL JADWAL BEL SEKOLAH DENGAN TOMBOL EDIT */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          {/* Header Tabel & Filter Hari */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  Tabel Jadwal Bel Sekolah
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total: <strong className="text-blue-600 dark:text-blue-400">{schedules.length} Jadwal Terdaftar</strong>
                {selectedDayFilter !== 'Semua' && ` (Menampilkan: ${selectedDayFilter})`}
              </p>
            </div>

            {/* Controls: Search & Day Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari jam / kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 w-full sm:w-48"
                />
              </div>

              {/* Day filter pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['Semua', 'Hari Ini', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDayFilter(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedDayFilter === day
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Keterangan Kegiatan</th>
                  <th className="py-3 px-4">Hari Berlaku</th>
                  <th className="py-3 px-4">File / Nada Suara</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Tidak ada jadwal yang cocok dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((item) => {
                    const soundObj = audioLibrary.find(a => a.id === item.soundId);
                    const isUpcoming =
                      currentIndoDay !== 'Minggu' &&
                      item.days.includes(currentIndoDay as DayOfWeek) &&
                      item.time > currentHM &&
                      item.time === nextBell?.time;
                    const isPlaying = currentPlayingSoundId === item.soundId;
                    const isEnabled = item.enabled !== false;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition ${
                          isUpcoming
                            ? 'bg-blue-50/50 dark:bg-blue-950/20 font-medium'
                            : !isEnabled
                            ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30'
                            : ''
                        }`}
                      >
                        {/* Waktu */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-blue-600 dark:text-blue-400">
                              {item.time}
                            </span>
                            {isUpcoming && (
                              <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                BERIKUTNYA
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Keterangan */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {item.label}
                          </div>
                        </td>

                        {/* Hari Berlaku */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {item.days.map((day) => {
                              const isToday = day === currentIndoDay;
                              return (
                                <span
                                  key={day}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    isToday
                                      ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* File Suara */}
                        <td className="py-3.5 px-4 text-xs">
                          {soundObj ? (
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Bell className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">{soundObj.name}</span>
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">Suara Dihapus</span>
                          )}
                        </td>

                        {/* Toggle Aktif */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleScheduleEnabled(item.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              isEnabled
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                            }`}
                            title={isEnabled ? 'Klik untuk non-aktifkan jadwal ini' : 'Klik untuk aktifkan jadwal ini'}
                          >
                            {isEnabled ? 'Aktif' : 'Non-Aktif'}
                          </button>
                        </td>

                        {/* Aksi: Tes, Edit, Hapus */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Tombol Tes Nada */}
                            <button
                              type="button"
                              onClick={() => handleTestSound(item.soundId)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900 transition"
                              title="Tes Suara Ini"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>

                            {/* Tombol Edit Jadwal (Fitur 1) */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition"
                              title="Edit Jadwal Ini (Buka Modal Pop-up)"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PERPUSTAKAAN PROFIL JADWAL (PRESET MANAGER) & CADANGAN JSON (Fitur 2 & 3) */}
        <PresetManagerSection
          currentSchedules={schedules}
          presets={presets}
          activePresetName={activePresetName}
          onApplyPreset={handleApplyPreset}
          onSaveCurrentAsPreset={handleSaveCurrentAsPreset}
          onDeletePreset={handleDeletePreset}
          onImportSchedules={handleImportSchedules}
        />

        {/* PERPUSTAKAAN SUARA BEL & PENGATURAN VOLUME */}
        <AudioLibrarySection
          audioLibrary={audioLibrary}
          currentPlayingId={currentPlayingSoundId}
          onPlaySound={(item) => handleTestSound(item.id)}
          onStopSound={handleStopAll}
          onAddAudio={handleAddAudio}
          onDeleteAudio={handleDeleteAudio}
          repeatCount={repeatCount}
          onRepeatCountChange={setRepeatCount}
        />

        {/* FOOTER */}
        <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-600 dark:text-slate-400">
            Aplikasi Bel Sekolah Otomatis • SD N Kartika Sejahtera 01
          </p>
          <p className="mt-1">
            Kecamatan Tajurhalang, Kabupaten Bogor • Penanggung Jawab: Dwi Purnawan, S.Pd.
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Dilengkapi Sintesis Web Audio Offline, Manajemen Preset Profil, Ekspor/Impor Cadangan JSON, dan Modal Edit Terintegrasi.
          </p>
        </footer>

      </div>

      {/* POP-UP MODAL EDIT JADWAL (FITUR 1) */}
      <EditScheduleModal
        isOpen={isEditModalOpen}
        item={editingItem}
        audioLibrary={audioLibrary}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEdit}
        onTestSound={handleTestSound}
      />
    </div>
  );
}
