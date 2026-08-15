import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadCompanyFixture } from "@/lib/profile/load-fixture";
import { emptyCompanyProfile } from "@/lib/profile/empty";
import { applyMustHaveDraft } from "@/lib/profile/must-haves";
import { profileCacheKey } from "@/lib/session-map";
import {
  loadStoredProfile,
  PROFILE_COMMITTED_EVENT,
  PROFILE_STORAGE_KEY,
  saveProfile,
} from "@/lib/session-profile";
import {
  YOU_CHANGED_EVENT,
  YOU_STORAGE_KEY,
  EMPTY_YOU_PERSONA,
  FIXTURE_PERSONAS,
  personaToParams,
  type YouPersona,
} from "@/lib/catalog/you-persona";
import {
  appliedProfileNeedsLiveRank,
  beginYouBarDraft,
  isMapPath,
  neededMustHaves,
  persistBarApply,
  prepareBarApply,
  withPreservedRailFixture,
  youBarStrip,
} from "./you-bar-apply";

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
  const local = new MemoryStorage();
  const target = new EventTarget();
  Object.defineProperty(globalThis, "sessionStorage", {
    value: session,
    configurable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: local,
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: {
      sessionStorage: session,
      localStorage: local,
      dispatchEvent: (event: Event) => target.dispatchEvent(event),
      addEventListener: (...args: Parameters<EventTarget["addEventListener"]>) =>
        target.addEventListener(...args),
      removeEventListener: (...args: Parameters<EventTarget["removeEventListener"]>) =>
        target.removeEventListener(...args),
    },
    configurable: true,
  });
  return { session, local, target };
}

const healthcare = FIXTURE_PERSONAS["fixture-1"];

describe("isMapPath", () => {
  it("is only the Opportunity Map, not leftover or alerts", () => {
    expect(isMapPath("/map")).toBe(true);
    expect(isMapPath("/map/")).toBe(true);
    expect(isMapPath("/map/alerts")).toBe(false);
    expect(isMapPath("/playbook")).toBe(false);
    expect(isMapPath("/resources")).toBe(false);
  });
});

describe("youBarStrip", () => {
  it("is intake-cta on /map with no company and no fixture", () => {
    expect(
      youBarStrip({
        pathname: "/map",
        persona: healthcare,
        personaFilled: true,
        profile: null,
      }),
    ).toEqual({ kind: "intake-cta", persona: healthcare });
    expect(
      youBarStrip({
        pathname: "/map",
        persona: EMPTY_YOU_PERSONA,
        personaFilled: false,
        profile: null,
      }),
    ).toEqual({ kind: "intake-cta", persona: null });
  });

  it("is invite or summary on leftover pages, even when a session company exists", () => {
    const profile = loadCompanyFixture("fixture-1");
    expect(
      youBarStrip({
        pathname: "/playbook",
        persona: EMPTY_YOU_PERSONA,
        personaFilled: false,
        profile,
      }),
    ).toEqual({ kind: "invite" });
    expect(
      youBarStrip({
        pathname: "/resources",
        persona: healthcare,
        personaFilled: true,
        profile,
      }),
    ).toEqual({ kind: "summary", persona: healthcare });
  });

  it("is not intake-cta on /map when a company or fixture is present", () => {
    expect(
      youBarStrip({
        pathname: "/map",
        persona: healthcare,
        personaFilled: true,
        profile: loadCompanyFixture("fixture-1"),
      }).kind,
    ).toBe("summary");
    expect(
      youBarStrip({
        pathname: "/map",
        persona: healthcare,
        personaFilled: true,
        profile: null,
        fixtureId: "fixture-1",
      }).kind,
    ).toBe("summary");
  });
});

describe("beginYouBarDraft", () => {
  it("is dual only on /map when a company exists", () => {
    const profile = loadCompanyFixture("fixture-1");
    expect(
      beginYouBarDraft({
        pathname: "/map",
        persona: healthcare,
        profile,
      }),
    ).toEqual({ mode: "dual", persona: healthcare, profile });
  });

  it("stays persona on leftover pages even when a session company exists", () => {
    const profile = loadCompanyFixture("fixture-1");
    expect(
      beginYouBarDraft({
        pathname: "/playbook",
        persona: healthcare,
        profile,
      }),
    ).toEqual({ mode: "persona", persona: healthcare });
  });

  it("stays persona on /map when no company is in session", () => {
    expect(
      beginYouBarDraft({
        pathname: "/map",
        persona: healthcare,
        profile: null,
      }),
    ).toEqual({ mode: "persona", persona: healthcare });
  });
});

describe("prepareBarApply", () => {
  it("marks a persona draft ready without touching a company", () => {
    const verdict = prepareBarApply({ mode: "persona", persona: healthcare });
    expect(verdict).toEqual({
      status: "ready",
      mode: "persona",
      persona: healthcare,
    });
  });

  it("blocks a dual draft on remaining missing must-haves", () => {
    const profile = {
      ...loadCompanyFixture("fixture-1"),
      whatTheyDo: { status: "missing" as const },
    };
    const verdict = prepareBarApply({
      mode: "dual",
      persona: healthcare,
      profile,
    });
    expect(verdict).toEqual({ status: "blocked", missing: ["whatTheyDo"] });
    expect(neededMustHaves({ mode: "dual", persona: healthcare, profile })).toEqual([
      "whatTheyDo",
    ]);
  });

  it("promotes filled missing and confirms inferred before gating", () => {
    let profile = loadCompanyFixture("fixture-1");
    profile = {
      ...profile,
      whatTheyDo: { status: "missing", value: "Edited nursing SaaS" },
      hqState: { status: "inferred", value: "UT", confidence: 0.6 },
    };
    const verdict = prepareBarApply({
      mode: "dual",
      persona: healthcare,
      profile,
    });
    expect(verdict.status).toBe("ready");
    if (verdict.status !== "ready" || verdict.mode !== "dual") {
      throw new Error("expected ready dual");
    }
    expect(verdict.profile.whatTheyDo).toEqual({
      status: "known",
      value: "Edited nursing SaaS",
    });
    expect(verdict.profile.hqState.status).toBe("known");
    expect(verdict.profile.hqState.value).toBe("UT");
    expect(neededMustHaves({ mode: "dual", persona: healthcare, profile })).toEqual([]);
  });

  it("does not copy persona sector or revenue onto the company", () => {
    const profile = loadCompanyFixture("fixture-1");
    const persona: YouPersona = {
      ...healthcare,
      sector: "FinTech",
      revenue: "$100M+",
    };
    const verdict = prepareBarApply({ mode: "dual", persona, profile });
    expect(verdict.status).toBe("ready");
    if (verdict.status !== "ready" || verdict.mode !== "dual") {
      throw new Error("expected ready dual");
    }
    expect(verdict.profile.sectors.value).toEqual(["healthcare", "ai", "saas"]);
    expect(verdict.profile.revenue.value).toEqual({
      basis: "arr",
      amountUsd: 1_000_000,
    });
    expect(verdict.persona.sector).toBe("FinTech");
  });
  it("blocks blank string and empty array must-have values even after promote", () => {
    const profile = {
      ...loadCompanyFixture("fixture-1"),
      whatTheyDo: { status: "missing" as const, value: "   " },
      technologies: { status: "missing" as const, value: [] as string[] },
    };
    const verdict = prepareBarApply({
      mode: "dual",
      persona: healthcare,
      profile,
    });
    expect(verdict.status).toBe("blocked");
    if (verdict.status !== "blocked") throw new Error("expected blocked");
    expect(verdict.missing).toEqual(expect.arrayContaining(["whatTheyDo", "technologies"]));
  });

  it("treats a finite zero dollar amount as filled", () => {
    const base = loadCompanyFixture("fixture-1");
    const profile = {
      ...base,
      capitalRaisedUsd: { status: "missing" as const, value: 0 },
    };
    const verdict = prepareBarApply({
      mode: "dual",
      persona: healthcare,
      profile,
    });
    expect(verdict.status).toBe("ready");
    if (verdict.status !== "ready" || verdict.mode !== "dual") {
      throw new Error("expected ready dual");
    }
    expect(verdict.profile.capitalRaisedUsd).toEqual({ status: "known", value: 0 });
  });
});

describe("withPreservedRailFixture", () => {
  it("keeps an active map fixture when persona params omit it", () => {
    const params = personaToParams({ ...healthcare, fixtureId: null });
    expect(params.get("fixture")).toBeNull();
    withPreservedRailFixture(params, "fixture-3");
    expect(params.get("fixture")).toBe("fixture-3");
  });

  it("does not overwrite a fixture already on the persona params", () => {
    const params = personaToParams(healthcare);
    expect(params.get("fixture")).toBe("fixture-1");
    withPreservedRailFixture(params, "fixture-3");
    expect(params.get("fixture")).toBe("fixture-1");
  });
});

describe("appliedProfileNeedsLiveRank", () => {
  it("uses profileCacheKey so status-only confirms keep the cache", () => {
    const previous = loadCompanyFixture("fixture-1");
    const confirmed = {
      ...previous,
      whatTheyDo: { ...previous.whatTheyDo, status: "known" as const },
    };
    expect(profileCacheKey(previous)).toBe(profileCacheKey(confirmed));
    expect(appliedProfileNeedsLiveRank(previous, confirmed)).toBe(false);

    const edited = applyMustHaveDraft(previous, "whatTheyDo", "Different company");
    expect(appliedProfileNeedsLiveRank(previous, edited)).toBe(true);
    expect(appliedProfileNeedsLiveRank(null, previous)).toBe(true);
  });
});

describe("persistBarApply", () => {
  let shims: ReturnType<typeof installBrowserShims>;

  beforeEach(() => {
    shims = installBrowserShims();
  });

  afterEach(() => {
    shims.session.clear();
    shims.local.clear();
  });

  it("writes persona only on leftover apply", () => {
    const events: string[] = [];
    shims.target.addEventListener(YOU_CHANGED_EVENT, () => events.push("you"));
    shims.target.addEventListener(PROFILE_COMMITTED_EVENT, () => events.push("commit"));
    const urls: YouPersona[] = [];

    persistBarApply(
      { status: "ready", mode: "persona", persona: healthcare },
      { replaceUrl: (persona) => urls.push(persona) },
    );

    expect(urls).toEqual([healthcare]);
    expect(JSON.parse(shims.local.getItem(YOU_STORAGE_KEY) ?? "null")).toEqual(healthcare);
    expect(events).toEqual(["you"]);
    expect(shims.session.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  });

  it("writes persona then commitProfile on dual apply", () => {
    const profile = loadCompanyFixture("fixture-1");
    const events: string[] = [];
    const committed: unknown[] = [];
    shims.target.addEventListener(YOU_CHANGED_EVENT, () => events.push("you"));
    shims.target.addEventListener(PROFILE_COMMITTED_EVENT, (event) => {
      events.push("commit");
      committed.push((event as CustomEvent<{ profile?: unknown }>).detail?.profile);
    });

    persistBarApply(
      { status: "ready", mode: "dual", persona: healthcare, profile },
      { replaceUrl: () => undefined },
    );

    expect(events).toEqual(["you", "commit"]);
    expect(loadStoredProfile()).toEqual(profile);
    expect(committed).toEqual([profile]);
  });
});

describe("empty company helper stays unused by persona apply", () => {
  it("does not synthesize a CompanyProfile from YouPersona", () => {
    const empty = emptyCompanyProfile();
    const verdict = prepareBarApply({ mode: "persona", persona: healthcare });
    expect(verdict).not.toHaveProperty("profile");
    expect(empty.whatTheyDo.status).toBe("missing");
  });
});
