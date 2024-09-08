# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `node server.js`

Open one terminal. Runs the server.js in the background.

### `npm start`

Open another terminal.
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Test Web App
* Open two separate browser tabs to simulate two peers.
* In both tabs:
  * Click "Start Stream" to initiate local audio stream
  * Click "Start Call" to begin the WebRTC call.
* Ensure local audio is visible is playing in both tabs
* Ensure remote stream is visible and playing in both tabs.

## Tools used
* websocket, simple-peer dependency, and canvas
* web audio api

## Challenges
* Process polyfill (need to install process dependency and create webpack override to configure the app)
* Study WebRTC (read several documentation to understand webRTC)
* Canvas to visualize audio stream
