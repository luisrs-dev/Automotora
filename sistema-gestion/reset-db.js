const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    console.log('Connected to database. Dropping tables...');

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    if (tableNames.length > 0) {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const table of tableNames) {
            console.log(`Dropping table ${table}...`);
            await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('All tables dropped.');
    } else {
        console.log('No tables found.');
    }

    await connection.end();
}

main().catch(err => {
    console.error('Error reset database:', err);
    process.exit(1);
});
