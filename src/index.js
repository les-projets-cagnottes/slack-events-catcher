require('dotenv').config();

const { createEventAdapter } = require('@slack/events-api');
const logger = require('./logger.js');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const PORT = process.env.PORT ? process.env.PORT : 3000;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
    logger.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

(async () => {
    // Start the built-in server
    const server = await slackEvents.start(PORT);

    // Log a message when the server is ready
    logger.log(`Listening for events on ${server.address().port}`);
})();