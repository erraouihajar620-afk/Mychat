const Room = require('../models/room.model');
const User = require('../models/user.model');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Check if room already exists
    const existingRoom = await Room.findOne({ name });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'A room with this name already exists'
      });
    }

    // Create a new room
    const newRoom = new Room({
      name,
      description,
      category,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // Save the room to the database
    await newRoom.save();

    // Add the room to the user who created it
    await User.findByIdAndUpdate(
      req.user._id, 
      { $push: { rooms: newRoom._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: newRoom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating room'
    });
  }
};

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'username email')
      .populate('members', 'username');

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving rooms'
    });
  }
};

// Get a room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('createdBy', 'username email')
      .populate('members', 'username email');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving room'
    });
  }
};

// Join a room
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user is already a member of this room
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this room'
      });
    }
    
    // Add the user to the room members
    room.members.push(req.user._id);
    await room.save();
    
    // Add the room to the user's rooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { rooms: roomId } }
    );
    
    res.status(200).json({
      success: true,
      message: 'You have joined the room successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error joining room'
    });
  }
};

// Leave a room
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user is a member of this room
    if (!room.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }
    
    // Remove the user from the room members
    room.members = room.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    await room.save();
    
    // Remove the room from the user's rooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { rooms: roomId } }
    );
    
    res.status(200).json({
      success: true,
      message: 'You have left the room successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error leaving room'
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  leaveRoom
};
