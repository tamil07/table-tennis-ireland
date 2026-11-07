import { useEffect, useState } from "react";
import { authClient, liveMode, phoneEnabled } from "./club-client";
import { safeClubReturn } from "@tti/domain";
function remember(value: string) {
  try {
    sessionStorage.setItem("tti-auth-return", safeClubReturn(value));
  } catch {
    /* Safe root fallback if session storage is unavailable. */
  }
}
function restore() {
  try {
    const value = sessionStorage.getItem("tti-auth-return");
    sessionStorage.removeItem("tti-auth-return");
    if (value) {
      history.replaceState(null, "", safeClubReturn(value));
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  } catch {
    /* Root remains safe. */
  }
}
export function ClubAuth({
  onUser,
  returnTo = "#club-portal",
}: {
  onUser: (id: string | null) => void;
  returnTo?: string;
}) {
  const [signedIn, setSignedIn] = useState(false),
    [mode, setMode] = useState("signin"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState(""),
    [waitingForOtp, setWaitingForOtp] = useState(false);
  useEffect(() => {
    if (!authClient) return;
    void authClient.auth.getSession().then(({ data }) => {
      onUser(data.session?.user.id ?? null);
      setSignedIn(Boolean(data.session));
      if (data.session) setMode("password");
    });
    const { data } = authClient.auth.onAuthStateChange((event, session) => {
      onUser(session?.user.id ?? null);
      setSignedIn(Boolean(session));
      if (session && ["SIGNED_IN", "PASSWORD_RECOVERY"].includes(event))
        restore();
      setMode((current) =>
        event === "PASSWORD_RECOVERY"
          ? "password"
          : session
            ? ["email", "phone"].includes(current)
              ? current
              : "password"
            : "signin",
      );
    });
    return () => data.subscription.unsubscribe();
  }, []);
  if (!liveMode) return null;
  if (!authClient)
    return (
      <p role="alert">
        Live mode is enabled but the Supabase URL/key are missing. No synthetic
        fallback will be used.
      </p>
    );
  const client = authClient;
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ops-auth">
      <h3>{signedIn ? "Your account" : "Sign in or register"}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            email = String(f.get("email") ?? ""),
            password = String(f.get("password") ?? "");
          void run(async () => {
            remember(returnTo);
            const redirect = `${location.origin}${location.pathname}`;
            let error;
            if (mode === "phone") {
              const value = String(f.get("phone") ?? phone);
              setPhone(value);
              if (waitingForOtp)
                ({ error } = await client.auth.verifyOtp({
                  phone: value,
                  token: String(f.get("otp")),
                  type: signedIn ? "phone_change" : "sms",
                }));
              else {
                if (signedIn)
                  ({ error } = await client.auth.updateUser({ phone: value }));
                else
                  ({ error } = await client.auth.signInWithOtp({
                    phone: value,
                  }));
                if (!error) setWaitingForOtp(true);
              }
            } else if (mode === "signup")
              ({ error } = await client.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: redirect },
              }));
            else if (mode === "magic")
              ({ error } = await client.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: redirect, shouldCreateUser: false },
              }));
            else if (mode === "reset")
              ({ error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: redirect,
              }));
            else if (mode === "password")
              ({ error } = await client.auth.updateUser({ password }));
            else if (mode === "email")
              ({ error } = await client.auth.updateUser(
                { email },
                { emailRedirectTo: redirect },
              ));
            else
              ({ error } = await client.auth.signInWithPassword({
                email,
                password,
              }));
            if (error) throw error;
            setMessage(
              ["signup", "magic", "reset", "email"].includes(mode)
                ? "Check your email to continue. Account verification may be required."
                : "Account updated.",
            );
          });
        }}
      >
        <label>
          Action
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setWaitingForOtp(false);
            }}
          >
            {[
              ...(signedIn
                ? [
                    ["password", "Change password"],
                    ["email", "Change email (verification required)"],
                  ]
                : [
                    ["signin", "Sign in"],
                    ["signup", "Create account"],
                    ["magic", "Email sign-in link"],
                    ["reset", "Reset password"],
                  ]),
              ...(phoneEnabled
                ? [
                    [
                      "phone",
                      signedIn ? "Link verified phone" : "Phone sign-in",
                    ],
                  ]
                : []),
            ].map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {!["password", "phone"].includes(mode) && (
          <label>
            Email
            <input type="email" name="email" autoComplete="email" required />
          </label>
        )}
        {mode === "phone" && (
          <>
            <label>
              Phone in international format
              <input
                type="tel"
                name="phone"
                placeholder="+353…"
                defaultValue={phone}
                required
                pattern="\+[0-9]{7,15}"
              />
            </label>
            {waitingForOtp && (
              <label>
                One-time code
                <input
                  name="otp"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  required
                />
              </label>
            )}
          </>
        )}
        {["signup", "signin", "password"].includes(mode) && (
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={mode === "signin" ? 1 : 12}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
            />
          </label>
        )}
        <button disabled={busy}>Continue</button>
      </form>
      <button
        disabled={busy}
        onClick={() =>
          void run(async () => {
            remember(returnTo);
            const options = {
              provider: "google" as const,
              options: { redirectTo: `${location.origin}${location.pathname}` },
            };
            const { error } = signedIn
              ? await client.auth.linkIdentity(options)
              : await client.auth.signInWithOAuth(options);
            if (error) throw error;
          })
        }
      >
        {signedIn ? "Link Google identity" : "Continue with Google"}
      </button>
      {signedIn && (
        <button
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const { error } = await client.auth.signOut();
              if (error) throw error;
              setMode("signin");
            })
          }
        >
          Sign out
        </button>
      )}
      <p>
        Any verified email provider is supported. A saved mobile contact does
        not enable SMS login. Google requires provider configuration.
      </p>
      <p role="status">{message}</p>
    </section>
  );
}
