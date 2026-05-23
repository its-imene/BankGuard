import { io } from 'socket.io-client';
import { API_URLS, getApiBaseUrl } from './api';

class SocketService {
  socket = null;
  urlIndex = 0;

  connect(userId) {
    if (this.socket) return;

    const preferredUrl = getApiBaseUrl();
    this.urlIndex = Math.max(API_URLS.indexOf(preferredUrl), 0);
    this.connectToUrl(userId, API_URLS[this.urlIndex]);

    return this.socket;
  }

  connectToUrl(userId, baseUrl) {
    this.socket = io(`${baseUrl}/notifications`, {
      transports: ['websocket'],
      reconnectionAttempts: 2,
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification socket');
      // Join the private notification room
      this.socket.emit('joinNotifications', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    this.socket.on('connect_error', () => {
      const nextUrl = API_URLS[this.urlIndex + 1];
      if (!nextUrl) return;

      this.socket.disconnect();
      this.socket = null;
      this.urlIndex += 1;
      console.warn(`Notification socket unavailable. Trying fallback API: ${nextUrl}`);
      this.connectToUrl(userId, nextUrl);
    });
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
