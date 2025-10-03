This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Overview
This page provides a screensaver that cycles through news, weather, sports and other interesting screens.  

Imagine that this viewer were posted to github pages and the image server sat on a private server behind a home firewall someplace or perhaps in Azure blob storage.  Due to CORS restrictions, may files cannot be accessed with an intermediate server or active proxy.

It's mostly a sandbox to sort out React and how to build a full screen app.

## Config File
A screenlist.json file specifies the screens to view, how long before they need to be refreshed and how long to show them for.
```json
{
  "list": [
    {
      "resource": "https://i.imgur.com/Whf10Sd.png",
      "resource_comment": "The resource domain must provide 'Access-Control-Allow-Origin: *' for this to work.  imgur does that.",
      "refreshMinutes": 60,
      "displaySecs": 6
    },
    {
      "resource": "https://i.imgur.com/bL2G08D.jpeg",
      "refreshMinutes": 60,
      "displaySecs": 6
    }
  ]
}
```