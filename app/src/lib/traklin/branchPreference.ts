import type { PreferredBranchState } from './types';

const PREFERRED_BRANCH_STORAGE_KEY = 'traklin.preferred-branch.v1';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getPreferredBranchState(): PreferredBranchState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PREFERRED_BRANCH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PreferredBranchState>;
    if (typeof parsed.preferredBranchId !== 'number') {
      return null;
    }

    return {
      preferredBranchId: parsed.preferredBranchId,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now()
    };
  } catch {
    return null;
  }
}

export function getPreferredBranchId() {
  return getPreferredBranchState()?.preferredBranchId ?? null;
}

export function setPreferredBranchId(preferredBranchId: number) {
  if (!isBrowser()) {
    return;
  }

  const nextState: PreferredBranchState = {
    preferredBranchId,
    updatedAt: Date.now()
  };

  window.localStorage.setItem(PREFERRED_BRANCH_STORAGE_KEY, JSON.stringify(nextState));
}
