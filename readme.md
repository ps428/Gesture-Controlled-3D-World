# Gesture Controlled 3D World
This mini project is made using [Mediapipe](https://mediapipe.dev/) and [CesiumJS](https://cesium.com/platform/cesiumjs/). This allows the user to control the world using their hands!

## How to use
Just clone this repository and run [live-server](https://www.npmjs.com/package/live-server) or [http.server](https://docs.python.org/3/library/http.server.html) in the respective directory. All the action is there in the scr/script.js file. 

## Gestures Controls
1. Palm Open (Right hand): Zoom in
2. Fist (Right hand): Zoom out
3. Pointing (Right hand): Move 
4. Victory Symbol (Right hand): Move r
5. Thumbs up (Right hand): Move up
6. Thumbs down (Right hand): Move down
7. Pointing (Left hand): Look left
8. Victory Symbol (Left hand): Look right
9. Thumbs up (Left hand): Look up
10. Thumbs down (Left hand): Look down

## Possible issues:
1. Due to lateral inversion of the camera feed in their systems, users may notice reverse behaviour since the left hand would now be recognized as the right one and vice versa.
2. Possible lag due to slow internet connection since the 3D objects from Cesium are bulky.
<br>
---
<br>

> Please feel free to [contact me](https://www.linkedin.com/in/ps428/) if you wish to make something cool that resonates with this mini project.