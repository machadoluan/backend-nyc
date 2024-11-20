const mysql = require('mysql');


const db = mysql.createConnection({
    acquireTimeout: 30000,
    host: 'groovestreett.c74w0i6ugwzz.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Lun121107#',
    database: 'groove_street',
    port: 3306
});
// const db = mysql.createConnection({
//     acquireTimeout: 30000,
//     host: 'localhost',
//     user: 'root',
//     password: 'Machado@Luan121107',
//     database: 'groove_street',
//     port: 3306
// });
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});

module.exports = db;