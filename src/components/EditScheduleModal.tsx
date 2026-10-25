import React, { useState, useEffect } from 'react';
import { ScheduleItem, AudioItem, DayOfWeek, ALL_DAYS } from '../types';
import { X, Clock, Bell, CheckSquare, Square, Save } from 'lucide-react';

interface EditScheduleModalProps {
  isOpen: boolean;
  item: ScheduleItem | null;
  audioLibrary: AudioItem[];
  onClose: () => void;
  onSave: (updatedItem: ScheduleItem) => void;
  onTestSound: (soundId: string) => void;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  item,
  audioLibrary,
  onClose,
  onSave,
  onTestSound
}) => {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [soundId, setSoundId] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (item) {
      setTime(item.time || '07:00');
      setLabel(item.label || '');
      setSoundId(item.soundId || (audioLibrary[0]?.id ?? ''));
      setSelectedDays(item.days || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
      setErrorMsg('');
    }
  }, [item, audioLibrary]);

  if (!isOpen || !item) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const selectAllDays = () => {
    setSelectedDays([...ALL_DAYS]);
  };

  const selectWeekdaysOnly = () => {
    setSelectedDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) {
      setErrorMsg('Waktu bel tidak boleh kosong.');
      return;
    }
    if (!label.trim()) {
      setErrorMsg('Keterangan kegiatan harus diisi.');
      return;
    }
    if (selectedDays.length === 0) {
      setErrorMsg('Pilih minimal satu hari aktif (Senin s/d Sabtu).');
      return;
    }

    onSave({
      ...item,
      time,
      label: label.trim(),
      soundId,
      days: selectedDays
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </span>
            <span>Edit Jadwal Bel Sekolah</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </div>
          )}

          {/* Time & Sound row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Waktu Bel (24 Jam)
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Pilih Suara Bel
              </label>
              <div className="flex gap-2">
                <select
                  value={soundId}
                  onChange={(e) => setSoundId(e.target.value)}
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
                  onClick={() => onTestSound(soundId)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800 transition flex items-center justify-center shrink-0"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Label / Activity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Keterangan Kegiatan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bel Masuk Kelas / Istirahat Pagi / Upacara"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Days selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pilih Hari Aktif ({selectedDays.length} hari dipilih)
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={selectWeekdaysOnly}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Senin–Jumat
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {ALL_DAYS.map((day) => {
                const isChecked = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
                      isChecked
                        ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 dark:bg-blue-950/40'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
