const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const clientId = '1068618277703647382'
const clientSecret = 'dl8XH9OR5lNSKe72ZMr-53vAB5MgCnHA'
const redirectUri = 'http://localhost:4200/auth/callback';

app.get('/', (req, res) => {
    return res.send('Olá Mundo')
})

app.get('/auth/discord', (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify+guilds`;
    res.redirect(discordAuthUrl);
})

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

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
        

        const token = jwt.sign(user, 'secreto', { expiresIn: '1h' });
        res.json({ message: 'Autenticação bem-sucedida!', usuario: user, guilds, token });
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});

app.listen(3000, () => {
    console.log('Online em: http://localhost:3000')
})