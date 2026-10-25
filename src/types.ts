export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export const ALL_DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export interface AudioItem {
  id: string;
  name: string;
  type?: 'synth' | 'audio';
  synthPattern?: 'westminster' | 'modern' | 'electric';
  url?: string;
  isBuiltIn?: boolean;
}

export interface ScheduleItem {
  id: number | string;
  time: string; // "HH:mm" (24-hour)
  label: string;
  soundId: string;
  days: DayOfWeek[];
  enabled?: boolean;
}

export interface SchedulePreset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  schedules: ScheduleItem[];
}

export interface PreBellConfig {
  enabled: boolean;
  secondsBefore: number; // e.g. 3, 5, 10, 15
  soundPattern: 'soft_dual' | 'radar_beep' | 'short_ding' | 'mute';
  showVisualAlert: boolean;
}

export const DEFAULT_PRE_BELL_CONFIG: PreBellConfig = {
  enabled: true,
  secondsBefore: 5,
  soundPattern: 'soft_dual',
  showVisualAlert: true
};

export const DEFAULT_AUDIO_LIBRARY: AudioItem[] = [
  {
    id: "snd_westminster",
    name: "Nada Melodi Westminster (Chime Alami)",
    type: "synth",
    synthPattern: "westminster",
    isBuiltIn: true
  },
  {
    id: "snd_modern",
    name: "Nada Tri-Tone Modern (C-E-G)",
    type: "synth",
    synthPattern: "modern",
    isBuiltIn: true
  },
  {
    id: "snd_electric",
    name: "Bel Kring Listrik Tradisional",
    type: "synth",
    synthPattern: "electric",
    isBuiltIn: true
  },
  {
    id: "snd_alarm",
    name: "Alarm Digital Pagi",
    type: "audio",
    url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
    isBuiltIn: true
  },
  {
    id: "snd_bugle",
    name: "Terompet Bugle Istirahat",
    type: "audio",
    url: "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
    isBuiltIn: true
  }
];

export const DEFAULT_SCHEDULES: ScheduleItem[] = [
  { id: 101, time: "06:45", label: "Pintu Gerbang & Pembiasaan Pagi", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], enabled: true },
  { id: 102, time: "07:00", label: "Bel Masuk Kelas / Upacara Bendera", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], enabled: true },
  { id: 103, time: "09:30", label: "Istirahat Pertama (Kelas 1 - 3)", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
  { id: 104, time: "10:00", label: "Masuk Kelas Selesai Istirahat 1", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
  { id: 105, time: "11:30", label: "Bel Pulang Hari Jumat (Sholat Jumat)", soundId: "snd_westminster", days: ["Jumat"], enabled: true },
  { id: 106, time: "12:00", label: "Istirahat Kedua / Sholat Dzuhur", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis"], enabled: true },
  { id: 107, time: "12:45", label: "Masuk Pembelajaran Siang", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis"], enabled: true },
  { id: 108, time: "14:00", label: "Bel Pulang Sekolah", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
];

export const DEFAULT_PRESETS: SchedulePreset[] = [
  {
    id: "preset_reguler",
    name: "Jadwal Reguler Standar (KBM Penuh)",
    description: "Jadwal harian normal pembelajaran SD N Kartika Sejahtera 01",
    createdAt: "2026-01-10",
    schedules: [
      { id: 101, time: "06:45", label: "Pintu Gerbang & Pembiasaan Pagi", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], enabled: true },
      { id: 102, time: "07:00", label: "Bel Masuk Kelas / Upacara Bendera", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], enabled: true },
      { id: 103, time: "09:30", label: "Istirahat Pertama (Kelas 1 - 3)", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
      { id: 104, time: "10:00", label: "Masuk Kelas Selesai Istirahat 1", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
      { id: 105, time: "11:30", label: "Bel Pulang Hari Jumat (Sholat Jumat)", soundId: "snd_westminster", days: ["Jumat"], enabled: true },
      { id: 106, time: "12:00", label: "Istirahat Kedua / Sholat Dzuhur", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis"], enabled: true },
      { id: 107, time: "12:45", label: "Masuk Pembelajaran Siang", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis"], enabled: true },
      { id: 108, time: "14:00", label: "Bel Pulang Sekolah", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Sabtu"], enabled: true },
    ]
  },
  {
    id: "preset_pts",
    name: "Jadwal Penilaian Tengah Semester (PTS/STS)",
    description: "Jadwal ujian 2 sesi tanpa istirahat panjang",
    createdAt: "2026-03-01",
    schedules: [
      { id: 201, time: "07:15", label: "Masuk Ruang Ujian & Pengisian Daftar Hadir", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 202, time: "07:30", label: "Mulai Pengerjaan Ujian Sesi 1", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 203, time: "09:00", label: "Ujian Sesi 1 Berakhir / Istirahat 30 Menit", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 204, time: "09:30", label: "Mulai Pengerjaan Ujian Sesi 2", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 205, time: "11:00", label: "Ujian Sesi 2 Selesai / Bel Pulang", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true }
    ]
  },
  {
    id: "preset_ramadhan",
    name: "Jadwal Khusus Bulan Ramadhan",
    description: "Pengurangan durasi jam belajar selama bulan puasa",
    createdAt: "2026-03-15",
    schedules: [
      { id: 301, time: "07:30", label: "Tadarus Pagi / Sholat Dhuha Bersama", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 302, time: "08:00", label: "KBM Jam Ke-1 Dimulai", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 303, time: "09:45", label: "Istirahat Singkat Ramadhan (15 Menit)", soundId: "snd_bugle", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 304, time: "10:00", label: "KBM Lanjutan", soundId: "snd_modern", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true },
      { id: 305, time: "11:45", label: "Bel Pulang Ramadhan", soundId: "snd_westminster", days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], enabled: true }
    ]
  }
];
