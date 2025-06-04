import { createUser, getAllUsers } from "../db/db.js";

export default function userRoutes(fastify, options, done)
{
    fastify.get('/user', async (request, reply) => {
        const data = await getAllUsers();
        return data;
    });
    
    fastify.post('/user', async (request, reply) => {
        const {nickname, password} = request.body;
        const user = await createUser(nickname, password);
        return user;
    });

    done();
}