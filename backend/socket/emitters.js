import { getIO } from './index.js';
import { ROOMS } from './rooms.js';

function emitToAll(event, data) {
  getIO().emit(event, data);
}

function emitToAdmin(event, data) {
  getIO().to(ROOMS.ADMIN).emit(event, data);
}

function emitToPortfolio(event, data) {
  getIO().to(ROOMS.PORTFOLIO).emit(event, data);
}

export function emitProjectCreated(project) {
  emitToAll('project:create', project);
}

export function emitProjectUpdated(project) {
  emitToAll('project:update', project);
}

export function emitProjectDeleted(id) {
  emitToAll('project:delete', { id });
}

export function emitContentSectionUpdated(section, data) {
  const event = `content:${section}:update`;
  emitToAll(event, { section, data });
  emitToAll('content:update', { section, data });
  emitToAll('content_updated', { section, data });
  getIO().to(ROOMS.PORTFOLIO).emit('content_updated', { section, data });
  getIO().to(ROOMS.VISITOR_ROOM).emit('content_updated', { section, data });
}

export function emitMessageNew(message) {
  emitToAdmin('message:new', message);
}

export function emitVisitorNew(visitor) {
  emitToAdmin('visitor:new', visitor);
}

export function emitVisitorCountUpdate(count) {
  getIO().emit('visitor:count_update', { count });
  getIO().to(ROOMS.PORTFOLIO).emit('visitor:count_update', { count });
  getIO().to(ROOMS.VISITOR_ROOM).emit('visitor:count_update', { count });
}

export function emitAnalyticsUpdate(data) {
  emitToAdmin('analytics:update', data);
}

export function emitNotification(notification) {
  emitToAdmin('notification', notification);
}

export function emitNotificationCreated(notification) {
  emitToAdmin('notification:new', notification);
}

export function emitProfileUpdate(user) {
  emitToAdmin('profile:update', {
    id: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
    avatar: user.profileImage,
    twoFactorEnabled: user.twoFactorEnabled,
    updatedAt: user.updatedAt,
  });
}
