const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

const app = express();

// Segurança básica
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite por IP
});
app.use(limiter);
const corsOptions = {
    origin: (origin, callback) => {
        if (['https://front-groove.vercel.app'].includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Infelizmente você nao pode fazer isso'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// CORS configurado
app.use(cors(corsOptions));

// Parser com limites
app.use(bodyParser.json({ limit: '10kb' }));

// Configuração de sessão mais segura
app.use(session({
    ...config.session,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Nome customizado do cookie
    cookie: {
        ...config.session.cookie,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rotas
const authRoutes = require('./routes/authRoutes');
const checkOutRoutes = require('./routes/checkOut');
const smsRoutes = require('./routes/smsRoutes');

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(authRoutes);
app.use('/api/checkout', checkOutRoutes);
app.use('/api', smsRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
