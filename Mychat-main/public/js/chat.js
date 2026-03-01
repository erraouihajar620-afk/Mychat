// Chat management
const chatModule = (() => {
  // DOM elements
  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const notificationsList = document.getElementById('notifications-list');
  const notificationCount = document.getElementById('notification-count');
  
  // Variables
  const API_URL = '/api';
  let messages = [];
  let notifications = [];
  let typingTimeout = null;
  
  // Initialization
  const init = () => {
    // Events
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Typing event for typing indicator
    messageInput.addEventListener('input', handleTyping);
    
    // Load notifications
    loadNotifications();
  };
  
  // Load messages of a room
  const loadMessages = async (roomId) => {
    try {
      const token = authModule.getToken();
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/messages/room/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error loading messages:', data.message);
        return;
      }
      
      messages = data.messages;
      renderMessages();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  // Load notifications
  const loadNotifications = async () => {
    try {
      const token = authModule.getToken();
      const user = authModule.getCurrentUser();
      
      if (!token || !user) return;
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error loading notifications:', data.message);
        return;
      }
      
      notifications = data.user.notifications || [];
      renderNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  // Format date in readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`;
  };
  
  // Render messages
  const renderMessages = () => {
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = '<p class="no-messages">No messages in this room</p>';
      return;
    }
    
    const currentUser = authModule.getCurrentUser();
    
    messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      
      // Determine if message was sent by current user
      if (message.sender._id === currentUser.id) {
        messageElement.classList.add('sent');
      } else {
        messageElement.classList.add('received');
      }
      
      // Format date
      const formattedDate = formatDate(message.createdAt);
      
      // Format text with mentions
      let messageText = message.text;
      if (message.mentions && message.mentions.length > 0) {
        message.mentions.forEach(mention => {
          const regex = new RegExp(`@${mention.username}`, 'g');
          messageText = messageText.replace(regex, `<strong>@${mention.username}</strong>`);
        });
      }
      
      messageElement.innerHTML = `
        <div class="sender">${message.sender.username}</div>
        <div class="content">${messageText}</div>
        <div class="timestamp">${formattedDate}</div>
      `;
      
      messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // Render notifications
  const renderNotifications = () => {
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<p>No notifications</p>';
      notificationCount.classList.add('hidden');
      return;
    }
    
    // Count unread notifications
    const unreadCount = notifications.filter(notification => !notification.read).length;
    
    if (unreadCount > 0) {
      notificationCount.textContent = unreadCount;
      notificationCount.classList.remove('hidden');
    } else {
      notificationCount.classList.add('hidden');
    }
    
    // Show last 5 notifications
    notifications.slice(0, 5).forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.classList.add('notification-item');
      
      if (!notification.read) {
        notificationElement.classList.add('unread');
      }
      
      // Format date with new function
      const formattedDate = formatDate(notification.createdAt);
      
      notificationElement.innerHTML = `
        <div class="notification-content">${notification.message}</div>
        <div class="notification-timestamp">${formattedDate}</div>
      `;
      
      notificationElement.addEventListener('click', () => {
        markNotificationAsRead(notification._id);
        
        // If notification concerns a room, open that room
        if (notification.room) {
          roomsModule.setActiveRoom(notification.room);
          loadMessages(notification.room);
        }
      });
      
      notificationsList.appendChild(notificationElement);
    });
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = authModule.getToken();
      
      if (!token) return;
      
      await fetch(`${API_URL}/messages/notifications/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local notifications state
      notifications = notifications.map(notification => {
        if (notification._id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      renderNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    const text = messageInput.value.trim();
    const roomId = roomsModule.getActiveRoomId();
    
    if (!text || !roomId) return;
    
    try {
      const token = authModule.getToken();
      
      if (!token) return;
      
      // Send message via Socket.io
      appModule.sendMessage(text, roomId);
      
      // Clear input
      messageInput.value = '';
      
      // Stop typing indicator
      appModule.stopTyping(roomId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };
  
  // Add message to list
  const addMessage = (message) => {
    messages.push(message);
    renderMessages();
  };
  
  // Add notification
  const addNotification = (notification) => {
    notifications.unshift(notification);
    renderNotifications();
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    const roomId = roomsModule.getActiveRoomId();
    
    if (!roomId) return;
    
    // Send typing event
    appModule.startTyping(roomId);
    
    // Reset timeout
    clearTimeout(typingTimeout);
    
    // Set new timeout
    typingTimeout = setTimeout(() => {
      appModule.stopTyping(roomId);
    }, 1000);
  };
  
  // Show typing indicator
  const showTypingIndicator = (user) => {
    // Check if indicator already exists
    let typingIndicator = document.getElementById('typing-indicator');
    
    if (!typingIndicator) {
      typingIndicator = document.createElement('div');
      typingIndicator.id = 'typing-indicator';
      typingIndicator.classList.add('typing-indicator');
      messagesContainer.appendChild(typingIndicator);
    }
    
    typingIndicator.textContent = `${user.username} is typing...`;
    typingIndicator.setAttribute('data-user', user.id);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // Hide typing indicator
  const hideTypingIndicator = (userId) => {
    const typingIndicator = document.getElementById('typing-indicator');
    
    if (typingIndicator && typingIndicator.getAttribute('data-user') === userId) {
      typingIndicator.remove();
    }
  };
  
  // Public API
  return {
    init,
    loadMessages,
    addMessage,
    addNotification,
    showTypingIndicator,
    hideTypingIndicator
  };
})();

// Initialize chat module when DOM is loaded
document.addEventListener('DOMContentLoaded', chatModule.init);
