const twilio = require('twilio');

const accountSid = 'AC58cc4e3713fdc0713b22b021fa14ebf4';
const authToken = 'e14d45f2929cda9b3b6c6de88feb7ee1';

const client = new twilio(accountSid, authToken);



exports.sendSms = (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).send({ error: 'Phone and message are required.' });
    }

    client.messages
        .create({
            body: message,
            from: '+1 618 615 4640', // Twilio's WhatsApp number
            to: phone // Add the whatsapp: prefix
        })
        .then(response => {
            console.log(response.sid);
            res.status(200).send({ success: true, sid: response.sid });
        })
        .catch(error => {
            console.error(error);
            res.status(error.status || 500).send({ error: error.message });
        });
};
