import pkg from 'sqlite3';
const { Database } = pkg;

const db = new Database('database.db');

export function createTable()
{
    return new Promise((resolve, reject) =>{
        db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, nickname TEXT, password TEXT);", 
        function (err)
        {
            if (err)
            {
                console.error("Error creating table:", err);
                reject(err);
            }
            else
            {
                console.log("Users table created or already exists");
                resolve();
            }
        });
    });
}

export function createUser(nickname, password)
{
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO users (nickname, password) VALUES (?, ?)", [nickname, password],
        function (err)
        {
            if (err)
            {
                console.error("Error creating user:", err);
                reject(err);
            }
            else
            {
                resolve({
                    id: this.lastID,
                    nickname: nickname,
                    password: password
                }
                )
            }
        });
    });
}

export function getAllUsers()
{
    return new Promise((resolve, reject) =>
    {
        db.all("SELECT * FROM users;", [],
        (err, rows) => 
        {
            if(err)
            {
                console.error("Error cannot retrieve data:", err);
                reject(err);
            }
            else
            {
                resolve(rows);
            }
        })
    })
}