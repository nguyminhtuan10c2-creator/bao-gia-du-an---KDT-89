import { doc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export interface MediaAssetsState {
  logoUrl: string | null;
  heroImageUrl: string | null;
  evidenceImages: Record<number, string>;
}

const EVIDENCE_IDS = [1, 2, 3, 4, 5, 6] as const;

const STORAGE_KEYS = {
  logo: 'kdt_custom_logo',
  hero: 'kdt89_custom_hero_image',
  evidence: 'kdt_custom_evidence',
};

let memoryState: MediaAssetsState | null = null;

// Track per-slot evidence state from individual docs (primary) & legacy single doc (fallback)
const perSlotEvidence: Record<number, string | null> = {};
let legacyEvidenceMap: Record<number, string> = {};

function rebuildMergedEvidence(): Record<number, string> {
  const merged: Record<number, string> = {};
  EVIDENCE_IDS.forEach((id) => {
    if (id in perSlotEvidence) {
      const v = perSlotEvidence[id];
      if (v) merged[id] = v;
    } else if (legacyEvidenceMap[id]) {
      merged[id] = legacyEvidenceMap[id];
    }
  });
  // Also keep any unexpected numeric keys from legacy map
  Object.entries(legacyEvidenceMap).forEach(([k, v]) => {
    const num = Number(k);
    if (!(num in perSlotEvidence) && v) {
      merged[num] = v;
    }
  });
  return merged;
}

export function getLocalMediaAssets(): MediaAssetsState {
  if (typeof window === 'undefined') {
    return { logoUrl: null, heroImageUrl: null, evidenceImages: {} };
  }
  if (!memoryState) {
    let logoUrl: string | null = null;
    let heroImageUrl: string | null = null;
    let evidenceImages: Record<number, string> = {};

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

export async function verifyFirebaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await getDocFromServer(doc(db, 'site_settings', 'main'));
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Không thể kết nối Firebase',
    };
  }
}

export async function saveLogoToFirebase(logoUrl: string | null): Promise<void> {
  const path = 'site_settings/media_logo';
  try {
    await setDoc(doc(db, 'site_settings', 'media_logo'), {
      imageUrl: logoUrl || '',
      updatedAt: new Date().toISOString(),
    });
    setLocalLogo(logoUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveHeroImageToFirebase(heroImageUrl: string | null): Promise<void> {
  const path = 'site_settings/media_hero';
  try {
    await setDoc(doc(db, 'site_settings', 'media_hero'), {
      imageUrl: heroImageUrl || '',
      updatedAt: new Date().toISOString(),
    });
    setLocalHero(heroImageUrl);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves each evidence slot in its own dedicated Firestore document (`site_settings/media_evidence_<id>`)
 * so uploading 6 high-detail photos NEVER exceeds Firestore's 1MB single-document limit.
 */
export async function saveEvidenceImageToFirebase(
  itemId: number,
  imageUrl: string | null
): Promise<Record<number, string>> {
  const docId = `media_evidence_${itemId}`;
  const path = `site_settings/${docId}`;
  try {
    await setDoc(doc(db, 'site_settings', docId), {
      imageUrl: imageUrl || '',
      updatedAt: new Date().toISOString(),
    });

    perSlotEvidence[itemId] = imageUrl || null;
    if (!imageUrl) {
      delete legacyEvidenceMap[itemId];
    }
    const merged = rebuildMergedEvidence();
    setLocalEvidence(merged);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function resetAllEvidenceImagesInFirebase(): Promise<void> {
  try {
    await Promise.all([
      ...EVIDENCE_IDS.map((id) =>
        setDoc(doc(db, 'site_settings', `media_evidence_${id}`), {
          imageUrl: '',
          updatedAt: new Date().toISOString(),
        })
      ),
      setDoc(doc(db, 'site_settings', 'media_evidence'), {
        items: {},
        updatedAt: new Date().toISOString(),
      }),
    ]);

    EVIDENCE_IDS.forEach((id) => {
      perSlotEvidence[id] = null;
    });
    legacyEvidenceMap = {};
    setLocalEvidence({});
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'site_settings/media_evidence');
  }
}

export function subscribeToMediaAssets(onChange?: (state: MediaAssetsState) => void): () => void {
  onChange?.(getLocalMediaAssets());

  const emit = () => {
    onChange?.(getLocalMediaAssets());
  };

  const unsubLogo = onSnapshot(
    doc(db, 'site_settings', 'media_logo'),
    (snap) => {
      if (snap.exists()) {
        const imageUrl = (snap.data()?.imageUrl as string) || '';
        const val = imageUrl.trim() ? imageUrl : null;
        setLocalLogo(val);
        emit();
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
        setLocalHero(val);
        emit();
      }
    },
    (err) => {
      console.warn('media_hero snapshot fallback:', err.message);
    }
  );

  // Subscribe to legacy aggregate doc (for backward compatibility with older saved data)
  const unsubLegacyEvidence = onSnapshot(
    doc(db, 'site_settings', 'media_evidence'),
    (snap) => {
      if (snap.exists()) {
        const rawItems = (snap.data()?.items as Record<string, string>) || {};
        const nextLegacy: Record<number, string> = {};
        Object.entries(rawItems).forEach(([k, v]) => {
          if (v) nextLegacy[Number(k)] = v;
        });
        legacyEvidenceMap = nextLegacy;
        setLocalEvidence(rebuildMergedEvidence());
        emit();
      }
    },
    (err) => {
      console.warn('media_evidence legacy snapshot fallback:', err.message);
    }
  );

  // Subscribe to per-slot docs `media_evidence_1` .. `media_evidence_6`
  const slotUnsubs = EVIDENCE_IDS.map((id) =>
    onSnapshot(
      doc(db, 'site_settings', `media_evidence_${id}`),
      (snap) => {
        if (snap.exists()) {
          const imageUrl = (snap.data()?.imageUrl as string) || '';
          perSlotEvidence[id] = imageUrl.trim() ? imageUrl : null;
          setLocalEvidence(rebuildMergedEvidence());
          emit();
        }
      },
      (err) => {
        console.warn(`media_evidence_${id} snapshot fallback:`, err.message);
      }
    )
  );

  return () => {
    unsubLogo();
    unsubHero();
    unsubLegacyEvidence();
    slotUnsubs.forEach((unsub) => unsub());
  };
}
