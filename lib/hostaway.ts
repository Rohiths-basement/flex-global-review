type TokenState = { token: string; expiresAt: number } | null;

let tokenState: TokenState = null;

export async function getHostawayAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenState && tokenState.expiresAt > now + 60_000) return tokenState.token; // 60s safety

  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_CLIENT_SECRET;
  if (!accountId || !apiKey) throw new Error("Missing Hostaway credentials");

  const res = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId: Number(accountId), apiKey }),
    // Some sandboxes accept this simplified body; adjust if needed.
    // Docs confirm Client Credentials flow and long-lived tokens.
  });

  if (!res.ok) {
    throw new Error(`Hostaway token failed ${res.status}`);
  }
  const data = await res.json();
  const accessToken: string = data?.result?.accessToken ?? data?.accessToken ?? data?.token;
  const expiresInSec: number = data?.result?.expiresIn ?? data?.expiresIn ?? 60 * 60 * 24 * 30; // fallback 30d
  if (!accessToken) throw new Error("Hostaway token missing in response");

  tokenState = { token: accessToken, expiresAt: now + expiresInSec * 1000 };
  return accessToken;
}
