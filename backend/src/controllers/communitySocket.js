const db = require('../config/db');

function handleCommunitySocket(io, socket) {
  // Join a specific Community Room (Chat/Voice/Video channel)
  socket.on('community-join-room', async ({ roomId, userId, username }) => {
    socket.join(`community-room-${roomId}`);
    console.log(`User ${username} (${userId}) joined community room ${roomId}`);
    
    // Broadcast join state to others in room
    socket.to(`community-room-${roomId}`).emit('community-user-joined', {
      userId,
      username,
      socketId: socket.id
    });
  });

  // Leave a specific Community Room
  socket.on('community-leave-room', ({ roomId, userId, username }) => {
    socket.leave(`community-room-${roomId}`);
    console.log(`User ${username} (${userId}) left community room ${roomId}`);
    
    socket.to(`community-room-${roomId}`).emit('community-user-left', {
      userId,
      username,
      socketId: socket.id
    });
  });

  // Typing indicators
  socket.on('community-typing', ({ roomId, username, isTyping }) => {
    socket.to(`community-room-${roomId}`).emit('community-remote-typing', {
      username,
      isTyping
    });
  });

  // Real-time message events (when messages are sent via HTTP or directly via Socket)
  socket.on('community-send-message', ({ roomId, message }) => {
    socket.to(`community-room-${roomId}`).emit('community-receive-message', message);
  });

  // Reactions syncing
  socket.on('community-reaction', ({ roomId, messageId, reactions }) => {
    socket.to(`community-room-${roomId}`).emit('community-remote-reaction', {
      messageId,
      reactions
    });
  });

  // WebRTC P2P Call Signaling Relays
  socket.on('call-webrtc-offer', ({ roomId, offer, toSocketId, senderName, senderId }) => {
    if (toSocketId) {
      io.to(toSocketId).emit('call-webrtc-offer-received', {
        offer,
        fromSocketId: socket.id,
        senderName,
        senderId
      });
    } else {
      socket.to(`community-room-${roomId}`).emit('call-webrtc-offer-received', {
        offer,
        fromSocketId: socket.id,
        senderName,
        senderId
      });
    }
  });

  socket.on('call-webrtc-answer', ({ roomId, answer, toSocketId }) => {
    io.to(toSocketId).emit('call-webrtc-answer-received', {
      answer,
      fromSocketId: socket.id
    });
  });

  socket.on('call-webrtc-candidate', ({ roomId, candidate, toSocketId }) => {
    io.to(toSocketId).emit('call-webrtc-candidate-received', {
      candidate,
      fromSocketId: socket.id
    });
  });

  // Call status updates (raising hand, mic/camera toggles)
  socket.on('call-status-update', ({ roomId, userId, micOn, cameraOn, handRaised }) => {
    socket.to(`community-room-${roomId}`).emit('call-remote-status-update', {
      userId,
      micOn,
      cameraOn,
      handRaised
    });
  });

  // Real-time Live Captions / Transcription Stream
  socket.on('voice-caption-stream', ({ roomId, username, text, isFinal }) => {
    socket.to(`community-room-${roomId}`).emit('voice-caption-received', {
      username,
      text,
      isFinal,
      timestamp: new Date()
    });
  });

  // Whiteboard drawing synchronization
  socket.on('whiteboard-draw', ({ roomId, elements }) => {
    socket.to(`community-room-${roomId}`).emit('whiteboard-remote-draw', elements);
  });

  // Collaborative Monaco Code Editor synchronization
  socket.on('code-editor-sync', ({ roomId, code, language, cursorInfo }) => {
    socket.to(`community-room-${roomId}`).emit('code-editor-remote-sync', {
      code,
      language,
      cursorInfo,
      socketId: socket.id
    });
  });

  // Collaborative notes synchronization
  socket.on('notes-doc-sync', ({ roomId, content }) => {
    socket.to(`community-room-${roomId}`).emit('notes-doc-remote-sync', {
      content
    });
  });

  // Active Poll updates
  socket.on('poll-vote-update', ({ roomId, messageId, pollOptions }) => {
    socket.to(`community-room-${roomId}`).emit('poll-remote-vote-update', {
      messageId,
      pollOptions
    });
  });
}

module.exports = { handleCommunitySocket };
