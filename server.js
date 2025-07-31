const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample texts for typing tests
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. Pangrams are often used to display font samples and test keyboards.",
  "Programming is the art of telling another human being what one wants the computer to do. It requires logical thinking and creative problem-solving skills.",
  "The internet is a global system of interconnected computer networks that use the standard Internet protocol suite to link devices worldwide.",
  "Artificial intelligence is the simulation of human intelligence in machines that are programmed to think and learn like humans.",
  "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. It is a language that is also characterized as dynamic, weakly typed, prototype-based and multi-paradigm."
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/texts', (req, res) => {
  res.json(sampleTexts);
});

app.get('/api/text/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < sampleTexts.length) {
    res.json({ text: sampleTexts[id] });
  } else {
    res.status(404).json({ error: 'Text not found' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('startTest', (data) => {
    socket.broadcast.emit('userStartedTest', { userId: socket.id });
  });

  socket.on('typingProgress', (data) => {
    socket.broadcast.emit('userTypingProgress', {
      userId: socket.id,
      progress: data.progress,
      wpm: data.wpm,
      accuracy: data.accuracy
    });
  });

  socket.on('testComplete', (data) => {
    socket.broadcast.emit('userTestComplete', {
      userId: socket.id,
      results: data.results
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to start typing!`);
}); 