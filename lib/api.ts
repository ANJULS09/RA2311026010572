import { Log } from '../utils/logger';

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
    ID: string;
    Type: NotificationType;
    Message: string;
    Timestamp: string;
}

export interface FetchNotificationsParams {
    limit?: number;
    page?: number;
    notification_type?: NotificationType | "All";
}

const API_URL = "http://20.207.122.201/evaluation-service/notifications";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhczUwNjdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTM4MiwiaWF0IjoxNzc3Njk4NDgyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiODdlMTRlZGEtY2E2Zi00MTNiLWIxNTItOTNmNGVmMDU5ZmQ3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwic3ViIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5In0sImVtYWlsIjoiYXM1MDY3QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTcyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5IiwiY2xpZW50U2VjcmV0IjoiZEFLY1p3cmJ6aFZYVVBRVCJ9.NzR7crD5-DOdrRn988Q7llnfDQqsbWYaQ1uY0V7ZZlE";

export async function fetchNotifications(params: FetchNotificationsParams): Promise<Notification[]> {
    await Log("frontend", "info", "api", `Starting API fetch: ${JSON.stringify(params)}`);
    
    try {
        const url = new URL(API_URL);
        if (params.limit) url.searchParams.append("limit", params.limit.toString());
        if (params.page) url.searchParams.append("page", params.page.toString());
        if (params.notification_type && params.notification_type !== "All") {
            url.searchParams.append("notification_type", params.notification_type);
        }

        const response = await fetch(url.toString(), {
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            let errorMsg = response.statusText;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {
                // Ignore parse error
            }
            throw new Error(errorMsg || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            if (data && typeof data === 'object' && 'message' in data) {
                throw new Error(data.message as string);
            }
            throw new Error("Expected array response from API");
        }

        await Log("frontend", "info", "api", `Successfully fetched ${data.length} notifications`);
        return data as Notification[];
    } catch (err: unknown) {
        const error = err as Error;
        await Log("frontend", "error", "api", `API fetch error: ${error.message}`);
        throw error; // Re-throw to be handled by the UI
    }
}
