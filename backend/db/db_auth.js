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

    const dbHelper = {

        connection : db,

        async createTable()
        {
            await db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, username TEXT UNIQUE, google_id TEXT UNIQUE, is_2fa_activated BOOLEAN, status BOOLEAN, picture TEXT)');
        },
        
        async registerUser(google_id, email, password, username, picture)
        {
            let user = null;
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
                await db.run('INSERT INTO users (email, password, username, picture) VALUES (?, ?, ?, ?)', email, newpass, username, "default.png");
                user = await db.get('SELECT * FROM users WHERE email = ?', email);
                return (user); 
            }
            else
                throw new Error("Not enough data to create user");
        },

        async loginUser(email, password)
        {
            let user = null;
            console.log("Login attempt with email:", email);
            user = await db.get('SELECT * FROM users WHERE email = ?', email);
            console.log("User found:", user);
            if (!user)
            {
                console.log("ZABORMOK");
                throw new Error('Wrong mail or password');
            }
            const valid = await bcrypt.compare(password, user.password);
            if (!valid)
            {
                console.log("ZABORMOK2");
                throw new Error('Wrong mail or password');
            }
            return user;
        },

        async showTableUsers()
        {
            const users = await db.all('SELECT * FROM users;');
            return users;
        }
    };
    fastify.decorate('db', dbHelper);
    await dbHelper.createTable();
}
export default fp(dbFunction);