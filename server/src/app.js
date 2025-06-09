const Fastify = require('fastify');
const app = Fastify({ logger: true });
const db = require("./config/db")

app.decorate('db', db);
app.register(require('./routes/userRoutes'));
module.exports = app
