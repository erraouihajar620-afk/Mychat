// Room management
const roomsModule = (() => {
  // DOM elements
  const roomsList = document.getElementById('rooms-list');
  const createRoomBtn = document.getElementById('create-room-btn');
  const createRoomModal = document.getElementById('create-room-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const createRoomForm = document.getElementById('create-room-form');
  
  // Variables
  const API_URL = '/api';
  let rooms = [];
  let activeRoomId = null;
  
  // Initialization
  const init = () => {
    // Events
    createRoomBtn.addEventListener('click', showCreateRoomModal);
    closeModalBtn.addEventListener('click', hideCreateRoomModal);
    createRoomForm.addEventListener('submit', handleCreateRoom);
    
    // Close modal if clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === createRoomModal) {
        hideCreateRoomModal();
      }
    });
  };
  
  // Load rooms
  const loadRooms = async () => {
    try {
      const token = authModule.getToken();
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error loading rooms:', data.message);
        return;
      }
      
      rooms = data.rooms;
      renderRooms();
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };
  
  // Render rooms
  const renderRooms = () => {
    roomsList.innerHTML = '';
    
    if (rooms.length === 0) {
      roomsList.innerHTML = '<p>No rooms available</p>';
      return;
    }
    
    rooms.forEach(room => {
      const roomElement = document.createElement('div');
      roomElement.classList.add('room-item');
      
      if (activeRoomId === room._id) {
        roomElement.classList.add('active');
      }
      
      roomElement.innerHTML = `
        <h4>${room.name}</h4>
        <p>${room.category}</p>
      `;
      
      roomElement.addEventListener('click', () => {
        setActiveRoom(room._id);
        chatModule.loadMessages(room._id);
      });
      
      roomsList.appendChild(roomElement);
    });
  };
  
  // Set active room
  const setActiveRoom = (roomId) => {
    activeRoomId = roomId;
    
    // Update room display
    const roomItems = document.querySelectorAll('.room-item');
    roomItems.forEach(item => {
      item.classList.remove('active');
    });
    
    const activeRoom = rooms.find(room => room._id === roomId);
    
    if (activeRoom) {
      // Update chat interface
      document.getElementById('welcome-message').classList.add('hidden');
      document.getElementById('active-chat').classList.remove('hidden');
      document.getElementById('active-room-name').textContent = activeRoom.name;
      document.getElementById('active-room-description').textContent = activeRoom.description;
      
      // Join room via Socket.io
      appModule.joinRoom(roomId);
      
      // Highlight active room in list
      const roomItems = document.querySelectorAll('.room-item');
      roomItems.forEach(item => {
        if (item.querySelector('h4').textContent === activeRoom.name) {
          item.classList.add('active');
        }
      });
    }
  };
  
  // Show create room modal
  const showCreateRoomModal = () => {
    createRoomModal.classList.remove('hidden');
  };
  
  // Hide create room modal
  const hideCreateRoomModal = () => {
    createRoomModal.classList.add('hidden');
    createRoomForm.reset();
  };
  
  // Handle room creation
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('room-name').value;
    const description = document.getElementById('room-description').value;
    const category = document.getElementById('room-category').value;
    
    if (!name || !description || !category) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const token = authModule.getToken();
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, category })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || 'Error creating room');
        return;
      }
      
      // Add new room to list
      rooms.push(data.room);
      renderRooms();
      
      // Close modal
      hideCreateRoomModal();
      
      // Activate new room
      setActiveRoom(data.room._id);
      chatModule.loadMessages(data.room._id);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room');
    }
  };
  
  // Get active room
  const getActiveRoom = () => {
    return rooms.find(room => room._id === activeRoomId);
  };
  
  // Get active room ID
  const getActiveRoomId = () => activeRoomId;
  
  // Public API
  return {
    init,
    loadRooms,
    getActiveRoom,
    getActiveRoomId,
    setActiveRoom
  };
})();

// Initialize rooms module when DOM is loaded
document.addEventListener('DOMContentLoaded', roomsModule.init);
