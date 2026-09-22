# Deployment

## Render

Build Command:
npm install

Start Command:
npm start

Environment:
No environment variable is required.

The server automatically uses Render's PORT:
process.env.PORT || 3000

## Local

npm install
npm start

Open:
http://localhost:3000

## Important

Add song1.mp3, song2.mp3 and song3.mp3 to public/audio before deployment.


## Current-node visualization fix

The linked-list diagram is synchronized with the backend Circular Doubly Linked
List `current` pointer. If Song 3 is playing, Song 3 is shown as Current.
When Next is pressed from Song 3, Song 1 becomes Current, demonstrating the
circular connection.
