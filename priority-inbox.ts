/**
 * priority-inbox.ts
 *
 * Implements a campus notification system priority inbox.
 * Fetches notifications from a protected endpoint, prioritizes them based on type
 * and recency, and provides an efficient way to retrieve the top N notifications
 * using a Min-Heap. Handles dynamic insertion efficiently.
 */

// ==========================================
// Types & Configuration
// ==========================================

const API_ENDPOINT = "http://20.207.122.201/evaluation-service/notifications";
const LOG_ENDPOINT = "http://20.207.122.201/evaluation-service/logs";
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhczUwNjdAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTM4MiwiaWF0IjoxNzc3Njk4NDgyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiODdlMTRlZGEtY2E2Zi00MTNiLWIxNTItOTNmNGVmMDU5ZmQ3IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwic3ViIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5In0sImVtYWlsIjoiYXM1MDY3QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoiYW5qdWwgc2h1a2xhIiwicm9sbE5vIjoicmEyMzExMDI2MDEwNTcyIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiOWM1ZDQwZjgtYzJkOC00OWFlLTlhNzQtODc5ODhhZjc5YjY5IiwiY2xpZW50U2VjcmV0IjoiZEFLY1p3cmJ6aFZYVVBRVCJ9.NzR7crD5-DOdrRn988Q7llnfDQqsbWYaQ1uY0V7ZZlE";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
    ID: string;
    Type: NotificationType;
    Message: string;
    Timestamp: string;
}

export interface PrioritizedNotification extends Notification {
    priorityScore: number;
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

const TYPE_WEIGHTS: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1
};

// ==========================================
// Logging Utility
// ==========================================

/**
 * Reusable Log function that sends logs to a remote service.
 * Used for tracking important steps instead of console.log.
 */
export async function Log(stack: "frontend", level: LogLevel, pkg: LogPackage, message: string): Promise<void> {
    try {
        await fetch(LOG_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${BEARER_TOKEN}`
            },
            body: JSON.stringify({ stack, level, package: pkg, message })
        });
    } catch (error) {
        // Silently catch logging errors to prevent cascading application failures
    }
}

// ==========================================
// Core Logic & Data Structures
// ==========================================

/**
 * Calculates priority score based on Type and recency.
 * Formula: typeWeight + (timestamp_ms / 1e12)
 */
export function calculatePriorityScore(notification: Notification): number {
    const weight = TYPE_WEIGHTS[notification.Type] || 0;
    const timestampMs = new Date(notification.Timestamp).getTime();
    
    // Fallback to 0 if Timestamp is invalid
    const validMs = isNaN(timestampMs) ? 0 : timestampMs;
    const score = weight + (validMs / 1e12);

    // Asynchronously log the calculation process (no await so it doesn't block sync execution)
    void Log("frontend", "debug", "utils", `Calculated priority score ${score.toFixed(6)} for notification ${notification.ID} (Type: ${notification.Type})`);
    
    return score;
}

/**
 * Min-Heap implementation for maintaining the top N priority notifications dynamically.
 * This ensures that adding a new notification and fetching the top N are both efficient.
 */
export class PriorityInbox {
    private heap: PrioritizedNotification[] = [];
    private readonly capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    private getParentIndex(i: number): number { return Math.floor((i - 1) / 2); }
    private getLeftChildIndex(i: number): number { return 2 * i + 1; }
    private getRightChildIndex(i: number): number { return 2 * i + 2; }
    
    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private heapifyUp(index: number): void {
        let currentIndex = index;
        while (
            currentIndex > 0 && 
            this.heap[this.getParentIndex(currentIndex)].priorityScore > this.heap[currentIndex].priorityScore
        ) {
            this.swap(currentIndex, this.getParentIndex(currentIndex));
            currentIndex = this.getParentIndex(currentIndex);
        }
    }

    private heapifyDown(index: number): void {
        let smallest = index;
        const left = this.getLeftChildIndex(index);
        const right = this.getRightChildIndex(index);

        if (left < this.heap.length && this.heap[left].priorityScore < this.heap[smallest].priorityScore) {
            smallest = left;
        }

        if (right < this.heap.length && this.heap[right].priorityScore < this.heap[smallest].priorityScore) {
            smallest = right;
        }

        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }

    /**
     * Inserts a new notification into the inbox if it has high enough priority.
     * Efficient O(log N) insertion for handling dynamic, arriving notifications.
     */
    public async insert(notification: Notification): Promise<void> {
        await Log("frontend", "info", "state", `Attempting to insert new notification ${notification.ID}`);
        
        const score = calculatePriorityScore(notification);
        const pNotif: PrioritizedNotification = { ...notification, priorityScore: score };

        if (this.heap.length < this.capacity) {
            this.heap.push(pNotif);
            this.heapifyUp(this.heap.length - 1);
            await Log("frontend", "info", "state", `Inserted notification ${notification.ID} (Heap not full)`);
        } else if (pNotif.priorityScore > this.heap[0].priorityScore) {
            // New item has higher priority than the minimum item in the top N
            const removed = this.heap[0];
            this.heap[0] = pNotif;
            this.heapifyDown(0);
            await Log("frontend", "info", "state", `Inserted notification ${notification.ID}: Replaced existing lower-priority item ${removed.ID}`);
        } else {
            await Log("frontend", "debug", "state", `Notification ${notification.ID} ignored (Priority too low to enter top ${this.capacity})`);
        }
    }

    /**
     * Retrieves the top N notifications, sorted descending by priority score.
     */
    public getTopNotifications(): PrioritizedNotification[] {
        return [...this.heap].sort((a, b) => b.priorityScore - a.priorityScore);
    }
}

// ==========================================
// Primary Operations
// ==========================================

/**
 * Fetches the notifications from the evaluation service.
 */
export async function fetchNotifications(): Promise<Notification[]> {
    await Log("frontend", "info", "api", "Starting API fetch for notifications");
    
    try {
        const response = await fetch(API_ENDPOINT, {
            headers: {
                "Authorization": `Bearer ${BEARER_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            await Log("frontend", "error", "api", `API fetch error: Expected array, got ${JSON.stringify(data)}`);
            return [];
        }
        await Log("frontend", "info", "api", `API fetch success: retrieved ${data.length} notifications`);
        return data as Notification[];
    } catch (err: unknown) {
        const error = err as Error;
        await Log("frontend", "error", "api", `API fetch error: Failed to retrieve notifications - ${error.message || 'Unknown error'}`);
        return [];
    }
}

/**
 * Returns the top N notifications from an array using the min-heap.
 * The parameter n is configurable as required.
 */
export async function getTopN(notifications: Notification[], n: number): Promise<PrioritizedNotification[]> {
    await Log("frontend", "info", "utils", `Starting top N selection for top ${n} out of ${notifications.length} notifications`);
    
    const inbox = new PriorityInbox(n);
    
    for (const notif of notifications) {
        await inbox.insert(notif);
    }

    const topNotifications = inbox.getTopNotifications();
    await Log("frontend", "info", "utils", `Completed top N selection. Selected ${topNotifications.length} items`);
    return topNotifications;
}

// ==========================================
// Execution Entrypoint
// ==========================================

async function main() {
    await Log("frontend", "info", "state", "Application started: Priority Inbox execution");

    const notifications = await fetchNotifications();
    
    if (notifications.length === 0) {
        await Log("frontend", "warn", "state", "No notifications to process");
        return;
    }

    // You can configure N to 10, 15, 20, etc.
    const N = 10;
    const topN = await getTopN(notifications, N);

    // Final Output: Requirement is to print top 10 priority notifications to console with scores
    console.log(`\n=== TOP ${N} PRIORITY NOTIFICATIONS ===\n`);
    topN.forEach((notif, i) => {
        console.log(`${i + 1}. [${notif.Type}] ${notif.Message}`);
        console.log(`   ID: ${notif.ID}`);
        console.log(`   Priority Score: ${notif.priorityScore.toFixed(6)}`);
        console.log(`   Timestamp: ${notif.Timestamp}\n`);
    });

    await Log("frontend", "info", "state", "Application completed successfully");
}

// Execute main
main().catch(async (error) => {
    await Log("frontend", "fatal", "state", `Unhandled exception: ${error.message}`);
    console.error("Critical error:", error);
});

