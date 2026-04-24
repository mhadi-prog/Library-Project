const sql = require('mssql');

// const config = {
//     server: 'localhost\\SQLEXPRESS',
//     database: 'LibraryProject',
//     authentication: {
//         type: 'default',
//          options: {
//             user: 'LibraryProject_Admin',  // or your SQL user
//             password: 'hadi1234'  // or your SQL password
//         }
//     },
//     options: {
//         encrypt: false,  // Changed from true
//         trustServerCertificate: true
//     }
// };

const config = {
    user: 'LibraryProject_Admin',
    password: 'hadi1234',
    server: 'localhost',
    database: 'LibraryProject',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS'  // ← This was the missing piece!
    }
};


const pool = new sql.ConnectionPool(config);

const poolConnect = pool.connect();

poolConnect
    .then(() => {
        console.log('✓ Connected to SQL Server - LibraryProject');
    })
    .catch(err => {
        console.error('✗ Database connection failed');
        console.error('Error:', err);
    });

module.exports = pool;