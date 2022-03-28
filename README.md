# Les Projets Cagnottes - slack-events-catcher

[![Release](https://github.com/les-projets-cagnottes/slack-events-catcher/workflows/Release/badge.svg)](https://github.com/les-projets-cagnottes/slack-events-catcher/actions?query=workflow%3ARelease)
[![Integration](https://github.com/les-projets-cagnottes/slack-events-catcher/workflows/Integration/badge.svg)](https://github.com/les-projets-cagnottes/slack-events-catcher/actions?query=workflow%3AIntegration) 

## Getting Started

Checkout this repository and run

```
npm install
node src/index.js
```

## Authenticate with core component

Create a file `core-token` containing an API token in the project directory. It will be consumed by the slack-events-catcher to be used in API calls.

## Local Testing

Use ngrok to start a tunnel and keep the window open

```
ngrok http 3000
```

On the Slack App, enable events and define the Request URL as followed : `<NGROK URL>/slack/events`
