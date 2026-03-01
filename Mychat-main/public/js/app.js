// Main application module
const appModule = (() => {
  // Variables
  let socket = null;
  
  // Initialization
  const init = () => {
    console.log('Initializing Mychat application');
  };
  
  // Initialize Socket.io
  const initSocket = (token) => {
    if (socket) {
      socket.disconnect();
    }
    
    // Connect to Socket.io with authentication token
    socket = io({
      auth: {
        token
      }
    });
    
    // Socket.io events
    setupSocketEvents();
  };
  
  // Setup Socket.io events
  const setupSocketEvents = () => {
    // Connection established
    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });
    
    // Connection error
    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });
    
    // New message
    socket.on('new_message', (message) => {
      chatModule.addMessage(message);
    });
    
    // Notification
    socket.on('notification', (notification) => {
      chatModule.addNotification({
        message: notification.message,
        room: notification.room,
        read: false,
        createdAt: new Date()
      });
    });
    
    // Online users
    socket.on('users_online', (userIds) => {
      updateOnlineUsers(userIds);
    });
    
    // User joined a room
    socket.on('user_joined', (data) => {
      console.log(`${data.user.username} joined the room`);
    });
    
    // User left a room
    socket.on('user_left', (data) => {
      console.log(`${data.user.username} left the room`);
    });
    
    // User is typing
    socket.on('user_typing', (data) => {
      chatModule.showTypingIndicator(data.user);
    });
    
    // User stopped typing
    socket.on('user_stop_typing', (data) => {
      chatModule.hideTypingIndicator(data.user.id);
    });
    
    // Error
    socket.on('error', (error) => {
      console.error('Socket.io error:', error.message);
      alert(error.message);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });
  };
  
  // Update online users list
  const updateOnlineUsers = (userIds) => {
    const onlineUsersList = document.getElementById('online-users-list');
    onlineUsersList.innerHTML = '';
    
    if (userIds.length === 0) {
      onlineUsersList.innerHTML = '<p>No users online</p>';
      return;
    }
    
    // Get user information
    fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${authModule.getToken()}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const onlineUsers = data.users.filter(user => userIds.includes(user._id));
        
        onlineUsers.forEach(user => {
          const userElement = document.createElement('div');
          userElement.classList.add('user-item');
          userElement.innerHTML = `
            <span>${user.username}</span>
            <span class="online-indicator"></span>
          `;
          onlineUsersList.appendChild(userElement);
        });
      })
      .catch(error => {
        console.error('Error retrieving users:', error);
      });
  };
  
  // Send message
  const sendMessage = (text, roomId) => {
    if (!socket || !socket.connected) {
      alert('You are not connected to the server');
      return;
    }
    
    socket.emit('send_message', { text, roomId });
  };
  
  // Join a room
  const joinRoom = (roomId) => {
    if (!socket || !socket.connected) {
      alert('You are not connected to the server');
      return;
    }
    
    socket.emit('join_room', roomId);
  };
  
  // Leave a room
  const leaveRoom = (roomId) => {
    if (!socket || !socket.connected) {
      alert('You are not connected to the server');
      return;
    }
    
    socket.emit('leave_room', roomId);
  };
  
  // Indicate user is typing
  const startTyping = (roomId) => {
    if (!socket || !socket.connected) return;
    
    socket.emit('typing', { roomId });
  };
  
  // Indicate user stopped typing
  const stopTyping = (roomId) => {
    if (!socket || !socket.connected) return;
    
    socket.emit('stop_typing', { roomId });
  };
  
  // Disconnect Socket.io
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };
  
  // Public API
  return {
    init,
    initSocket,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    disconnectSocket
  };
})();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', appModule.init);
