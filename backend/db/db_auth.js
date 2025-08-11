import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fp from 'fastify-plugin';
import bcrypt from 'bcrypt';

const saltRounds = 10;

async function dbFunction(fastify, options)
{
    const db = await open({
            filename : './database.db',
            driver : sqlite3.Database
    });
    if (!db) throw new Error('Failed to connect to the database');
    const dbHelper = {

        connection : db,

        async createTable()
        {
            try
            {
                await db.run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, username TEXT UNIQUE, google_id TEXT UNIQUE, is_2fa_activated BOOLEAN, status BOOLEAN, picture TEXT, language TEXT DEFAULT 'fr')`);
            } catch (error) {
                console.error('Error creating table:', error);
            }
        },
        
        async registerUser(google_id, email, password, username, picture)
        {
            let user = null;
            try
            {
                if(google_id)
                {
                    user = await db.get('SELECT * FROM users WHERE google_id = ?', google_id);
                    if(user)
                        return (user);
                    await db.run('INSERT INTO users (google_id, email, username, picture) VALUES (?, ?, ?, ?)', google_id, email, username, picture);
                    user = await db.get('SELECT * FROM users WHERE google_id = ?', google_id);
                    return (user);
                }
    
                if(email && password && username)
                {
                    user = await fastify.utilsDb.checkEmail(email);
                    if(user)
                        throw new Error("Mail already taken");
                    user = await fastify.utilsDb.checkUsername(username);
                    if (user)
                        throw new Error("Username already taken");
                    const newpass = await bcrypt.hash(password, saltRounds);
                    const avatar = await fastify.dbPatch.addOrChangeAvatar(email, true);
                    await db.run('INSERT INTO users (email, password, username, picture) VALUES (?, ?, ?, ?)', email, newpass, username, avatar);
                    user = await db.get('SELECT * FROM users WHERE email = ?', email);
                    return (user); 
                }
                else
                    throw new Error("Not enough data to create user");
            }
            catch(error)
            {
                console.error('Error registering user:', error);
                throw new Error(error.message);
            }
        },

        async loginUser(email, password)
        {
            let user = null;
            try
            {
                user = await db.get('SELECT * FROM users WHERE email = ?', email);
                if (!user)
                {
                    throw new Error('Wrong mail or password');
                }
                const valid = await bcrypt.compare(password, user.password);
                if (!valid)
                {
                    throw new Error('Wrong mail or password');
                }
                return user;
            }
            catch (error)
            {
                console.error('Error logging in user:', error);
                throw new Error('Failed to log in user');
            }
        },

        // async showTableUsers()
        // {
        //     const users = await db.all('SELECT * FROM users;');
        //     return users;
        // }
    };
    fastify.decorate('db', dbHelper);
    await dbHelper.createTable();
}
export default fp(dbFunction);