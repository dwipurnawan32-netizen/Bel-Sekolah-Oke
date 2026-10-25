import React, { useState, useRef } from 'react';
import { AudioItem } from '../types';
import { Music, Play, Square, Upload, Trash2, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { setMasterVolume, getMasterVolume } from '../audioEngine';

interface AudioLibrarySectionProps {
  audioLibrary: AudioItem[];
  currentPlayingId: string | null;
  onPlaySound: (item: AudioItem) => void;
  onStopSound: () => void;
  onAddAudio: (newItem: AudioItem) => void;
  onDeleteAudio: (id: string) => void;
  repeatCount: number;
  onRepeatCountChange: (count: number) => void;
}

export const AudioLibrarySection: React.FC<AudioLibrarySectionProps> = ({
  audioLibrary,
  currentPlayingId,
  onPlaySound,
  onStopSound,
  onAddAudio,
  onDeleteAudio,
  repeatCount,
  onRepeatCountChange
}) => {
  const [audioName, setAudioName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(Math.round(getMasterVolume() * 100));
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    if (!audioName) {
      setAudioName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBase64) {
      alert('Pilih file audio (MP3/WAV/OGG) terlebih dahulu!');
      return;
    }

    const nameToUse = audioName.trim() || selectedFileName || 'Nada Bel Khusus';
    const newAudio: AudioItem = {
      id: 'snd_' + Date.now(),
      name: nameToUse,
      type: 'audio',
      url: fileBase64,
      isBuiltIn: false
    };

    onAddAudio(newAudio);
    setAudioName('');
    setSelectedFileName('');
    setFileBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVolumeChange = (newVolPercent: number) => {
    setVolume(newVolPercent);
    setMasterVolume(newVolPercent / 100);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Perpustakaan Suara Bel Sekolah
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilihan nada chime otomatis (100% offline) dan unggahan file audio MP3/WAV khusus.
            </p>
          </div>
        </div>

        {/* Volume & Repeat control */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 sm:w-24 accent-blue-600 h-1.5 cursor-pointer"
              title={`Volume: ${volume}%`}
            />
            <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300 w-8">
              {volume}%
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Ulang:</span>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onRepeatCountChange(num)}
                className={`px-2 py-0.5 rounded-md text-xs transition ${
                  repeatCount === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daftar Audio */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Daftar Nada Tersedia ({audioLibrary.length}):</span>
            <span className="text-[11px] font-normal text-slate-400">
              *Nada bertanda bintang dijamin berbunyi tanpa internet
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {audioLibrary.map((snd) => {
              const isPlaying = currentPlayingId === snd.id;
              return (
                <div
                  key={snd.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isPlaying
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isPlaying
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {snd.name}
                        </span>
                        {snd.type === 'synth' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 shrink-0" title="Web Audio Synthesizer: 100% Offline Reliable">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Synthesizer</span>
                          </span>
                        )}
                        {snd.isBuiltIn && snd.type !== 'synth' && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Bawaan</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {snd.type === 'synth'
                          ? 'Dihasilkan oleh synthesizer browser (Suara jernih tanpa perlu kuota)'
                          : snd.url?.startsWith('data:')
                          ? 'Audio tersimpan di memori peramban'
                          : 'Audio daring / berkas lokal'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPlaying ? (
                      <button
                        type="button"
                        onClick={onStopSound}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition active:scale-95"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPlaySound(snd)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Tes</span>
                      </button>
                    )}

                    {!snd.isBuiltIn && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus nada "${snd.name}" dari perpustakaan?`)) {
                            onDeleteAudio(snd.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Hapus Nada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unggah Audio Baru */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Unggah Nada Bel Baru</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unggah file audio MP3, WAV, atau rekaman suara pengumuman untuk dijadikan pilihan nada bel.
          </p>

          <form onSubmit={handleUploadSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Pilih Berkas Audio:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nama / Keterangan Suara:
              </label>
              <input
                type="text"
                placeholder="Contoh: Bel Masuk / Lagu Indonesia Raya"
                value={audioName}
                onChange={(e) => setAudioName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={!fileBase64}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm ${
                fileBase64
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Simpan ke Perpustakaan Suara</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
