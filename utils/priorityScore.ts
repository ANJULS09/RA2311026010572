import { Notification, NotificationType } from '../lib/api';
import { Log } from './logger';

export interface PrioritizedNotification extends Notification {
    ID: string;
    Type: NotificationType;
    Message: string;
    Timestamp: string;
    priorityScore: number;
}

const TYPE_WEIGHTS: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1
};

export function calculatePriorityScore(type: NotificationType, timestamp: string, id: string): number {
    const weight = TYPE_WEIGHTS[type] || 0;
    const timestampMs = new Date(timestamp).getTime();
    const validMs = isNaN(timestampMs) ? 0 : timestampMs;
    const score = weight + (validMs / 1e12);
    
    // Log priority calculation as requested
    void Log("frontend", "debug", "utils", `Calculated priority score ${score.toFixed(6)} for notification ${id}`);
    
    return score;
}
