const express = require('express');
const router = express.Router();
const { 
  createMessage, 
  getRoomMessages, 
  searchMessages,
  markNotificationsAsRead
} = require('../controllers/message.controller');

// Create a new message
router.post('/', createMessage);

// Get messages of a room
router.get('/room/:roomId', getRoomMessages);

// Search messages
router.get('/search', searchMessages);

// Mark notifications as read
router.post('/notifications/read', markNotificationsAsRead);

module.exports = router;
