import { useAuthStore } from '../store/useAuthStore';
import { socketService } from '../services/socket.service';

export function useAuth() {
  const store = useAuthStore();

  const loginWithSocket = async (phone: string, password: string) => {
    await store.login(phone, password);
    const token = useAuthStore.getState().token;
    if (token) socketService.connect(token);
  };

  const logoutWithSocket = async () => {
    socketService.disconnect();
    await store.logout();
  };

  return {
    ...store,
    login: loginWithSocket,
    logout: logoutWithSocket,
    dismissError: store.clearError,
  };
}
