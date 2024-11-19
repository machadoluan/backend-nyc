const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.iicmgbptlszhiqweyzuk:*FdvF$*QHh254dA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    })
    .catch(err => {
        console.error('Erro ao conectar com o banco de dados:', err.stack);
    });


module.exports = client;