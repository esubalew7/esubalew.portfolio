export const ROOMS = {
  ADMIN: 'admin',
  PORTFOLIO: 'portfolio',
  VISITOR_ROOM: 'visitor_room',
};

export function joinAdminRoom(socket) {
  socket.join(ROOMS.ADMIN);
}

export function joinPortfolioRoom(socket) {
  socket.join(ROOMS.PORTFOLIO);
  socket.join(ROOMS.VISITOR_ROOM);
}

export function leaveAllRooms(socket) {
  socket.leave(ROOMS.ADMIN);
  socket.leave(ROOMS.PORTFOLIO);
  socket.leave(ROOMS.VISITOR_ROOM);
}
