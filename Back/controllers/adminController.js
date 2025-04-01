const adminRepository = require('./../repository/adminRepository');
const AdminRepository = adminRepository.repository;


class AdminController {
    async getCategories(req, res) {
    try {
      const categories = await AdminRepository.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async addCategory(req, res) {
    try {
      const { category_name } = req.body;
      if (!category_name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      await AdminRepository.addCategory({ category_name });
      res.status(201).json({ message: 'Category added successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async renameCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { category_name } = req.body;
      if (!category_name) {
        return res.status(400).json({ error: 'New category name is required' });
      }
      await AdminRepository.renameCategory(category_id, category_name);
      res.status(200).json({ message: 'Category renamed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async deleteCategory(req, res) {
    try {
      const { category_id } = req.params;
      await AdminRepository.deleteCategory(category_id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async getUsers(req, res) {
    try {
      const users = await AdminRepository.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async userBan(req, res) {
    try {
      const { user_id } = req.params;
      const { isBan } = req.body;
      await AdminRepository.userBan(user_id, isBan);
      res.status(200).json({ message: 'User ban status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

     async organizerResponse(req, res) {
    try {
      const { request_id } = req.params;
      const { status_id } = req.body;
      await AdminRepository.organizerResponse(request_id, status_id);
      res.status(200).json({ message: 'Organizer request status updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async unassignOrganizer(req, res) {
    try {
      const { user_id } = req.params;
      await AdminRepository.unassignOrganizer(user_id);
      res.status(200).json({ message: 'User role updated to organizer' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

    async getEvents(req, res) {
    try {
      const events = await AdminRepository.getEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports.controller = new AdminController();
