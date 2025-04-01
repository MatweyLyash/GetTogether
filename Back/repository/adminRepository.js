const models = require('./../models/relations');

class AdminRepository {
    
    async getCategories() {
        return await models.Category.findAll();
    }
    async addCategory(category_name) {
        await models.Category.create(category_name, { returning: true });
    }
    async renameCategory(category_id, category_name) {
        await models.Category.update({category_name:category_name}, {where:{id:category_id}})
    }
    async deleteCategory(category_id) {
        await models.Category.destroy({where:{id:category_id}})
    }
    async getUsers() {
        return await models.User.findAll();
    }
    async userBan(user_id, isBan) {
        await models.User.update({is_blocked:isBan}, {where:{id:user_id}})
    }

    async organizerResponse(request_id, status_id) {
        await models.OrganizerRequest.update({status:status_id}, {where:{id:request_id}})
    }

    async unassignOrganizer(user_id) {
        await models.User.update({role_id:1}, {where:{id:user_id}})
    }
    

    async getEvents () {
        await models.Event.findAll()
    }

}

module.exports.repository = new AdminRepository();