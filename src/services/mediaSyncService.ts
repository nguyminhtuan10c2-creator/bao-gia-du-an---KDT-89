import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export interface MediaAssetsState {
  logoUrl: string | null;
  heroImageUrl: string | null;
  evidenceImages: Record<number, string>;
}

const STORAGE_KEYS = {
  logo: 'kdt_custom_logo',
  hero: 'kdt89_custom_hero_image',
  evidence: 'kdt_custom_evidence',
};

let memoryState: MediaAssetsState | null = null;

export function getLocalMediaAssets(): MediaAssetsState {
  if (typeof window === 'undefined') {
    return { logoUrl: null, heroImageUrl: null, evidenceImages: {} };
  }
  let logoUrl: string | null = memoryState?.logoUrl ?? null;
  let heroImageUrl: string | null = memoryState?.heroImageUrl ?? null;
  let evidenceImages: Record<number, string> = memoryState?.evidenceImages
    ? { ...memoryState.evidenceImages }
    : {};

  if (!memoryState) {
    try {
      logoUrl = localStorage.getItem(STORAGE_KEYS.logo) || null;
    } catch {
      logoUrl = null;
    }
    try {
      heroImageUrl = localStorage.getItem(STORAGE_KEYS.hero) || null;
    } catch {
      heroImageUrl = null;
    }
    try {
      const rawEv = localStorage.getItem(STORAGE_KEYS.evidence);
      evidenceImages = rawEv ? JSON.parse(rawEv) : {};
    } catch {
      evidenceImages = {};
    }
    memoryState = { logoUrl, heroImageUrl, evidenceImages };
  }

  return {
    logoUrl: memoryState.logoUrl,
    heroImageUrl: memoryState.heroImageUrl,
    evidenceImages: { ...memoryState.evidenceImages },
  };
}

function ensureMemoryState(): MediaAssetsState {
  if (!memoryState) {
    memoryState = getLocalMediaAssets();
  }
  return memoryState;
}

function setLocalLogo(url: string | null) {
  const current = ensureMemoryState();
  memoryState = { ...current, logoUrl: url };
  try {
    if (url) localStorage.setItem(STORAGE_KEYS.logo, url);
    else localStorage.removeItem(STORAGE_KEYS.logo);
  } catch {
    // ignore localStorage quota errors since Firebase + memoryState are primary
  }
  window.dispatchEvent(new Event('kdt_logo_updated'));
}

function setLocalHero(url: string | null) {
  const current = ensureMemoryState();
  memoryState = { ...current, heroImageUrl: url };
  try {
    if (url) localStorage.setItem(STORAGE_KEYS.hero, url);
    else localStorage.removeItem(STORAGE_KEYS.hero);
  } catch {
    // ignore localStorage quota errors
  }
  window.dispatchEvent(new Event('kdt_hero_updated'));
}

function setLocalEvidence(items: Record<number, string>) {
  const current = ensureMemoryState();
  memoryState = { ...current, evidenceImages: { ...items } };
  try {
    if (Object.keys(items).length > 0) {
      localStorage.setItem(STORAGE_KEYS.evidence, JSON.stringify(items));
    } else {
      localStorage.removeItem(STORAGE_KEYS.evidence);
    }
  } catch {
    // ignore localStorage quota errors
  }
  window.dispatchEvent(new Event('kdt_evidence_updated'));
}

export async function saveLogoToFirebase(logoUrl: string | null): Promise<void> {
  setLocalLogo(logoUrl);
  const path = 'site_settings/media_logo';
  try {
    await setDoc(doc(db, 'site_settings', 'media_logo'), {
      imageUrl: logoUrl || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveHeroImageToFirebase(heroImageUrl: string | null): Promise<void> {
  setLocalHero(heroImageUrl);
  const path = 'site_settings/media_hero';
  try {
    await setDoc(doc(db, 'site_settings', 'media_hero'), {
      imageUrl: heroImageUrl || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveEvidenceImageToFirebase(
  itemId: number,
  imageUrl: string | null
): Promise<Record<number, string>> {
  const current = getLocalMediaAssets().evidenceImages;
  const next: Record<string, string> = {};
  Object.entries(current).forEach(([k, v]) => {
    if (v) next[String(k)] = v;
  });

  if (imageUrl) {
    next[String(itemId)] = imageUrl;
  } else {
    delete next[String(itemId)];
  }

  const numericMap: Record<number, string> = {};
  Object.entries(next).forEach(([k, v]) => {
    numericMap[Number(k)] = v;
  });

  setLocalEvidence(numericMap);

  const path = 'site_settings/media_evidence';
  try {
    await setDoc(doc(db, 'site_settings', 'media_evidence'), {
      items: next,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }

  return numericMap;
}

export async function resetAllEvidenceImagesInFirebase(): Promise<void> {
  setLocalEvidence({});
  const path = 'site_settings/media_evidence';
  try {
    await setDoc(doc(db, 'site_settings', 'media_evidence'), {
      items: {},
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToMediaAssets(onChange?: (state: MediaAssetsState) => void): () => void {
  let state = getLocalMediaAssets();
  onChange?.(state);

  const unsubLogo = onSnapshot(
    doc(db, 'site_settings', 'media_logo'),
    (snap) => {
      if (snap.exists()) {
        const imageUrl = (snap.data()?.imageUrl as string) || '';
        const val = imageUrl.trim() ? imageUrl : null;
        state = { ...state, logoUrl: val };
        setLocalLogo(val);
        onChange?.(state);
      }
    },
    (err) => {
      console.warn('media_logo snapshot fallback:', err.message);
    }
  );

  const unsubHero = onSnapshot(
    doc(db, 'site_settings', 'media_hero'),
    (snap) => {
      if (snap.exists()) {
        const imageUrl = (snap.data()?.imageUrl as string) || '';
        const val = imageUrl.trim() ? imageUrl : null;
        state = { ...state, heroImageUrl: val };
        setLocalHero(val);
        onChange?.(state);
      }
    },
    (err) => {
      console.warn('media_hero snapshot fallback:', err.message);
    }
  );

  const unsubEvidence = onSnapshot(
    doc(db, 'site_settings', 'media_evidence'),
    (snap) => {
      if (snap.exists()) {
        const rawItems = (snap.data()?.items as Record<string, string>) || {};
        const numericMap: Record<number, string> = {};
        Object.entries(rawItems).forEach(([k, v]) => {
          if (v) numericMap[Number(k)] = v;
        });
        state = { ...state, evidenceImages: numericMap };
        setLocalEvidence(numericMap);
        onChange?.(state);
      }
    },
    (err) => {
      console.warn('media_evidence snapshot fallback:', err.message);
    }
  );

  return () => {
    unsubLogo();
    unsubHero();
    unsubEvidence();
  };
}
