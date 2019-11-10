require('dotenv').config();

const { createEventAdapter } = require('@slack/events-api');
const cron = require("node-cron");
const request = require('request');
const logger = require('./logger.js');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const PORT = process.env.PORT ? process.env.PORT : 3000;

var coreApiToken = process.env.CORE_API_TOKEN;

// Maintain a token with the core
cron.schedule("* * * * *", function () {
    logger.log("Refresh core API Token");
    const options = {
        url: `${process.env.CORE_API_URL}/auth/refresh`,
        headers: {
            'Authorization': `Bearer ${coreApiToken}`
        }
    };
    request(options, (err, res, body) => {
        if (err) { return console.log(err); }
        coreApiToken = JSON.parse(body).token;
    });
});




// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
});

slackEvents.on('team_join', (event) => {
    logger.log(`Received an event : ${JSON.stringify(event)}`);
});

(async () => {
    // Start the built-in server
    const server = await slackEvents.start(PORT);

    // Log a message when the server is ready
    logger.log(`Listening for events on ${server.address().port}`);
})();