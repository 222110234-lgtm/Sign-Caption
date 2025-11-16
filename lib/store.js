export const rooms = new Map();

export function ensureRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { participants: new Map() });
  }
  return rooms.get(roomId);
}

export function publicRoomSnapshot(roomId) {
  const room = rooms.get(roomId);
  if (!room) return { roomId, participants: [] };
  return {
    roomId,
    participants: Array.from(room.participants.values()).map(p => ({
      name: p.name,
      email: p.email,
      joinedAt: p.joinedAt
    }))
  };
}

export function removeSocketEverywhere(socketId, onLeave) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.participants.has(socketId)) {
      const user = room.participants.get(socketId);
      room.participants.delete(socketId);
      onLeave?.(roomId, user?.name);
      if (room.participants.size === 0) rooms.delete(roomId);
    }
  }
}