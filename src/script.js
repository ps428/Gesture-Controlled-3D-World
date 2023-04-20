// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
});
const scene = viewer.scene;
const canvas = viewer.canvas;
canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
canvas.onclick = function () {
    canvas.focus();
};

const ellipsoid = scene.globe.ellipsoid;

// disable the default event handlers
// scene.screenSpaceCameraController.enableRotate = false;
// scene.screenSpaceCameraController.enableTranslate = false;
// scene.screenSpaceCameraController.enableZoom = false;
// scene.screenSpaceCameraController.enableTilt = false;
// scene.screenSpaceCameraController.enableLook = false;

viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(73.7191, 21.8389, 1050),
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
    },
});

const scaler = 100.0;
const variance = 0.05
const fingerPoint = 8

let startMousePosition;
let mousePosition;
const flags = {
    looking: false,
    moveForward: false,
    moveBackward: false,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
};

let camera = viewer.camera
let moveRate
let cameraHeight2;
setTimeout(() => {
    cameraHeight2 = ellipsoid.cartesianToCartographic(
        camera.position
    ).height;
    moveRate = cameraHeight2 / scaler;

}, 3000);

viewer.clock.onTick.addEventListener(function (clock) {
    if (flags.looking) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // Coordinate (0.0, 0.0) will be where the mouse was clicked.
        const x = (mousePosition.x - startMousePosition.x) / width;
        const y = -(mousePosition.y - startMousePosition.y) / height;

        const lookFactor = 0.05;
        camera.lookRight(x * lookFactor);
        camera.lookUp(y * lookFactor);
    }

    // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
    const cameraHeight = ellipsoid.cartesianToCartographic(
        camera.position
    ).height;
    moveRate = cameraHeight / scaler;

    if (flags.moveForward) {
        camera.moveForward(moveRate);
    }
    if (flags.moveBackward) {
        camera.moveBackward(moveRate);
    }
    if (flags.moveUp) {
        camera.moveUp(moveRate);
    }
    if (flags.moveDown) {
        camera.moveDown(moveRate);
    }
    if (flags.moveLeft) {
        camera.moveLeft(moveRate);
    }
    if (flags.moveRight) {
        camera.moveRight(moveRate);
    }
});


import { GestureRecognizer, FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.1.0-alpha-11";
const demosSection = document.getElementById("demos");
let gestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-11/wasm");
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
        },
        runningMode: runningMode
    });
    demosSection.classList.remove("invisible");
    enableCam()
};
createGestureRecognizer();
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);

}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICITONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
async function predictWebcam() {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }
    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;
    if (results.landmarks.length) {
        // document.getElementById("locx").innerHTML = results.landmarks[0][fingerPoint]['x']
        // document.getElementById("locy").innerHTML = results.landmarks[0][fingerPoint]['y']
        // document.getElementById("locz").innerHTML = results.landmarks[0][fingerPoint]['z']
        // console.log(results.landmarks);
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }
    }
    canvasCtx.restore();
    if (results.gestures.length > 0) {
        gestureOutput.style.display = "block";
        gestureOutput.style.width = videoWidth;
        const categoryName = results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2);
        console.log( results.handednesses[0][0]["categoryName"]);
        const leftHand = results.handednesses[0][0]["categoryName"]== "Left"
        if (!leftHand) {
            if (categoryName == "Thumb_Up") {
                camera.lookUp(0.01);
            }
            if (categoryName == "Thumb_Down") {
                //            // console.log("hi");
                camera.lookDown(0.01);
            }
            if (categoryName == "Victory") {
                //            // console.log("hi");
                camera.lookRight(0.01);
            }

            if (categoryName == "Pointing_Up") {
                //            // console.log("hi");
                camera.lookLeft(0.01);
            }
       
        }
        else {
            if (categoryName == "Thumb_Up") {
                //            // console.log("hi");
                camera.moveUp(moveRate);
            }
            if (categoryName == "Thumb_Down") {
                //            // console.log("hi");
                camera.moveDown(moveRate);
            }
            if (categoryName == "Open_Palm") {
                //            // console.log("hi");
                camera.moveForward(moveRate);
            }
            if (categoryName == "Closed_Fist") {
                //            // console.log("hi");
                camera.moveBackward(moveRate);
            }
            if (categoryName == "Victory") {
                //            // console.log("hi");
                camera.moveRight(moveRate);
            }

            if (categoryName == "Pointing_Up") {
                //            // console.log("hi");
                camera.moveLeft(moveRate);
            }
        }
        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %`;
    }
    else {
        gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}