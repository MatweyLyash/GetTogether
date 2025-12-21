'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Импортируйте ваш sequelize

// Импорт функций моделей и их инициализация
const UserModel = require('../user');
const RoleModel = require('./role');
const StatusModel = require('./status');
const OrganizerRequestModel = require('./organizerrequest');
const EventModel = require('./event');
const ReviewModel = require('./review');
const CategoryModel = require('./category');
const EventRegistrationModel = require('./eventregistration');

// Инициализация моделей
const User = UserModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const Status = StatusModel(sequelize, DataTypes);
const OrganizerRequest = OrganizerRequestModel(sequelize, DataTypes);
const Event = EventModel(sequelize, DataTypes);
const Review = ReviewModel(sequelize, DataTypes);
const Category = CategoryModel(sequelize, DataTypes);
const EventRegistration = EventRegistrationModel(sequelize, DataTypes);


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

// OrganizerRequest ↔ User
OrganizerRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(OrganizerRequest, { foreignKey: 'user_id', as: 'organizerRequests' });

// OrganizerRequest ↔ Status
OrganizerRequest.belongsTo(Status, { foreignKey: "status_id", as: "status" });
Status.hasMany(OrganizerRequest, { foreignKey: "status_id", as: "organizerRequests" });

// EventRegistration ↔ User, Event, Status
EventRegistration.belongsTo(User, { foreignKey: "user_id", as: "user" });
EventRegistration.belongsTo(Event, { foreignKey: "event_id", as: "Event" });
EventRegistration.belongsTo(Status, { foreignKey: "status_id", as: "status" });


module.exports = {Role, User, Category, Event, EventRegistration, OrganizerRequest, Review, Status}