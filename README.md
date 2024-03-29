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

In the Slack App, navigate to :

- `Interactivity & Shortcuts` : set the Request URL as `<Ngrok URL>/slack/interactive`
- `Event Subscriptions` : set the Request URL as `<Ngrok URL>/slack/events`
- `Slash Commands` : 
  * `/projet-cagnotte` | `<Ngrok URL>/slack/events` | `Hello, world !` | `[hello]`
