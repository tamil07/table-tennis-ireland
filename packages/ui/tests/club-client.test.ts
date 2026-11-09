import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { demoClub } from "@tti/domain";

const mocks = vi.hoisted(() => ({ invoke: vi.fn(), createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
beforeEach(() => {
  vi.resetModules();
  mocks.invoke.mockReset();
  mocks.createClient
    .mockReset()
    .mockReturnValue({ functions: { invoke: mocks.invoke } });
  vi.stubEnv("VITE_ENABLE_LIVE", "true");
  vi.stubEnv("VITE_ENABLE_PHONE_LOGIN", "false");
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_publishable_TEST_ONLY");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("live website/app adapter contract", () => {
  it("requires explicit activation and does not create an Auth client for the synthetic preview", async () => {
    vi.stubEnv("VITE_ENABLE_LIVE", "false");
    const client = await import("../src/club-client");
    expect(client.liveMode).toBe(false);
    expect(client.authClient).toBeNull();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("reports missing live configuration instead of returning synthetic records", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    const client = await import("../src/club-client");
    await expect(client.readClub("club-a", "player-a")).rejects.toThrow(
      "missing",
    );
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("uses revision polling and replaces a stale snapshot when a new revision arrives", async () => {
    const { readClub } = await import("../src/club-client");
    const state = demoClub();
    mocks.invoke.mockResolvedValueOnce({ data: { state } });
    expect(await readClub(state.club, "player-a")).toEqual(state);
    mocks.invoke.mockResolvedValueOnce({ data: { unchanged: true } });
    expect(await readClub(state.club, "player-a")).toEqual(state);
    expect(mocks.invoke.mock.calls[1][1].body.version).toBe(state.version);
    const updated = { ...state, version: 9, plans: [] };
    mocks.invoke.mockResolvedValueOnce({ data: { state: updated } });
    expect((await readClub(state.club, "player-a")).version).toBe(9);
  });

  it("isolates cached responses by both account and club", async () => {
    const { readClub } = await import("../src/club-client");
    const state = demoClub();
    mocks.invoke.mockResolvedValue({ data: { state } });
    await readClub("club-a", "player-a");
    await readClub("club-a", "player-b");
    await readClub("club-b", "player-a");
    for (const call of mocks.invoke.mock.calls)
      expect(call[1].body.version).toBeUndefined();
  });

  it("fails visibly on a disconnected or rejected read, even when a previous snapshot is cached", async () => {
    const { readClub } = await import("../src/club-client");
    const state = demoClub();
    mocks.invoke.mockResolvedValueOnce({ data: { state } });
    await readClub(state.club, "player-a");
    mocks.invoke.mockResolvedValueOnce({
      error: new Error("Network unavailable"),
    });
    await expect(readClub(state.club, "player-a")).rejects.toThrow(
      "Cannot load",
    );
    mocks.invoke.mockResolvedValueOnce({ data: { error: "Access revoked" } });
    await expect(readClub(state.club, "player-a")).rejects.toThrow(
      "Access revoked",
    );
  });

  it("preserves a request identifier when an interrupted write is retried and surfaces conflicts", async () => {
    const { sendClub } = await import("../src/club-client");
    const state = demoClub();
    const command = {
      id: "same-request",
      type: "grant",
      expectedVersion: 0,
      data: { player: "demo-player", permissions: [] },
    };
    const storage = { setItem: vi.fn() };
    vi.stubGlobal("localStorage", storage);
    mocks.invoke.mockResolvedValueOnce({
      error: {
        context: {
          json: async () => ({ error: "Conflict: refresh before retrying" }),
        },
      },
    });
    await expect(sendClub(state.club, "demo-admin", command)).rejects.toThrow(
      "Conflict:",
    );
    expect(storage.setItem).not.toHaveBeenCalled();
    mocks.invoke.mockResolvedValueOnce({ data: { state } });
    await sendClub(state.club, "demo-admin", command);
    expect(mocks.invoke.mock.calls.map((c) => c[1].body.command.id)).toEqual([
      "same-request",
      "same-request",
    ]);
  });

  it("does not report ambiguous network failures as saved writes or create local fallback records", async () => {
    const { sendClub } = await import("../src/club-client");
    mocks.invoke.mockResolvedValue({ error: new Error("Disconnected") });
    await expect(
      sendClub("club-a", "player-a", {
        id: "request",
        type: "booking",
        data: {},
      }),
    ).rejects.toThrow("outcome is unknown");
  });

  it("loads My Clubs from the service and refuses failed or unauthorized personal exports", async () => {
    const { readClubs, exportPerson } = await import("../src/club-client");
    mocks.invoke.mockResolvedValueOnce({
      data: { clubs: [{ id: "club-a", name: "Club A" }] },
    });
    expect(await readClubs()).toEqual([{ id: "club-a", name: "Club A" }]);
    mocks.invoke.mockResolvedValueOnce({ data: { error: "Not permitted" } });
    await expect(
      exportPerson("club-a", "player-a", "unrelated-player"),
    ).rejects.toThrow("Export failed");
    expect(mocks.invoke.mock.calls[1][1].body.exportSubject).toBe(
      "unrelated-player",
    );
  });
});
