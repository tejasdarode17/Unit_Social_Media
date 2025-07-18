import { formatDistanceToNow } from 'date-fns';

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}


export function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatTimeAgo(dateString) {
    const timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true });
    return timeAgo.replace(/^about /, '');
}