export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

/**
 * Reusable Log function that sends logs to a remote service.
 * Do not use console.log in the application, use this instead.
 */
export async function Log(stack: "frontend", level: LogLevel, pkg: LogPackage, message: string): Promise<void> {
  try {
    await fetch("http://20.207.122.201/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhczUwNjdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTM4MiwiaWF0IjoxNzc3Njk4NDgyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiODdlMTRlZGEtY2E2Zi00MTNiLWIxNTItOTNmNGVmMDU5ZmQ3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwic3ViIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5In0sImVtYWlsIjoiYXM1MDY3QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTcyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5IiwiY2xpZW50U2VjcmV0IjoiZEFLY1p3cmJ6aFZYVVBRVCJ9.NzR7crD5-DOdrRn988Q7llnfDQqsbWYaQ1uY0V7ZZlE"
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });
  } catch (error) {
    // Failsafe in case logging fails, we prevent cascading app failures
  }
}
