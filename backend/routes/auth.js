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
        },

        async createJWTtoken(user)
        {
            const token = fastify.jwt.sign({
                sub : user.id,
                email : user.email,
                firstName : user.first_name,
                iat : Math.floor(Date.now() / 1000),
                exp : Math.floor(Date.now() / 1000) + (60 * 60)
            });
            return token;
        },

        async verifyJWT(request, reply)
        {
            try
            {
                await request.jwtVerify();
            }
            catch(err)
            {
                reply.code(401).send({ success: false, message : "Token invalide ou manquant"});
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
                const jwt = await fastify.auth.createJWTtoken(user);
                reply.send({user, jwt});
            }
            else
                reply.status(401).send({success : false, message : "Couldn't create or retrieve user"})
        }
        catch(err)
        {
            reply.status(401).send({ success: false, message: "Token Google invalide" });
        }
    })

    fastify.post('/auth/login', async(request, reply) =>
    {
        try
        {
            const {email, password, username} = request.body;
            const user = await fastify.db.loginUser(email, password, username);
            if(!user)
                reply.status(401).send({success : false, message : "Couldn't find user"});
            return user;
        }
        catch (err)
        {
            reply.status(401).send({success : false, message : err.message, touch : "Zabormok"});
        }

    })

    fastify.post('/auth/register', async(request, reply) => {

        try
        {
            const {email, password, username} = request.body;
            const user = await fastify.db.registerUser(email, password, username)
            if (user)
            {
                const jwt = await fastify.auth.createJWTtoken(user);
                reply.send({jwt, user});
            }
            else
            {
                reply.status(401).send({ success : false, message : "Couldn't authenticate user"});
            }
        }
        catch (err)
        {
            reply.status(401).send({success : false, message : err.message});
        }

    })

    fastify.patch('/auth/reset-password', async (request, reply) =>
    {
        try
        {
            const {email, password} = request.body;
            await fastify.db.changePassword(email, password);
            reply.send({success : true, message : "Password changed"});
        }
        catch (err)
        {
            reply.status(401).send({success : false, message : err.message});
        }
    })

    fastify.patch('/auth/change-password', async (request, reply) =>
    {
        try
        {
            const {email, password} = request.body;
            await fastify.db.changePassword(email, password);
            reply.send({success : true, message : "Password changed"});
        }
        catch (err)
        {
            reply.status(401).send({success : false, message : err.message});
        }
    })
}

export default fp(authGoogle);