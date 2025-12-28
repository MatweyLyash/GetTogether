const models = require('../../models');

const seedReferenceData = async () => {
    try {
        // 1. Создаем Роли (используем update для надежности)
        const roles = [
            { id: 1, role_name: 'user' },
            { id: 2, role_name: 'organizer' },
            { id: 3, role_name: 'admin' }
        ];

        for (const role of roles) {
            const [record, created] = await models.Role.findOrCreate({
                where: { id: role.id },
                defaults: role
            });
            // Если запись существовала, но с другим именем (редко, но бывает), обновим
            if (!created && record.role_name !== role.role_name) {
                await record.update({ role_name: role.role_name });
            }
        }

        // 2. Создаем Статусы
        const statuses = [
            { id: 1, status_name: 'pending' },
            { id: 2, status_name: 'approved' },
            { id: 3, status_name: 'rejected' }
        ];

        for (const status of statuses) {
             const [record, created] = await models.Status.findOrCreate({
                where: { id: status.id },
                defaults: status
            });
            if (!created && record.status_name !== status.status_name) {
                await record.update({ status_name: status.status_name });
            }
        }
    } catch (e) {
        console.error("SEEDING ERROR:", e);
    }
};

module.exports = seedReferenceData;