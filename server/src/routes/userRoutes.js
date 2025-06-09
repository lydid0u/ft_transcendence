const userController = require('../controllers/userController');
async function userRoutes(fastify, opts) {
  fastify.post('/users', userController.postUsers);
  fastify.get("/users", userController.getUsers)
}

module.exports = userRoutes;
