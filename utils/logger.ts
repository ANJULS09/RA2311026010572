const LOG_API = "/api/logs";
const AUTH_API = "/api/auth";

const AUTH_CREDENTIALS = {
  email: "as5067@srmist.edu.in",
  name: "anjul shukla",
  rollNo: "ra2311026010572",
  accessCode: "QkbpxH",
  clientID: "9c5d40f8-c2d8-49ae-9a74-87988af79b69",
  clientSecret: "dAKcZwrbzhVXUPQT"
};

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export function clearToken() {
  cachedToken = null;
  tokenExpiry = null;
}

export async function getToken(): Promise<string> {
  // If we have a cached token and it hasn't expired (adding 5 min buffer), return it
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(AUTH_CREDENTIALS),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // data.expires_in is usually in seconds or unix timestamp. Let's assume timestamp or seconds.
    // Looking at the response: "expires_in": 1777705538. This is a unix timestamp in seconds.
    tokenExpiry = data.expires_in * 1000;
    
    return cachedToken as string;
  } catch (error) {
    console.error("Failed to fetch auth token:", error);
    return "";
  }
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
type Stack = "frontend" | "backend";

export async function Log(
  stack: Stack,
  level: LogLevel,
  pkg: FrontendPackage,
  message: string
): Promise<void> {
  try {
    const token = await getToken();
    if (!token) return;

    let response = await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    if (response.status === 401 || response.status === 403) {
      clearToken();
      const newToken = await getToken();
      if (!newToken) return;

      await fetch(LOG_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
        body: JSON.stringify({ stack, level, package: pkg, message }),
      });
    }
  } catch (error) {
    // silently fail
  }
}
