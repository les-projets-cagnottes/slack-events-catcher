const request = require('request');
const logger = require('./logger.js');

var run = function (coreApiToken, payload) {
    payload.actions.forEach(action => {
        if (action.action_id.startsWith("vote_")) {
            var slackTeamId = payload.team.id;
            var slackUserId = payload.user.id;
            var voteType = action.action_id.replace("vote_", "");
            var notifIdAndProjectId = action.value.split("_");
            slackVote = {
                slackNotificationId: parseInt(notifIdAndProjectId[0]),
                messageTs: payload.message.ts,
                type: voteType.toUpperCase(),
                projectId: parseInt(notifIdAndProjectId[1]),
                slackUserId: slackUserId
            };
            vote(coreApiToken, slackTeamId, slackVote);
        }
    });
}

var vote = function (coreApiToken, slackTeamId, slackVote) {
    const options = {
        method: 'POST',
        url: `${process.env.LPC_CORE_API_URL}/api/slack/${slackTeamId}/vote`,
        body: JSON.stringify(slackVote),
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        }
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Sending vote in team ${slackTeamId} : ${res.statusCode}`) }
    });
}

exports.run = run;