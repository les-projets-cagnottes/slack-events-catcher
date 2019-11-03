require('dotenv').config();

const { WebClient } = require('@slack/web-api');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger.js');

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    var message = {
        channel: "#general",
        text: "Hi! :wave: \n I'm your new bot."
    };
    (async () => {
        try {
            await new WebClient(process.env.SLACK_AUTH_TOKEN_BOT).chat.postMessage(message);
        } catch (error) {
            logger.error(error);
        }
    })();
    res.json();
});

app.listen(PORT, function () {
    logger.log('Bot is listening on port ' + PORT);
});