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
            await db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, username TEXT UNIQUE, google_id TEXT UNIQUE, first_name TEXT, last_name TEXT, picture TEXT)');
        },
        
        async registerUser(email, password, username)
        {
            let user = null;

            if(email && password && username)
            {
                user = await fastify.utilsDb.checkEmail(email);
                if(user)
                    throw new Error("Mail already taken");
                user = await fastify.utilsDb.checkUsername(username);
                if (user)
                    throw new Error("Username already taken");
                const newpass = await bcrypt.hash(password, saltRounds);
                await db.run('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', email, newpass, username);
                user = await db.get('SELECT * FROM users WHERE email = ?', email);
                return (user); 
            }
            else
                throw new Error("Not enough data to create user");
        },

        async loginUser(email, password)
        {
            let user = null;
            user = await db.get('SELECT * FROM users WHERE email = ?', email);
            if (!user)
            {
                console.log("ZABORMOK");
                throw new Error('Wrong mail or password');
            }
            const valid = bcrypt.compare(password, user.password);
            if (!valid)
            {
                console.log("ZABORMOK2");
                throw new Error('Wrong mail or password');
            }
            return user;
        },

        async changePassword(email, password)
        {
            let user = await db.get('SELECT password FROM users WHERE email = ?', email);
            if (user)
            {
                const newpass = await bcrypt.hash(password, saltRounds);
                user = await db.run('UPDATE users SET password = ? WHERE email = ?', newpass, email);
            }
            else
                throw new Error ("Email doesn't exist");
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