const express = require('express')
const util = require('util');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const router = express.Router()

const authController = require('../controllers/authController')

router.get('/auth/discord', authController.authDiscord)
router.get('/auth/callback', authController.callback)
router.get('/auth/steam', (req, res, next) => {
    const discordID = req.query.discordID || req.session.discordID;

    console.log('Discord ID recebido:', discordID);

    if (!discordID) {
        console.log('Discord ID não encontrado');
    }

    req.session.discordID = discordID;

    const returnURL = `http://localhost:3000/auth/steam/return?discordID=${discordID}`;

    const steamAuth = new SteamStrategy({
        returnURL: returnURL,
        realm: 'http://localhost:3000/',
        apiKey: 'A49233D1BCFBF3B6A8C036647AFEF856'
    }, function (identifier, profile, done) {
        profile.identifier = identifier;
        return done(null, profile);
    });

    passport.use('steam-custom', steamAuth);

    passport.authenticate('steam-custom')(req, res, next);
});
router.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res, next) => {
        req.discordID = req.query.discordID;
        next();
    },
    authController.authSteam
);

router.get('/get-user', authController.getUser)
router.post('/cadastro', authController.cadastroUser)


module.exports = router
