import {OAuth2Client} from 'google-auth-library';
import fp from 'fastify-plugin';

const client = new OAuth2Client();


async function authGoogle(fastify, options)
{
    const authHelper = {
       
        async verifyGoogleToken(token){
            const client_id = "632484486903-vm1hfg66enqfkffsmlhih0au506obuch.apps.googleusercontent.com"
            const ticket = await client.verifyIdToken({ idToken: token, audience: client_id});
            const payload = ticket.getPayload();
            return {
                googleId: payload.sub,
                email: payload.email,
                fullname: payload.name,
                firstName: payload.given_name,
                lastName: payload.family_name,
                picture: payload.picture
            }
        }
        
    };
    fastify.decorate('auth', authHelper);


    fastify.post('/auth/google', async(request, reply) =>
    {
        try
        {
            const {token} = request.body;
            const userInfo = await authHelper.verifyGoogleToken(token);            
            const user = await fastify.db.findOrAddUser(userInfo.googleId, userInfo.email, null, userInfo.firstName, userInfo.lastName, userInfo.picture);
            if (user)
            {
                reply.send(user);
            }
            else
                reply.status(401).send({success : false, message : "Couldn't create or retreive user"})
        }
        catch(err)
        {
            reply.status(401).send({ success: false, message: "Token Google invalide" });
        }
    })
}

export default fp(authGoogle);