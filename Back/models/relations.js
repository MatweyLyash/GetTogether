'use strict';

module.exports = (db) => {
  const { User, Role, Status, OrganizerRequest, Event, Review, Category, EventRegistration } = db;

  // User ↔ Role
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

  // Category ↔ Event
  Category.hasMany(Event, { foreignKey: 'category_id', as: 'events' });
  Event.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Event ↔ User (создатель мероприятия)
  Event.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
  User.hasMany(Event, { foreignKey: 'creator_id', as: 'createdEvents' });

  // Review ↔ Event
  Review.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
  Event.hasMany(Review, { foreignKey: 'event_id', as: 'reviews' });

  // Review ↔ User
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'reviewUser', onDelete: 'CASCADE' });
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

  // OrganizerRequest ↔ User
  OrganizerRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(OrganizerRequest, { foreignKey: 'user_id', as: 'organizerRequests' });

  // OrganizerRequest ↔ Status
  OrganizerRequest.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
  Status.hasMany(OrganizerRequest, { foreignKey: 'status_id', as: 'organizerRequests' });

  // EventRegistration ↔ User, Event, Status
  EventRegistration.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  EventRegistration.belongsTo(Event, { foreignKey: 'event_id', as: 'Event' });
  EventRegistration.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
  User.hasMany(EventRegistration, { foreignKey: 'user_id', as: 'eventRegistrations' });
  Event.hasMany(EventRegistration, { foreignKey: 'event_id', as: 'registrations' });
  Status.hasMany(EventRegistration, { foreignKey: 'status_id', as: 'eventRegistrations' });
};