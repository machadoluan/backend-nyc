require('dotenv').config();

module.exports = {
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: process.env.DISCORD_REDIRECT_URI
    },
    steam: {
        apiKey: process.env.STEAM_API_KEY,
        realm: process.env.STEAM_REALM,
        returnURL: process.env.STEAM_RETURN_URL
    },
    session: {
        secret: process.env.SESSION_SECRET,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h'
    },
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
}; 