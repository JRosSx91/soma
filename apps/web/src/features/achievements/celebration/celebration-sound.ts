export const CELEBRATE_SOUND_STORAGE_KEY = "soma.achievements.celebrate.sound";

export interface MemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStorage(): MemoryStorage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function isCelebrateSoundEnabled(
  storage: MemoryStorage | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(CELEBRATE_SOUND_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCelebrateSoundEnabled(
  enabled: boolean,
  storage: MemoryStorage | null = browserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(CELEBRATE_SOUND_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Private mode or blocked storage: preference stays in-memory only.
  }
}

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  const global = globalThis as typeof globalThis & {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return global.AudioContext ?? global.webkitAudioContext ?? null;
}

/** Short chime. Never throws to the caller; visual celebration continues. */
export function playCelebrateChime(options: { platinum?: boolean } = {}): boolean {
  if (!isCelebrateSoundEnabled()) return false;
  try {
    const Ctor = audioContextCtor();
    if (!Ctor) return false;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    const notes = options.platinum
      ? [523.25, 659.25, 783.99]
      : [392.0, 523.25];
    for (const [index, freq] of notes.entries()) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02 + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + index * 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.05);
      osc.stop(now + 0.32 + index * 0.08);
    }
    return true;
  } catch {
    return false;
  }
}
