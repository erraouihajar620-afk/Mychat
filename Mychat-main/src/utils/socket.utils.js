const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Message = require('../models/message.model');

// Map to store connected users
const connectedUsers = new Map();

// Setup Socket.io
const setupSocketIO = (io) => {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket.io authentication error:', error.message);
      next(new Error('Invalid authentication'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Add user to connected users map
    connectedUsers.set(socket.user._id.toString(), socket.id);
    
    // Automatically join rooms that user belongs to
    if (socket.user.rooms && socket.user.rooms.length > 0) {
      socket.user.rooms.forEach(roomId => {
        socket.join(roomId.toString());
      });
    }
    
    // Emit the list of connected users
    io.emit('users_online', Array.from(connectedUsers.keys()));
    
    // Receive a message
    socket.on('send_message', async (messageData) => {
      try {
        const { text, roomId } = messageData;
        
        // Check if user is a member of the room
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        if (!room.members.includes(socket.user._id)) {
          socket.emit('error', { message: 'You must be a member of this room to send a message' });
          return;
        }
        
        // Create a new message
        const newMessage = new Message({
          text,
          sender: socket.user._id,
          room: roomId
        });
        
        // Save the message
        await newMessage.save();
        
        // Populate sender information for sending
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username')
          .populate('mentions', 'username');
        
        // Send message to all room members
        io.to(roomId).emit('new_message', populatedMessage);
        
        // Notify mentioned users
        if (newMessage.mentions && newMessage.mentions.length > 0) {
          for (const mentionedUserId of newMessage.mentions) {
            // Create a notification
            await User.findByIdAndUpdate(
              mentionedUserId,
              {
                $push: {
                  notifications: {
                    message: `You were mentioned by ${socket.user.username} in ${room.name}`,
                    room: roomId
                  }
                }
              }
            );
            
            // Send real-time notification if user is connected
            const mentionedSocketId = connectedUsers.get(mentionedUserId.toString());
            if (mentionedSocketId) {
              io.to(mentionedSocketId).emit('notification', {
                message: `You were mentioned by ${socket.user.username} in ${room.name}`,
                room: roomId,
                from: socket.user.username
              });
            }
          }
        }
      } catch (error) {
        console.error('Message sending error:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Join a room
    socket.on('join_room', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Add user to room in database
        if (!room.members.includes(socket.user._id)) {
          room.members.push(socket.user._id);
          await room.save();
          
          // Add room to user
          await User.findByIdAndUpdate(
            socket.user._id,
            { $push: { rooms: roomId } }
          );
        }
        
        // Join Socket.io room
        socket.join(roomId);
        
        // Inform other members
        socket.to(roomId).emit('user_joined', {
          room: roomId,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });
        
        socket.emit('room_joined', { roomId });
      } catch (error) {
        console.error('Room connection error:', error);
        socket.emit('error', { message: 'Error connecting to room' });
      }
    });
    
    // Leave a room
    socket.on('leave_room', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }
        
        // Remove user from room in database
        if (room.members.includes(socket.user._id)) {
          room.members = room.members.filter(
            member => member.toString() !== socket.user._id.toString()
          );
          await room.save();
          
          // Remove room from user
          await User.findByIdAndUpdate(
            socket.user._id,
            { $pull: { rooms: roomId } }
          );
        }
        
        // Leave Socket.io room
        socket.leave(roomId);
        
        // Inform other members
        socket.to(roomId).emit('user_left', {
          room: roomId,
          user: {
            id: socket.user._id,
            username: socket.user.username
          }
        });
        
        socket.emit('room_left', { roomId });
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit('error', { message: 'Error leaving room' });
      }
    });
    
    // Typing indicator
    socket.on('typing', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', {
        room: roomId,
        user: {
          id: socket.user._id,
          username: socket.user.username
        }
      });
    });
    
    socket.on('stop_typing', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_stop_typing', {
        room: roomId,
        user: {
          id: socket.user._id,
          username: socket.user.username
        }
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
      
      // Remove user from connected users map
      connectedUsers.delete(socket.user._id.toString());
      
      // Emit updated list of connected users
      io.emit('users_online', Array.from(connectedUsers.keys()));
    });
  });
};

module.exports = { setupSocketIO };
