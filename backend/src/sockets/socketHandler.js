const User = require('../models/User');
const Location = require('../models/Location');
const AuditLog = require('../models/AuditLog');

// In-memory connected users map
const connectedUsers = new Map();

/**
 * Initialize Socket.IO handlers
 */
function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Tourist joins with authentication
     */
    socket.on('tourist:join', async (data) => {
      try {
        const { userId, digitalId } = data;

        if (!userId) return;

        connectedUsers.set(userId, {
          socketId: socket.id,
          digitalId,
          connectedAt: new Date(),
        });

        socket.join(`user:${userId}`);
        socket.join('tourists');

        // Update online status
        await User.findByIdAndUpdate(userId, { isOnline: true });

        // Notify admin dashboard
        io.to('admins').emit('tourist:online', {
          userId,
          digitalId,
          socketId: socket.id,
          timestamp: new Date(),
        });

        socket.emit('connected', {
          message: 'Connected to YatraLok Real-time Services',
          socketId: socket.id,
        });

        console.log(`[Socket] Tourist joined: ${digitalId || userId}`);
      } catch (error) {
        console.error('[Socket] Join error:', error.message);
      }
    });

    /**
     * Admin joins
     */
    socket.on('admin:join', (data) => {
      const { userId } = data;
      socket.join('admins');
      socket.join(`user:${userId}`);
      console.log(`[Socket] Admin joined: ${userId}`);
    });

    /**
     * Real-time location update
     */
    socket.on('location:update', async (data) => {
      try {
        const { userId, latitude, longitude, speed, accuracy, batteryLevel } = data;

        if (!userId || !latitude || !longitude) return;

        // Store location
        await Location.create({
          user: userId,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          latitude,
          longitude,
          speed: speed || 0,
          accuracy: accuracy || null,
          batteryLevel: batteryLevel || null,
          source: 'gps',
        });

        // Broadcast to admin monitoring
        io.to('admins').emit('tourist:location', {
          userId,
          latitude,
          longitude,
          speed,
          batteryLevel,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('[Socket] Location update error:', error.message);
      }
    });

    /**
     * SOS Emergency broadcast
     */
    socket.on('sos:trigger', (data) => {
      const { userId, digitalId, emergencyType, location, message } = data;

      // Broadcast to all admins immediately
      io.to('admins').emit('sos:alert', {
        userId,
        digitalId,
        emergencyType,
        location,
        message,
        timestamp: new Date(),
        priority: 'CRITICAL',
      });

      // Acknowledge to tourist
      socket.emit('sos:acknowledged', {
        message: 'Your SOS alert has been received. Help is on the way.',
        timestamp: new Date(),
      });

      console.log(`[Socket] 🚨 SOS Alert from ${digitalId}: ${emergencyType}`);
    });

    /**
     * Geofence breach alert
     */
    socket.on('geofence:breach', (data) => {
      const { userId, zoneName, zoneType, alertLevel } = data;

      io.to('admins').emit('geofence:alert', {
        userId,
        zoneName,
        zoneType,
        alertLevel,
        timestamp: new Date(),
      });
    });

    /**
     * Zone entry/exit notification
     */
    socket.on('zone:event', (data) => {
      const { userId, zoneId, zoneName, eventType } = data;

      io.to('admins').emit('zone:activity', {
        userId,
        zoneId,
        zoneName,
        eventType, // 'entry' or 'exit'
        timestamp: new Date(),
      });
    });

    /**
     * Admin broadcasts alert to all tourists
     */
    socket.on('admin:broadcast', (data) => {
      const { message, type, severity } = data;

      io.to('tourists').emit('admin:alert', {
        message,
        type: type || 'info',
        severity: severity || 'low',
        timestamp: new Date(),
      });

      console.log(`[Socket] Admin broadcast: ${message}`);
    });

    /**
     * Admin sends direct message to tourist
     */
    socket.on('admin:message', (data) => {
      const { targetUserId, message, type } = data;

      io.to(`user:${targetUserId}`).emit('admin:direct-message', {
        message,
        type: type || 'info',
        timestamp: new Date(),
      });
    });

    /**
     * Crowd density update
     */
    socket.on('crowd:update', (data) => {
      const { zoneId, zoneName, density, percentage } = data;

      io.to('admins').emit('crowd:density', {
        zoneId,
        zoneName,
        density,
        percentage,
        timestamp: new Date(),
      });
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', async () => {
      // Find and remove user
      for (const [userId, userData] of connectedUsers) {
        if (userData.socketId === socket.id) {
          connectedUsers.delete(userId);

          try {
            await User.findByIdAndUpdate(userId, { isOnline: false });
          } catch (err) {
            // Ignore
          }

          io.to('admins').emit('tourist:offline', {
            userId,
            digitalId: userData.digitalId,
            timestamp: new Date(),
          });

          break;
        }
      }

      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get connected users count
 */
function getConnectedUsersCount() {
  return connectedUsers.size;
}

/**
 * Get connected users list
 */
function getConnectedUsersList() {
  return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    userId,
    ...data,
  }));
}

module.exports = {
  initializeSocketHandlers,
  getConnectedUsersCount,
  getConnectedUsersList,
};
