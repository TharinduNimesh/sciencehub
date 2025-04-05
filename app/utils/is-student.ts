export default function() {
    if (import.meta.server) return;

    const auth = useAuthStore();

    if (!auth.user) {
        return false;
    }

    const user = auth.user;
    
    return user.role === 'STUDENT';
}