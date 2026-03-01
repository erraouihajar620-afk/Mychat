// Authentication management
const authModule = (() => {
  // DOM elements
  const authContainer = document.getElementById('auth-container');
  const chatContainer = document.getElementById('chat-container');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const usernameDisplay = document.getElementById('username-display');
  const logoutBtn = document.getElementById('logout-btn');

  // Variables
  const API_URL = '/api';
  let currentUser = null;
  let authToken = null;

  // Initialization
  const init = () => {
    // Check if user is already logged in
    checkAuth();

    // Tab events
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    });

    // Form events
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
      authToken = token;
      currentUser = user;
      showChat();
    } else {
      showAuth();
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
      loginError.textContent = 'Please fill in all fields';
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        loginError.textContent = data.message || 'Login error';
        return;
      }
      
      // Store authentication information
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      authToken = data.token;
      currentUser = data.user;
      
      // Reset form
      loginForm.reset();
      loginError.textContent = '';
      
      // Show chat interface
      showChat();
      
      // Initialize Socket.io
      appModule.initSocket(authToken);
      
      // Load rooms
      roomsModule.loadRooms();
    } catch (error) {
      console.error('Login error:', error);
      loginError.textContent = 'Server connection error';
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
      registerError.textContent = 'Please fill in all fields';
      return;
    }
    
    if (password.length < 6) {
      registerError.textContent = 'Password must be at least 6 characters';
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        registerError.textContent = data.message || 'Registration error';
        return;
      }
      
      // Store authentication information
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      authToken = data.token;
      currentUser = data.user;
      
      // Reset form
      registerForm.reset();
      registerError.textContent = '';
      
      // Show chat interface
      showChat();
      
      // Initialize Socket.io
      appModule.initSocket(authToken);
      
      // Load rooms
      roomsModule.loadRooms();
    } catch (error) {
      console.error('Registration error:', error);
      registerError.textContent = 'Server connection error';
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Remove authentication information
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    authToken = null;
    currentUser = null;
    
    // Disconnect Socket.io
    appModule.disconnectSocket();
    
    // Show authentication interface
    showAuth();
  };

  // Show authentication interface
  const showAuth = () => {
    authContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
  };

  // Show chat interface
  const showChat = () => {
    authContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    
    // Display username
    usernameDisplay.textContent = currentUser.username;
  };

  // Get authentication token
  const getToken = () => authToken;

  // Get current user
  const getCurrentUser = () => currentUser;

  // Public API
  return {
    init,
    getToken,
    getCurrentUser
  };
})();

// Initialize authentication module when DOM is loaded
document.addEventListener('DOMContentLoaded', authModule.init);
