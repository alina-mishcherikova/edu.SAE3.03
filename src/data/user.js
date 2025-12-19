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
    this.proofs = {};

    if (payload.progress && typeof payload.progress === "object") {
      this.progress = payload.progress;
    }

    if (payload.history && payload.history instanceof Array) {
      this.history = payload.history;
    }

    if (payload.acProgress && typeof payload.acProgress === "object") {
      this.acProgress = payload.acProgress;
    }

    if (payload.proofs && typeof payload.proofs === "object") {
      this.proofs = payload.proofs;
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

  setAcProof(competenceId, niveauId, acCode, proofObj) {
    if (!competenceId || niveauId === null || niveauId === undefined || !acCode)
      return;

    // Ініціалізуємо сховище, якщо ще не існує
    if (!this.proofs) this.proofs = {};

    const cKey = String(competenceId);
    const nKey = String(niveauId);
    const aKey = String(acCode);

    if (!this.proofs[cKey]) this.proofs[cKey] = {};
    if (!this.proofs[cKey][nKey]) this.proofs[cKey][nKey] = {};

    // Зберігаємо proof
    this.proofs[cKey][nKey][aKey] = {
      name: proofObj?.name || "preuve.pdf",
      type: proofObj?.type || "application/pdf",
      size: proofObj?.size || 0,
      dataUrl: proofObj?.dataUrl || null,
      date: proofObj?.date || new Date().toISOString(),
    };
  }

  getAcProof(competenceId, niveauId, acCode) {
    if (!competenceId || niveauId === null || niveauId === undefined || !acCode)
      return null;

    const proofs = this.proofs || {};
    const comp = proofs[String(competenceId)];
    if (!comp) return null;

    const level = comp[String(niveauId)];
    if (!level) return null;

    return level[String(acCode)] || null;
  }

  removeAcProof(competenceId, niveauId, acCode) {
    if (!competenceId || niveauId === null || niveauId === undefined || !acCode)
      return;

    const cKey = String(competenceId);
    const nKey = String(niveauId);
    const aKey = String(acCode);

    if (!this.proofs?.[cKey]?.[nKey]) return;

    delete this.proofs[cKey][nKey][aKey];

    // (опційно) підчищаємо порожні обʼєкти
    if (Object.keys(this.proofs[cKey][nKey]).length === 0)
      delete this.proofs[cKey][nKey];
    if (Object.keys(this.proofs[cKey]).length === 0) delete this.proofs[cKey];
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
      proofs: this.proofs,
    };
  }

  importPayload(parsed) {
    if (!parsed || typeof parsed !== "object") {
      return false;
    }

    // Імпортуємо progress
    if (parsed.progress && typeof parsed.progress === "object") {
      this.progress = parsed.progress;
    } else {
      this.progress = {};
    }

    // Імпортуємо history
    if (parsed.history && Array.isArray(parsed.history)) {
      this.history = parsed.history;
    } else {
      this.history = [];
    }

    // Імпортуємо acProgress
    if (parsed.acProgress && typeof parsed.acProgress === "object") {
      this.acProgress = parsed.acProgress;
    } else {
      this.acProgress = {};
    }

    // Імпортуємо proofs
    if (parsed.proofs && typeof parsed.proofs === "object") {
      this.proofs = parsed.proofs;
    } else {
      this.proofs = {};
    }

    this.save();
    return true;
  }
}

export { User };
