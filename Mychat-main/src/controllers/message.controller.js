const Message = require('../models/message.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');

// Create a new message
const createMessage = async (req, res) => {
  try {
    const { text, roomId } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user is a member of the room
    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this room to send a message'
      });
    }
    
    // Create a new message
    const newMessage = new Message({
      text,
      sender: req.user._id,
      room: roomId
    });
    
    // Save the message to the database
    await newMessage.save();
    
    // After saving, mentions is filled by the model middleware
    // Now, notify mentioned users
    if (newMessage.mentions && newMessage.mentions.length > 0) {
      for (const mentionedUserId of newMessage.mentions) {
        await User.findByIdAndUpdate(
          mentionedUserId,
          {
            $push: {
              notifications: {
                message: `You were mentioned by ${req.user.username} in ${room.name}`,
                room: roomId
              }
            }
          }
        );
      }
    }
    
    // Populate the message with sender information
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('mentions', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Get messages of a room
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages with pagination
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 }) // From newest to oldest
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'username')
      .populate('mentions', 'username');
    
    // Get total message count
    const totalMessages = await Message.countDocuments({ room: roomId });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      currentPage: parseInt(page),
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving messages'
    });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { query, roomId } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'A search term is required'
      });
    }
    
    let searchQuery = { text: { $regex: query, $options: 'i' } };
    
    // If roomId is provided, filter by room
    if (roomId) {
      // Check if room exists
      const room = await Room.findById(roomId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }
      
      searchQuery.room = roomId;
    }
    
    // Search messages
    const messages = await Message.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'username')
      .populate('room', 'name')
      .populate('mentions', 'username');
    
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error searching messages'
    });
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  try {
    // Update all unread notifications
    await User.updateOne(
      { _id: req.user._id },
      { 
        $set: { 
          "notifications.$[elem].read": true 
        } 
      },
      { 
        arrayFilters: [{ "elem.read": false }],
        multi: true 
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
};

module.exports = {
  createMessage,
  getRoomMessages,
  searchMessages,
  markNotificationsAsRead
};
