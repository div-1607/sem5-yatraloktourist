import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const serverUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin;

    socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAsTourist = (userId, digitalId) => {
  const s = getSocket();
  if (s) {
    s.emit('tourist:join', { userId, digitalId });
  }
};

export const joinAsAdmin = (userId) => {
  const s = getSocket();
  if (s) {
    s.emit('admin:join', { userId });
  }
};

export const emitLocationUpdate = (payload) => {
  const s = getSocket();
  if (s) {
    s.emit('location:update', payload);
  }
};

export const sendLocationUpdate = (lat, lng, accuracy, speed) => {
  emitLocationUpdate({
    latitude: lat,
    longitude: lng,
    accuracy,
    speed,
    timestamp: Date.now(),
  });
};

export const emitSOSTrigger = (payload) => {
  const s = getSocket();
  if (s) {
    s.emit('sos:trigger', payload);
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinAsTourist,
  joinAsAdmin,
  emitLocationUpdate,
  sendLocationUpdate,
  emitSOSTrigger,
};
