import { Log, getToken } from '@/utils/logger';

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

const API_URL = "/api/notifications";
// TOKEN is dynamically fetched now

export async function fetchNotifications(params: FetchNotificationsParams): Promise<Notification[]> {
    await Log("frontend", "info", "api", `Starting API fetch: ${JSON.stringify(params)}`);
    
    try {
        const paramsStr = new URLSearchParams();
        if (params.limit) paramsStr.append("limit", params.limit.toString());
        if (params.page) paramsStr.append("page", params.page.toString());
        if (params.notification_type && params.notification_type !== "All") {
            paramsStr.append("notification_type", params.notification_type);
        }

        const queryString = paramsStr.toString();
        const finalUrl = queryString ? `${API_URL}?${queryString}` : API_URL;

        const token = await getToken();
        if (!token) throw new Error("Failed to get auth token");

        const response = await fetch(finalUrl, {
            headers: {
                "Authorization": `Bearer ${token}`,
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
