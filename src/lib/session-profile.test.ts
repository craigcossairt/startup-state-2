import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import {
  commitProfile,
  loadStoredProfile,
  PROFILE_COMMITTED_EVENT,
  PROFILE_STORAGE_KEY,
  saveProfile,
} from "./session-profile";

class MemoryStorage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

function installBrowserShims() {
  const session = new MemoryStorage();
  const target = new EventTarget();
  Object.defineProperty(globalThis, "sessionStorage", {
    value: session,
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: {
      sessionStorage: session,
      dispatchEvent: (event: Event) => target.dispatchEvent(event),
      addEventListener: (...args: Parameters<EventTarget["addEventListener"]>) =>
        target.addEventListener(...args),
      removeEventListener: (...args: Parameters<EventTarget["removeEventListener"]>) =>
        target.removeEventListener(...args),
    },
    configurable: true,
  });
  return { session, target };
}

describe("saveProfile vs commitProfile", () => {
  let shims: ReturnType<typeof installBrowserShims>;

  beforeEach(() => {
    shims = installBrowserShims();
  });

  afterEach(() => {
    shims.session.clear();
  });

  it("saveProfile writes the cache and does not announce a commit", () => {
    const profile = loadCompanyFixture("fixture-1");
    let commits = 0;
    shims.target.addEventListener(PROFILE_COMMITTED_EVENT, () => {
      commits += 1;
    });

    saveProfile(profile);

    expect(JSON.parse(shims.session.getItem(PROFILE_STORAGE_KEY) ?? "null")).toEqual(profile);
    expect(loadStoredProfile()).toEqual(profile);
    expect(commits).toBe(0);
  });

  it("commitProfile writes then fires PROFILE_COMMITTED_EVENT", () => {
    const profile = loadCompanyFixture("fixture-2");
    const seen: CompanyLike[] = [];
    shims.target.addEventListener(PROFILE_COMMITTED_EVENT, () => {
      seen.push(loadStoredProfile() as CompanyLike);
    });

    commitProfile(profile);

    expect(loadStoredProfile()).toEqual(profile);
    expect(seen).toEqual([profile]);
  });
});

type CompanyLike = ReturnType<typeof loadCompanyFixture>;
