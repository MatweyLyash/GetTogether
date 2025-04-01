const User = require('./User');
const Role = require('./Role');
const Status = require('./Status');
const OrganizerRequest = require('./OrganizerRequest');
const Feedback = require('./Feedback');
const Event = require('./Event');
const Review = require('./Review');
const Category = require('./Category')
const EventRegistration = require('./EventRegistraion')


// User ↔ Role
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// Category ↔ Event
Category.hasMany(Event, { foreignKey: "category_id", as: "events" });
Event.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Event ↔ User (создатель мероприятия)
Event.belongsTo(User, { foreignKey: "creator_id", as: "creator" });
User.hasMany(Event, { foreignKey: "creator_id", as: "createdEvents" });

// Review ↔ Event
Review.belongsTo(Event, { foreignKey: "event_id", as: "event" });
Event.hasMany(Review, { foreignKey: "event_id", as: "reviews" });

// Review ↔ User
Review.belongsTo(User, { foreignKey: "user_id", as: "reviewUser" });
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });

// Feedback ↔ User
Feedback.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Feedback, { foreignKey: "user_id", as: "feedbacks" });

// OrganizerRequest ↔ Status
OrganizerRequest.belongsTo(Status, { foreignKey: "status_id", as: "status" });
Status.hasMany(OrganizerRequest, { foreignKey: "status_id", as: "organizerRequests" });

// EventRegistration ↔ User, Event, Status
EventRegistration.belongsTo(User, { foreignKey: "user_id", as: "user" });
EventRegistration.belongsTo(Event, { foreignKey: "event_id", as: "event" });
EventRegistration.belongsTo(Status, { foreignKey: "status_id", as: "status" });

module.exports = {Role, User, Category, Event, EventRegistration, OrganizerRequest, Review, Feedback, Status}