import { saveUserPayload, loadUserPayload } from "@/lib/storage.js";

class User {
  constructor() {
    this.progress = {};
    this.history = [];
    this.acProgress = {};
  }

  load() {
    const payload = loadUserPayload();

    this.progress = {};
    this.history = [];
    this.acProgress = {};

    if (payload.progress && typeof payload.progress === "object") {
      this.progress = payload.progress;
    }

    if (payload.history && payload.history instanceof Array) {
      this.history = payload.history;
    }

    if (payload.acProgress && typeof payload.acProgress === "object") {
      this.acProgress = payload.acProgress;
    }
  }

  save() {
    saveUserPayload(this.exportPayload());
  }

  setProgress(compId, niveauId, value) {
    if (this.progress[compId] === undefined) {
      this.progress[compId] = {};
    }
    this.progress[compId][niveauId] = value;
  }

  getProgress(compId, niveauId) {
    if (this.progress[compId] === undefined) return 0;

    const v = this.progress[compId][niveauId];
    if (v === undefined || v === null) return 0;

    return v;
  }
  setAcProgress(compId, niveauId, acCode, value) {
    if (!this.acProgress[compId]) this.acProgress[compId] = {};
    if (!this.acProgress[compId][niveauId])
      this.acProgress[compId][niveauId] = {};
    this.acProgress[compId][niveauId][acCode] = value;
  }

  getAcProgress(compId, niveauId, acCode) {
    if (!this.acProgress[compId]) return 0;
    if (!this.acProgress[compId][niveauId]) return 0;

    const v = this.acProgress[compId][niveauId][acCode];
    if (v === undefined || v === null) return 0;

    return v;
  }
  addHistory(competenceId, niveauId, acCode, value) {
    this.history.push({
      date: new Date().toISOString(),
      competenceId: competenceId,
      niveauId: niveauId,
      acCode: acCode,
      value: value,
    });
  }

  reset() {
    this.progress = {};
    this.history = [];
    this.acProgress = {};
    this.save();
  }

  exportPayload() {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      progress: this.progress,
      history: this.history,
      acProgress: this.acProgress,
    };
  }

  importPayload(parsed) {
    this.progress = parsed.progress;
    this.save();
    return true;
  }
}

export { User };
