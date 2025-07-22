import fp from 'fastify-plugin';
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const saltRounds = 10;

async function dbFunctionPatch(fastify, options)
{
    const dbPatch = {

        async changePassword(email, currpass, newpassword)
        {            
            let user = await fastify.db.connection.get('SELECT password FROM users WHERE email = ?', email);
            if (!user)
                throw new Error ("Email doesn't exist");
            const check = await bcrypt.compare(currpass, user.password);
            if (!check)
                throw new Error ("Wrong password");
            if (check)
            {
                const newpass = await bcrypt.hash(newpassword, saltRounds);
                user = await fastify.db.connection.run('UPDATE users SET password = ? WHERE email = ?', newpass, email);
            }
            else
                throw new Error ("Email doesn't exist");
        },

        async changePassword(email, password)
        {            
            let user = await fastify.db.connection.get('SELECT password FROM users WHERE email = ?', email);
            if (user)
            {
                const newpass = await bcrypt.hash(password, saltRounds);
                user = await fastify.db.connection.run('UPDATE users SET password = ? WHERE email = ?', newpass, email);
            }
            else
                throw new Error ("Email doesn't exist");
        },

        async addOrChangeAvatar(requestOrEmail, def)
        {
            if (def)
            {
                const defaultAvatarPath = path.join(__dirname, '..', 'avatar', 'default.png');
                const defaultAvatar = await fs.promises.readFile(defaultAvatarPath);
                const dataUrl = `data:image/png;base64,${defaultAvatar.toString('base64')}`;
                // await fastify.db.connection.run('UPDATE users SET picture = ? WHERE email = ?', dataUrl, requestOrEmail);
                return dataUrl; 
            }
            const file = await requestOrEmail.file()
            if (!file.mimetype.startsWith('image/')) {
                throw new Error("Le fichier doit être une image.");
            }
            const avatar = await file.toBuffer() // ca throw si limage est trop grande pcq index.js
            if(!avatar)
                throw new Error("Couldn't find avatar");
            const user = await fastify.db.connection.get('SELECT * FROM users  WHERE email = ?', requestOrEmail.user.email)
            if (user.picture) {
                const oldAvatarPath = path.join(process.cwd(), 'avatar', user.picture);
                try {
                    await fs.promises.unlink(oldAvatarPath);
                } catch (err) {
                    console.error("Erreur lors de la suppression de l'ancien avatar :", err);
                    // Ignore si le fichier n'existe pas
                }
            }
            const dataUrl = `data:${file.mimetype};base64,${avatar.toString('base64')}`;
            const avatarPath = path.join(__dirname, '..', 'avatar', file.filename);
            console.log("avatarPath", avatarPath);
            await fs.promises.writeFile(avatarPath, avatar);
            await fastify.db.connection.run('UPDATE users SET picture = ? WHERE email = ?', dataUrl, requestOrEmail.user.email);
        },

        async changeUsername(newusername, email)
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE username = ?', newusername);
            if (user)
                throw new Error ("username already exist");
            await fastify.db.connection.run ('UPDATE users SET username = ? WHERE email = ?', newusername, email)
        },

        async addUsernameGoogle(google_id, username)
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE google_id = ?', google_id);
            if (!user)
                throw new Error ("Google user doesn't exist");
            if (!user.username)
                await fastify.db.connection.run('UPDATE users SET username = ? WHERE google_id = ?', username, google_id);
            const jwt = await fastify.auth.createJWTtoken(user);
            return { user, jwt };
        },

        async activate2FA(email, isActivate) 
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE email = ?', email);
            if (!user)
                throw new Error("User not found");
            await fastify.db.connection.run('UPDATE users SET is_2fa_activated = ? WHERE email = ?', isActivate, email);
            console.log("activate2FA called for user:", email, "isActivate:", user.is_2fa_activated);
            return { success: true, message: "2FA status updated successfully" };
        },

        async changeOnlineStatus(email, isOnline)
        {
            const user = await fastify.db.connection.get('SELECT * FROM users WHERE email = ?', email);
            if (!user)
                throw new Error("User not found");
            await fastify.db.connection.run('UPDATE users SET status = ? WHERE email = ?', isOnline, email);
        }

    }
    fastify.decorate('dbPatch', dbPatch);
}
export default fp(dbFunctionPatch);