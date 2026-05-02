import PriorityInbox from '../../components/PriorityInbox';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Priority Inbox | Campus Notifications'
};

export default function PriorityPage() {
    return <PriorityInbox />;
}
