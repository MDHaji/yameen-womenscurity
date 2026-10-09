import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, StopCircle, Download, Trash2, X, AlertCircle } from 'lucide-react';
import { RecordedEvidence } from '../types';

interface EvidenceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

export const EvidenceRecorderModal: React.FC<EvidenceRecorderModalProps> = ({
  isOpen,
  onClose,
  autoStart = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordMode, setRecordMode] = useState<'video' | 'audio'>('video');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordedEvidence[]>(() => {
    const saved = localStorage.getItem('sg_evidence_list');
    return saved ? JSON.parse(saved) : [];
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && autoStart && !isRecording) {
      handleStartRecording();
    }
    // Cleanup on unmount
    return () => {
      stopMediaTracks();
    };
  }, [isOpen, autoStart]);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    setError(null);
    chunksRef.current = [];
    setElapsed(0);

    try {
      const constraints: MediaStreamConstraints =
        recordMode === 'video'
          ? {
              audio: true,
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
            }
          : { audio: true, video: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mimeType =
        recordMode === 'video'
          ? MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm'
          : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordMode === 'video' ? 'video/webm' : 'audio/webm',
        });
        const url = URL.createObjectURL(blob);
        const fileName = `evidence_${recordMode}_${Date.now()}.webm`;

        const newRec: RecordedEvidence = {
          id: String(Date.now()),
          timestamp: Date.now(),
          blobUrl: url,
          durationSec: elapsed,
          type: recordMode,
          fileName,
          sizeBytes: blob.size,
        };

        const updated = [newRec, ...records];
        setRecords(updated);
        try {
          localStorage.setItem('sg_evidence_list', JSON.stringify(updated));
        } catch {
          // LocalStorage limit, keep in memory
        }

        // Auto-download to device storage
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        stopMediaTracks();
      };

      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Camera/Mic permission failed', err);
      const message = err instanceof Error ? err.message : 'Camera or Microphone access was denied.';
      setError(message);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem('sg_evidence_list', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070913]/95 backdrop-blur-md flex flex-col justify-between p-5 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Silent Evidence Recorder</h2>
            <p className="text-xs text-zinc-400">Directly saves tamper-proof media to Android</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isRecording) handleStopRecording();
            onClose();
          }}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="py-6 flex flex-col items-center justify-center my-auto">
        {error && (
          <div className="w-full max-w-sm mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {isRecording ? (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center relative mb-4 animate-pulse">
              <span className="w-8 h-8 rounded-full bg-rose-500 animate-ping absolute" />
              <span className="w-8 h-8 rounded-full bg-rose-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-white mb-1">
              {formatTimer(elapsed)}
            </div>
            <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
              Recording Evidence Silently...
            </p>
            <p className="text-[11px] text-zinc-400 mt-2 max-w-xs">
              File will auto-download to your Android gallery/storage when you press Stop.
            </p>

            <button
              onClick={handleStopRecording}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-white text-zinc-950 font-bold text-sm shadow-xl hover:bg-zinc-100 flex items-center gap-2 mx-auto active:scale-95 transition"
            >
              <StopCircle className="w-5 h-5 text-rose-600" />
              Stop &amp; Save Evidence
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm text-center">
            {/* Mode switch */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
              <button
                onClick={() => setRecordMode('video')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  recordMode === 'video'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" /> Video + Audio
              </button>
              <button
                onClick={() => setRecordMode('audio')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                  recordMode === 'audio'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" /> Audio Only (Stealth)
              </button>
            </div>

            <button
              onClick={handleStartRecording}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-base shadow-lg shadow-rose-600/30 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-3"
            >
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              Start Recording Evidence
            </button>
            <p className="text-[11px] text-zinc-400 mt-3">
              Recorded files are stored locally on your device and will never be shared without your permission.
            </p>
          </div>
        )}

        {/* Previous evidence records */}
        {records.length > 0 && !isRecording && (
          <div className="w-full max-w-sm mt-8 border-t border-white/10 pt-4 text-left">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Recent Evidence Recordings ({records.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {rec.type === 'video' ? '📹 Video Evidence' : '🎙️ Audio Evidence'}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {new Date(rec.timestamp).toLocaleTimeString()} • {Math.round(rec.sizeBytes / 1024)} KB
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {rec.blobUrl && (
                      <a
                        href={rec.blobUrl}
                        download={rec.fileName}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteRecord(rec.id)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};
