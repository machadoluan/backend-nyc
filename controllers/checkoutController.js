
require('dotenv').config()
const { MercadoPagoConfig, Preference } = require('mercadopago');


exports.creatCheckOut = (req, res) => {

    const { items } = req.body


    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_KEY });

    const preference = new Preference(client);

    preference.create({
        body: {
            items: items.map(item => ({
                title: item.title,
                currency_id: 'BRL',
                description: item.description,
                quantity: item.quantity,
                unit_price: item.price
            }))
        }
    })
        .then(console.log)
        .catch(console.log);
}