import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://sanctions-intelligence-management-system.onrender.com';

class SocketService {
  socket = null;

  connect(userId) {
    if (this.socket) return;

    this.socket = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification socket');
      // Join the private notification room
      this.socket.emit('joinNotifications', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback) {
    if (!this.socket) return;
    this.socket.on('newNotification', callback);
  }
}

export default new SocketService();
