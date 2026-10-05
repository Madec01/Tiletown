// Musiques CC0 locales. Aucune lecture avant un geste ; suspension hors écran.
import { assetUrl } from "./version.js";
export const TRACKS = [
  { file: "chill-out.mp3", title: "Chill Out Theme", author: "Komiku" },
  { file: "apple-cider.mp3", title: "Apple Cider", author: "Zane Little" },
  {
    file: "exploring-town.mp3",
    title: "Exploring Town",
    author: "Spring Spring",
  },
];
export function createAudio() {
  let settings = { music: true, effects: true, volume: 0.35 };
  try {
    settings = {
      ...settings,
      ...JSON.parse(localStorage.getItem("tiletown.audio") || "{}"),
    };
  } catch {
    /* stockage facultatif */
  }
  settings.volume = Math.max(0, Math.min(1, Number(settings.volume) || 0));
  const music = new Audio();
  music.preload = "none";
  music.volume = settings.volume;
  let active = false,
    track = 0,
    context = null,
    failed = false;
  const save = () => {
    try {
      localStorage.setItem("tiletown.audio", JSON.stringify(settings));
    } catch {
      /* facultatif */
    }
  };
  async function play() {
    if (!active || !settings.music || document.hidden) return;
    if (!music.getAttribute("src"))
      music.src = assetUrl(`assets/audio/${TRACKS[track].file}`);
    try {
      await music.play();
      failed = false;
    } catch {
      failed = true;
    }
  }
  music.addEventListener("ended", () => {
    track = (track + 1) % TRACKS.length;
    music.src = assetUrl(`assets/audio/${TRACKS[track].file}`);
    play();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      music.pause();
      context?.suspend();
    } else if (active) {
      play();
      context?.resume().catch(() => {});
    }
  });
  function unlock() {
    active = true;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
    } catch {
      /* audio non disponible */
    }
    play();
  }
  function effect(kind = "tap") {
    if (!active || !settings.effects || !context || document.hidden) return;
    const t = context.currentTime;
    const notes =
      kind === "reward"
        ? [523.25, 659.25, 783.99, 1046.5]
        : kind === "build"
          ? [261.63, 392, 523.25]
          : [660];
    notes.forEach((frequency, i) => {
      const osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      const at = t + i * 0.065;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.075, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(at);
      osc.stop(at + 0.25);
    });
  }
  return {
    unlock,
    effect,
    get settings() {
      return { ...settings };
    },
    get track() {
      return TRACKS[track];
    },
    get playing() {
      return !music.paused;
    },
    get failed() {
      return failed;
    },
    set(key, value) {
      if (!(key in settings)) return;
      settings[key] =
        key === "volume"
          ? Math.max(0, Math.min(1, Number(value) || 0))
          : !!value;
      music.volume = settings.volume;
      save();
      if (settings.music) play();
      else music.pause();
    },
    next() {
      track = (track + 1) % TRACKS.length;
      music.src = assetUrl(`assets/audio/${TRACKS[track].file}`);
      play();
    },
  };
}
