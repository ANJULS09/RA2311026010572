import config from "./config";

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

type FrontendPackage =
    | "api"
    | "component"
    | "hook"
    | "page"
    | "state"
    | "style"
    | "auth"
    | "config"
    | "middleware"
    | "utils";

type Stack = "frontend" | "backend";

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
    if (cachedToken) return cachedToken;

    const response = await fetch(config.AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.AUTH_CREDENTIALS),
    });

    const data = await response.json();
    cachedToken = data.access_token;
    return cachedToken as string;
}

export async function Log(
    stack: Stack,
    level: LogLevel,
    pkg: FrontendPackage,
    message: string
): Promise<void> {
    try {
        const token = await getToken();

        const response = await fetch(config.LOG_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                stack,
                level,
                package: pkg,
                message,
            }),
        });

        if (!response.ok) {
            cachedToken = null;
            const newToken = await getToken();
            await fetch(config.LOG_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newToken}`,
                },
                body: JSON.stringify({ stack, level, package: pkg, message }),
            });
            return;
        }

        const data = await response.json();
        console.log(`[Logger] ✅ ${level.toU