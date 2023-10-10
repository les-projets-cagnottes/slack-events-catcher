const request = require('request');
const logger = require('./logger.js');

var run = function (coreApiToken, payload) {
    payload.actions.forEach(action => {
        if (action.action_id.startsWith("vote_")) {
            var slackTeamId = payload.team.id;
            var slackUserId = payload.user.id;
            var voteType = action.action_id.replace("vote_", "");
            vote(coreApiToken, slackTeamId, slackUserId, voteType.toUpperCase(), parseInt(action.value));
        }
    });
}

var vote = function (coreApiToken, slackTeamId, slackUserId, voteType, projectId) {
    const options = {
        method: 'POST',
        url: `${process.env.LPC_CORE_API_URL}/api/slack/${slackTeamId}/vote`,
        body: JSON.stringify({
            type: voteType,
            project: {
                id: projectId
            },
            slackUser: {
                slack_id: slackUserId
            }
        }),
        headers: {
            'Authorization': `Bearer ${coreApiToken}`,
            'Content-Type': 'application/json'
        }
    };
    request(options, (err, res) => {
        if (err) { logger.log(err); } else { logger.log(`Sending vote ${voteType} for ${projectId} in team ${slackTeamId} : ${res.statusCode}`) }
    });
}

exports.run = run;