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
            await db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, google_id TEXT UNIQUE, first_name TEXT, last_name TEXT, picture TEXT)');
        },
    
        async findOrAddUser(google_id, email, password, first_name, last_name, picture)
        {
            let user = null;
        
            if (google_id)
            {
                user = await db.get('SELECT * FROM users WHERE google_id = ?', google_id);
                if (!user)
                {
                    await db.run('INSERT INTO users (google_id, email, first_name, last_name, picture) VALUES (?, ?, ?, ?, ?)',
                    google_id, email, first_name, last_name, picture);
                    user = await db.get('SELECT * FROM users WHERE google_id = ?', google_id);
                }
            }
            else if (email && password)
            {
                const newpass = await bcrypt.hash(password, saltRounds);
                user = await db.get ('SELECT * FROM users WHERE email = ?', email);
                if (!user)
                {
                    await db.run('INSERT INTO users (email, password) VALUES (?, ?)', email, newpass);
                    user = await db.get('SELECT * FROM users WHERE email = ?', email);
                }
                else
                {
                    const valid = await bcrypt.compare(password, user.password);
                    if(!valid)
                        throw new Error ('Wrong password');
                }
            }
            else
                throw new Error('Not enough data to retrieve or create user');
            return user;
        }
    };
    fastify.decorate('db', dbHelper);
    await dbHelper.createTable();
}
export default fp(dbFunction);