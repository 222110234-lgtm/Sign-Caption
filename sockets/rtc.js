import { ensureRoom, removeSocketEverywhere, publicRoomSnapshot, rooms } from '../lib/store.js';

export default function registerRTCNamespace(io) {
  const rtc = io.of('/rtc');

  rtc.on('connection', (socket) => {
    socket.on('join', ({ roomId, name = 'Guest', email = '' } = {}) => {
      if (!roomId || typeof roomId !== 'string') return;
      socket.join(roomId);

      const room = ensureRoom(roomId);
      room.participants.set(socket.id, { name, email, joinedAt: Date.now() });

      socket.to(roomId).emit('presence:join', { name, email });
      socket.emit('room:state', publicRoomSnapshot(roomId));
    });

    socket.on('leave', ({ roomId } = {}) => {
      if (!roomId) return;
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        const user = room.participants.get(socket.id);
        room.participants.delete(socket.id);
        socket.to(roomId).emit('presence:leave', { name: user?.name });
        if (room.participants.size === 0) rooms.delete(roomId);
      }
    });

    socket.on('signal:offer',  ({ roomId, offer, from }) => socket.to(roomId).emit('signal:offer',  { offer, from }));
    socket.on('signal:answer', ({ roomId, answer, from }) => socket.to(roomId).emit('signal:answer', { answer, from }));
    socket.on('signal:ice',    ({ roomId, candidate, from }) => socket.to(roomId).emit('signal:ice',   { candidate, from }));

    socket.on('chat:message', ({ roomId, text, sender = 'Guest' } = {}) => {
      if (!roomId || !text) return;
      rtc.to(roomId).emit('chat:message', { text, sender, time: new Date().toISOString() });
    });

    socket.on('caption:update', ({ roomId, text, lang = 'en' } = {}) => {
      if (!roomId || typeof text !== 'string') return;
      socket.to(roomId).emit('caption:update', { text, lang });
    });

    socket.on('chat:typing', ({ roomId, sender, typing } = {}) => {
      if (!roomId) return;
      socket.to(roomId).emit('chat:typing', { sender, typing: !!typing });
    });

    socket.on('disconnect', () => {
      removeSocketEverywhere(socket.id, (roomId, name) => {
        socket.to(roomId).emit('presence:leave', { name });
      });
    });
  });
}