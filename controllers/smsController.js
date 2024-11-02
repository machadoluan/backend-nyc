const twilio = require('twilio');

const accountSid = 'AC58cc4e3713fdc0713b22b021fa14ebf4';
const authToken = 'e14d45f2929cda9b3b6c6de88feb7ee1';

const client = new twilio(accountSid, authToken);

exports.sendSms = (req, res) => {
    const { to, code } = req.body;

    client.messages
        .create({
            body: code,
            from: '+16186154640', 
            to: to, 
        })
        .then(message => {
            console.log(message.sid); // ID da mensagem
            res.status(200).send('Mensagem enviada com sucesso');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Erro ao enviar mensagem');
        });
}