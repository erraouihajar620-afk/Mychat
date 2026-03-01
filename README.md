# 🚀 MyChat — Real-Time Chat Application

A full-stack real-time chat platform built for students to communicate and collaborate through subject-based chat rooms.

Built with Node.js, Express.js, MongoDB, and Socket.io.

---
---

# 📸 Screenshots

## 🔐 Authentication Page

<img width="1908" height="1194" alt="screencapture-localhost-3000-2026-03-01-22_58_11" src="https://github.com/user-attachments/assets/791dbc93-c4c7-402b-9381-366a47d0d758" />



## 💬 Chat Interface

<img width="1908" height="1194" alt="screencapture-localhost-3000-2026-03-01-22_59_08" src="https://github.com/user-attachments/assets/092e27aa-7d13-4513-8335-3d0c74bc14d1" />

## 🏫 Rooms Page

<img width="1908" height="1194" alt="screencapture-localhost-3000-2026-03-01-23_00_49" src="https://github.com/user-attachments/assets/aeb647cb-df2f-423a-95f7-f25fcc014536" />

---

# 📖 Overview

MyChat is a scalable real-time messaging application that enables secure communication between users in topic-based rooms.

The project follows an MVC architecture and demonstrates backend structuring, authentication systems, REST API design, and real-time communication.



---

# ✨ Features

## 🔐 Authentication

- User registration  
- Secure login  
- JWT-protected routes  



## 💬 Real-Time Messaging

- Instant message broadcasting  
- Typing indicators  
- Join / Leave room events  
- Online users tracking  



## 🏫 Room Management

- Create chat rooms  
- Organize rooms by subject  
- Update and delete rooms  



## 🔔 Notifications

- Unread message tracking  
- Real-time alerts  



---

# 🛠 Tech Stack

## Backend

- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- Socket.io  
- JSON Web Tokens (JWT)  



## Frontend

- HTML5  
- CSS3  
- Vanilla JavaScript  



---

# 🏗 Project Structure

```
chatmed-main/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── views/
├── server.js
├── package.json
└── README.md
```



---

# 📡 API Endpoints

## Authentication

- POST /api/auth/register  
- POST /api/auth/login  
- GET /api/auth/me  



## Rooms

- GET /api/rooms  
- POST /api/rooms  
- GET /api/rooms/:id  
- PUT /api/rooms/:id  
- DELETE /api/rooms/:id  



## Messages

- GET /api/messages/:roomId  
- POST /api/messages  
- GET /api/messages/notifications  
- POST /api/messages/notifications/read  



---

# ⚡ Socket Events

## Client → Server

- join_room  
- leave_room  
- send_message  
- typing  
- stop_typing  



## Server → Client

- new_message  
- notification  
- users_online  
- user_joined  
- user_left  
- user_typing  
- user_stop_typing  



---

# ⚙ Installation

## 1️⃣ Clone the Repository

```
git clone <repository-url>
cd chatmed-main
```

## 2️⃣ Install Dependencies

```
npm install
```

## 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mychat
JWT_SECRET=your-secret-key-here
```

## 4️⃣ Start the Server

```
npm start
```

## 5️⃣ Open in Browser

```
http://localhost:3001
```



---

# 📄 License

MIT License  

Copyright (c) 2024 Hajar Er-Raoui  



---

# 👩‍💻 Author

Hajar Er-Raoui  
Computer Science Bachelor Student  
Morocco 🇲🇦  

Made with ❤️    
