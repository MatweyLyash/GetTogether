const models = require('../../models');

const cleanDB = async () => {
    // Delete in order of dependencies to avoid FK constraint errors
    await models.PushSubscription.destroy({ where: {}, force: true });
    await models.EventRegistration.destroy({ where: {}, force: true });
    await models.EventSubscription.destroy({ where: {}, force: true });
    await models.UserAchievement.destroy({ where: {}, force: true });
    await models.Review.destroy({ where: {}, force: true });
    await models.EventTag.destroy({ where: {}, force: true });
    await models.Event.destroy({ where: {}, force: true });
    await models.OrganizerRequest.destroy({ where: {}, force: true });
    await models.User.destroy({ where: {}, force: true });
    await models.Category.destroy({ where: {}, force: true });
    await models.Tag.destroy({ where: {}, force: true });
};

module.exports = cleanDB;
