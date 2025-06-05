import { createUser, getAllUsers } from "../db/db.js";
import {OAuth2Client} from 'google-auth-library';

const client = new OAuth2Client();


export default function authGoogle(fastify, options, done)
{
    fastify.post('/auth/google', async(request, reply) =>
    {
        try
        {
            const client_id = "632484486903-vm1hfg66enqfkffsmlhih0au506obuch.apps.googleusercontent.com"
            const {token} = request.body;
            const ticket = await client.verifyIdToken({ idToken: token, audience: client_id});
            const payload = ticket.getPayload();
            
            const googleId = payload.sub;
            const email = payload.email;
            const fullname = payload.name;
            const firstName = payload.given_name;
            const lastName = payload.family_name;
            const picture = payload.picture;

            reply.send({ user: { googleId, fullname, firstName, lastName, email, picture } });
        }
        catch(err)
        {
            reply.status(401).send({ success: false, message: "Token Google invalide" });
        }
    })
    done();
}