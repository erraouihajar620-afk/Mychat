# MyChat - Real-time Chat Application

A modern real-time chat platform for students to communicate and collaborate.

## Features

- **User Authentication**: Secure registration and login system
- **Real-time Messaging**: Instant messaging using Socket.io
- **Chat Rooms**: Create and join topic-based chat rooms
- **Categories**: Organize rooms by subject (Math, Computer Science, Physics, etc.)
- **Notifications**: Stay updated with new message notifications
- **Online Users**: See who is currently online

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```
bash
git clone <repository-url>
cd chatmed-main
```

2. Install dependencies:
```
bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following:
```
env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mychat
JWT_SECRET=your-secret-key-here
```

4. Start the server:
```
bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3001
```

## Project Structure

```
chatmed-main/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── rooms.js
│   └── images/
├── src/
│   ├── config/
│   │   └── db.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── message.controller.js
│   │   └── room.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── message.model.js
│   │   ├── room.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── message.routes.js
│   │   └── room.routes.js
│   └── utils/
│       └── socket.utils.js
├── views/
│   └── index.html
├── server.js
├── package.json
├── README.md
└── LICENSE
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room by ID
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Messages
- `GET /api/messages/:roomId` - Get messages for a room
- `POST /api/messages` - Send a message
- `GET /api/messages/notifications` - Get notifications
- `POST /api/messages/notifications/read` - Mark notifications as read

## Socket.io Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server → Client
- `new_message` - New message received
- `notification` - New notification
- `users_online` - Online users list
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing

## License

MIT License

Copyright (c) 2024 hajar erraoui

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Note

If you want to take this project and use it for yourself, I allow that! Feel free to fork, modify, and deploy it as you wish. 

Made with ❤️ by hajar erraoui
