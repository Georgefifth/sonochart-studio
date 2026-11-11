import {
  AcousticPointTelemetry,
  ChartDataset,
  InstrumentTimbre,
  MusicalScale,
} from '../types';
import { computeSeriesStats } from './statistics';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_INTERVALS: Record<MusicalScale, number[]> = {
  pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36], // C3 to C6 pentatonic
  major: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 29, 31, 33, 35, 36],
  chromatic: Array.from({ length: 37 }, (_, i) => i), // 3 octaves (36 semitones)
};

export function midiToFreq(midi: number): number {
  return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 10) / 10;
}

export function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

export function valueToScaleNote(
  value: number,
  minVal: number,
  maxVal: number,
  scale: MusicalScale,
  baseMidi = 48 // C3 = 48
): { midiNote: number; frequencyHz: number; noteName: string } {
  const intervals = SCALE_INTERVALS[scale];
  const range = maxVal - minVal;
  const normalized = range <= 0 ? 0.5 : Math.max(0, Math.min(1, (value - minVal) / range));
  const idx = Math.round(normalized * (intervals.length - 1));
  const midiNote = baseMidi + intervals[idx];
  return {
    midiNote,
    frequencyHz: midiToFreq(midiNote),
    noteName: midiToNoteName(midiNote),
  };
}

export function computePointTelemetry(
  dataset: ChartDataset,
  pointIndex: number,
  seriesIndex: number,
  scale: MusicalScale
): AcousticPointTelemetry {
  const totalPoints = dataset.labels.length;
  const safePointIdx = Math.max(0, Math.min(totalPoints - 1, pointIndex));
  const safeSeriesIdx = Math.max(0, Math.min(dataset.series.length - 1, seriesIndex));
  const series = dataset.series[safeSeriesIdx];

  if (!series || totalPoints === 0) {
    return {
      pointIndex: 0,
      totalPoints: 0,
      label: '',
      seriesName: '',
      value: 0,
      unit: '',
      frequencyHz: 440,
      noteName: 'A4',
      midiNote: 69,
      stereoPan: 0,
      panLabel: '0.00 C',
      timbre: 'triangle',
      earconType: 'none',
      screenReaderAnnouncement: 'No data loaded.',
    };
  }

  const stats = computeSeriesStats(series, dataset.labels);
  const val = series.values[safePointIdx];
  const label = dataset.labels[safePointIdx];

  const { midiNote, frequencyHz, noteName } = valueToScaleNote(
    val,
    stats.min,
    stats.max,
    scale,
    safeSeriesIdx === 0 ? 48 : 55 // Offset second series by a fifth (G3) for harmonic separation
  );

  const stereoPan =
    totalPoints <= 1
      ? 0
      : Math.round((-0.85 + (safePointIdx / (totalPoints - 1)) * 1.7) * 100) / 100;

  const panLabel =
    stereoPan < -0.05
      ? `${stereoPan.toFixed(2)} L`
      : stereoPan > 0.05
      ? `+${stereoPan.toFixed(2)} R`
      : '0.00 C';

  let earconType: 'none' | 'peak' | 'trough' | 'outlier' = 'none';
  if (safePointIdx === stats.maxIndex) {
    earconType = 'peak';
  } else if (safePointIdx === stats.minIndex) {
    earconType = 'trough';
  } else if (stats.stdDev > 0 && Math.abs((val - stats.mean) / stats.stdDev) >= 1.65) {
    earconType = 'outlier';
  }

  // Contextual screen-reader announcement (Fixes Highcharts Sonification Studio Issue #28)
  const prevVal = safePointIdx > 0 ? series.values[safePointIdx - 1] : null;
  let deltaText = '';
  if (prevVal !== null && prevVal !== 0) {
    const pct = Math.round(((val - prevVal) / Math.abs(prevVal)) * 1000) / 10;
    deltaText = `, ${pct >= 0 ? `+${pct}%` : `${pct}%`} from previous`;
  }

  const earconTag =
    earconType === 'peak'
      ? ' [Series Maximum Peak]'
      : earconType === 'trough'
      ? ' [Series Minimum Trough]'
      : earconType === 'outlier'
      ? ' [Statistical Outlier]'
      : '';

  const otherSeriesSummary = dataset.series
    .filter((_, idx) => idx !== safeSeriesIdx)
    .map((s) => `${s.name}: ${s.values[safePointIdx]}${s.unit ? ` ${s.unit}` : ''}`)
    .join('; ');

  const unitStr = series.unit ? ` ${series.unit}` : '';
  const screenReaderAnnouncement = `Point ${safePointIdx + 1} of ${totalPoints} — ${dataset.xAxisLabel} ${label}: ${series.name} is ${val}${unitStr}${deltaText}${earconTag}.${otherSeriesSummary ? ` Also at ${label}: ${otherSeriesSummary}.` : ''} Acoustic pitch ${noteName} (${frequencyHz} Hz, pan ${panLabel}).`;

  return {
    pointIndex: safePointIdx,
    totalPoints,
    label,
    seriesName: series.name,
    value: val,
    unit: series.unit,
    frequencyHz,
    noteName,
    midiNote,
    stereoPan,
    panLabel,
    timbre: series.timbre,
    earconType,
    screenReaderAnnouncement,
  };
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playAcousticPoint(
  telemetry: AcousticPointTelemetry,
  durationSec = 0.24,
  playCompanionSeries?: { freqHz: number; timbre: InstrumentTimbre }[]
): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;

  const now = ctx.currentTime;
  triggerSynthVoice(
    ctx,
    telemetry.frequencyHz,
    telemetry.stereoPan,
    telemetry.timbre,
    now,
    durationSec,
    0.26
  );

  // Earcon harmonic chime for peak/trough
  if (telemetry.earconType === 'peak') {
    triggerSynthVoice(
      ctx,
      telemetry.frequencyHz * 1.5, // Perfect fifth chime above
      telemetry.stereoPan,
      'sine',
      now + 0.06,
      0.16,
      0.12
    );
  } else if (telemetry.earconType === 'trough') {
    triggerSynthVoice(
      ctx,
      telemetry.frequencyHz * 0.75, // Sub-fourth indicator
      telemetry.stereoPan,
      'sine',
      now + 0.06,
      0.16,
      0.12
    );
  }

  if (playCompanionSeries && playCompanionSeries.length > 0) {
    playCompanionSeries.forEach((comp, idx) => {
      triggerSynthVoice(
        ctx,
        comp.freqHz,
        telemetry.stereoPan,
        comp.timbre,
        now + 0.03 * (idx + 1),
        durationSec * 0.85,
        0.14
      );
    });
  }

  return true;
}

function triggerSynthVoice(
  ctx: BaseAudioContext,
  freqHz: number,
  pan: number,
  timbre: InstrumentTimbre,
  startTime: number,
  duration: number,
  peakGain: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (timbre === 'marimba') {
    osc.type = 'sine';
    // Add a brief harmonic overtone for wooden marimba attack
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freqHz * 4, startTime);
    overtoneGain.gain.setValueAtTime(0.001, startTime);
    overtoneGain.gain.linearRampToValueAtTime(peakGain * 0.35, startTime + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(0.07, duration * 0.5));
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    overtone.start(startTime);
    overtone.stop(startTime + duration);
  } else if (timbre === 'sawtooth-warm') {
    osc.type = 'sawtooth';
  } else {
    osc.type = timbre;
  }

  osc.frequency.setValueAtTime(freqHz, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);

  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), startTime);
    gain.connect(panner);
    panner.connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * Deterministically synthesizes a 44.1 kHz 16-bit Stereo PCM .WAV file in memory
 * representing the full multi-series dataset sonification (with stereo panning,
 * harmonic overtones, and peak/trough earcon chimes).
 */
export function synthesizeDatasetWavBytes(
  dataset: ChartDataset,
  scale: MusicalScale,
  stepDurationSec = 0.28
): Uint8Array {
  const sampleRate = 44100;
  const numPoints = dataset.labels.length;
  const totalSeconds = Math.max(0.5, numPoints * stepDurationSec + 0.25);
  const totalFrames = Math.floor(sampleRate * totalSeconds);

  const leftChannel = new Float32Array(totalFrames);
  const rightChannel = new Float32Array(totalFrames);

  const statsPerSeries = dataset.series.map((s) => computeSeriesStats(s, dataset.labels));

  for (let p = 0; p < numPoints; p++) {
    const startSec = p * stepDurationSec + 0.04;
    const startFrame = Math.floor(startSec * sampleRate);
    const noteFrames = Math.floor(stepDurationSec * 0.88 * sampleRate);

    const pan = numPoints <= 1 ? 0 : -0.85 + (p / (numPoints - 1)) * 1.7;
    // Constant-power stereo panning
    const panAngle = ((pan + 1) / 2) * (Math.PI / 2);
    const gainL = Math.cos(panAngle);
    const gainR = Math.sin(panAngle);

    dataset.series.forEach((s, sIdx) => {
      const st = statsPerSeries[sIdx];
      const val = s.values[p];
      const { frequencyHz } = valueToScaleNote(
        val,
        st.min,
        st.max,
        scale,
        sIdx === 0 ? 48 : 55
      );

      const isPeak = p === st.maxIndex;
      const amp = sIdx === 0 ? 0.32 : 0.20;

      for (let f = 0; f < noteFrames && startFrame + f < totalFrames; f++) {
        const t = f / sampleRate;
        // ADSR envelope
        const attack = Math.min(1, t / 0.015);
        const decay = Math.exp(-3.8 * (t / (stepDurationSec * 0.88)));
        const env = attack * decay;

        // Waveform with warm harmonics
        let sample = Math.sin(2 * Math.PI * frequencyHz * t);
        if (s.timbre === 'triangle') {
          sample += 0.25 * Math.sin(2 * Math.PI * frequencyHz * 3 * t);
        } else if (s.timbre === 'marimba') {
          sample += 0.35 * Math.exp(-18 * t) * Math.sin(2 * Math.PI * frequencyHz * 4 * t);
        }

        // Peak earcon fifth chime
        if (isPeak && t > 0.05) {
          sample += 0.28 * Math.sin(2 * Math.PI * (frequencyHz * 1.5) * (t - 0.05));
        }

        const out = sample * env * amp;
        leftChannel[startFrame + f] += out * gainL;
        rightChannel[startFrame + f] += out * gainR;
      }
    });
  }

  // Encode 44-byte RIFF/WAVE header + 16-bit interleaved stereo PCM
  const numChannels = 2;
  const bytesPerSample = 2;
  const dataByteLength = totalFrames * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true); // 16 bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < totalFrames; i++) {
    const clampedL = Math.max(-1, Math.min(1, leftChannel[i]));
    const clampedR = Math.max(-1, Math.min(1, rightChannel[i]));
    view.setInt16(offset, Math.round(clampedL * 32767), true);
    view.setInt16(offset + 2, Math.round(clampedR * 32767), true);
    offset += 4;
  }

  return new Uint8Array(buffer);
}
