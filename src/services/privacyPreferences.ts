export const PRIVACY_KEY = 'topheights:privacy-v1';
export type PrivacyChoice = { version: 1; analytics: boolean; savedAt: number };
type StorageReader = Pick<Storage, 'getItem'>;

export function readPrivacyChoice(storage: StorageReader, now = Date.now()): PrivacyChoice | null {
  try {
    const choice = JSON.parse(storage.getItem(PRIVACY_KEY) || 'null');
    if (choice?.version !== 1 || typeof choice.analytics !== 'boolean' || typeof choice.savedAt !== 'number'
      || choice.savedAt > now || now - choice.savedAt > 180 * 24 * 60 * 60 * 1000) return null;
    return choice;
  } catch { return null; }
}

export function createAnalyticsController(load: () => Promise<{ enable(): void; disable(): void }>) {
  let allowed = false;
  let controls: Awaited<ReturnType<typeof load>> | undefined;
  let pending: ReturnType<typeof load> | undefined;
  return async (next: boolean) => {
    allowed = next;
    if (!next) { controls?.disable(); return; }
    try {
      controls = await (pending ||= load());
      if (allowed) controls.enable(); else controls.disable();
    } catch { pending = undefined; }
  };
}
