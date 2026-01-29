const socketIo = require('socket.io');
const userModel = require('../modules/user/user.model');
const captainModel = require('../modules/captain/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`👤 Join event - Type: ${userType}, User ID: ${userId}, Socket ID: ${socket.id}`);

            try {
                if (userType === 'user') {
                    const user = await userModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                    console.log(`✅ User socketId updated:`, user?._id);
                } else if (userType === 'captain') {
                    const captain = await captainModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                    console.log(`✅ Captain socketId updated:`, captain?._id, 'Socket:', captain?.socketId);
                }
            } catch (err) {
                console.error(`❌ Error updating socketId:`, err.message);
            }
        });

        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.ltd || !location.lng) {
                console.error(`❌ Invalid location data from ${userId}`);
                return socket.emit('error', { message: 'Invalid location data' });
            }

            try {
                const captain = await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        ltd: location.ltd,
                        lng: location.lng
                    }
                }, { new: true });
                console.log(`📍 Captain location updated: ${userId} -> [${location.ltd}, ${location.lng}]`);
            } catch (err) {
                console.error(`❌ Error updating location:`, err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
}

function sendMessageToSocketId(socketId, messageObject) {
    console.log(`Sending message to ${socketId}`, messageObject);
    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };
