const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require('./routes/authRoutes');
const checkOutRoutes = require('./routes/checkOut')

app.use(authRoutes);
app.use(checkOutRoutes)

app.get('/', (req, res) => {
    return res.send('Olá Mundo');
})

app.listen(3000, () => {
    console.log('Online em: http://localhost:3000');
})