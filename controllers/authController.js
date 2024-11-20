const axios = require('axios');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const config = require('../config/config');
const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

// Classe de erro customizada
class AuthError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = 'error';
    }
}

// Middleware de tratamento de erros assíncrono
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

exports.authDiscord = catchAsync(async (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.discord.clientId}&redirect_uri=${encodeURIComponent(config.discord.redirectUri)}&response_type=code&scope=identify+guilds`;
    res.redirect(discordAuthUrl);
});

exports.callback = catchAsync(async (req, res) => {
    const { code } = req.query;

    if (!code) {
        throw new AuthError('Código de autorização não fornecido', 400);
    }

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({
            client_id: config.discord.clientId,
            client_secret: config.discord.clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.discord.redirectUri,
        }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const user = userResponse.data
    const guilds = guildsResponse.data
    const discordID = user.id;

    console.log('ID do Discord:', user.id)

    const [accountsResult, siteResult] = await Promise.all([
        query('SELECT * FROM accounts WHERE discord = ?', [discordID]),
        query('SELECT * FROM site WHERE discord = ?', [discordID])
    ]);
    const result = accountsResult;
    const resultCadastro = await query('SELECT * FROM site WHERE discord = ?', [discordID]);
    const userData = resultCadastro[0] ||{};

    let needsCadastro = true
    let needsSteamLink = true
    if (result.length > 0) {
        // Se o usuário já existe
        console.log('Conta encontrada', result[0]);

        if (resultCadastro.length > 0) {
            const userData = resultCadastro[0];
            if (userData.email && userData.telefone && userData.data_nascimento && userData.indicacao) {
                needsCadastro = false
            }
        }

        if (result[0].license === 0) {
            needsSteamLink = false
        }
    } else {
        // Se o usuário não existe, inserir novo registro
        const sqlAccounts = 'INSERT INTO accounts (discord) VALUES (?)';
        const sqlSite = 'INSERT INTO site (discord) VALUES (?)';
        await Promise.all([
            query(sqlAccounts, [discordID]),
            query(sqlSite, [discordID])
        ]);

        console.log('Usuário inserido com sucesso!');
    }

    // Garantir que o discordID seja armazenado na sessão
    req.session.discordID = discordID;
    req.session.save((err) => {
        if (err) {
            console.error('Erro ao salvar sessão:', err);
        }
        console.log('Discord ID armazenado na sessão:', req.session.discordID);
    });

    const tokenPayload = {
        user: user,
        userData: userData,
    };

    
    const token = jwt.sign(tokenPayload, 'secreto', { expiresIn: '1h' });
    res.json({
        message: 'Autenticação bem-sucedida!',
        userDiscord: user,
        userData: userData,
        guilds,
        token,
        needsCadastro,
        needsSteamLink,
        discordID
    });
});

exports.authSteam = catchAsync(async (req, res) => {
    const steamID = req.user?.id;
    if (!steamID) {
        throw new AuthError('Steam ID não encontrado', 400);
    }

    const steamHex = `steam:${BigInt(steamID).toString(16)}`;
    const discordID = req.query.discordID || req.session.discordID;

    if (!discordID) {
        throw new AuthError('Discord ID não encontrado', 400);
    }

    const result = await query('SELECT * FROM accounts WHERE discord = ?', [discordID]);

    const [accountsResult, siteResult] = await Promise.all([
        query('SELECT * FROM accounts WHERE discord = ?', [discordID]),
        query('SELECT * FROM site WHERE discord = ?', [discordID])
    ]);

    if (accountsResult.length > 0) {
        await Promise.all([
            query('UPDATE accounts SET license = ? WHERE discord = ?', [steamHex, discordID]),
            query('UPDATE site SET license = ? WHERE discord = ?', [steamHex, discordID])
        ]);
        console.log('Conta atualizada com sucesso!');
    } else {
        await Promise.all([
            query('INSERT INTO site (discord, license) VALUES (?, ?)', [discordID, steamHex]),
            query('INSERT INTO accounts (discord, license) VALUES (?, ?)', [discordID, steamHex])
        ])
        console.log('Nova conta criada com sucesso!');
    }

    // Limpa a sessão após o uso
    req.session.discordID = null;

    res.redirect('https://front-groove.vercel.app/');
});

// Configuração do Passport mais segura
const steamStrategy = new SteamStrategy({
    returnURL: config.steam.returnURL,
    realm: config.steam.realm,
    apiKey: config.steam.apiKey
}, (identifier, profile, done) => {
    // Adicione validações extras aqui se necessário
    profile.identifier = identifier;
    return done(null, profile);
});

passport.use(steamStrategy);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});


exports.cadastroUser = (req, res) => {
    const { nome, dataNascimento, email, telefone, indicacao, discordID } = req.body

    const query = 'UPDATE site SET nome = ?, data_nascimento = ?, email = ?, telefone = ?, indicacao = ? WHERE discord = ?';

    db.query(query, [nome, dataNascimento, email, telefone, indicacao, discordID], (err, result) => {
        if (err) {
            console.error('Erro ao registrar o usuario.', err);
            res.status(500).send('Erro interno no servidor');
        } else {
            res.json({ message: 'Usuário registrado com sucesso!', id: result.insertId });
        }
    });
}


exports.getUser = (req, res) => {
    const query = 'SELECT * FROM site'

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erro ao buscar o usuario.', err);
            res.status(500).send('Erro interno no servidor');
        } else {
            res.json(result);
        }
    });
}