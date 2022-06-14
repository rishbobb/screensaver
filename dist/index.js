// HTML elements for use
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// Get Tauri invoke method
const invoke = window.__TAURI__.invoke;

var lookingAtScreen = true;

// Draw the landmarks
function drawLandmarks(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#E0E0E0",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });
    }
  }
  canvasCtx.restore();
}

// Get pitch yaw roll
function getParams(results) {
  if (results.multiFaceGeometry) {
    for (const facegeometry of results.multiFaceGeometry) {
      const pt_matrix = facegeometry
        .getPoseTransformMatrix()
        .getPackedDataList();
      const pt_matrix_three_js_format = new THREE.Matrix4().fromArray(
        pt_matrix
      );
      const euler_angles = new THREE.Euler().setFromRotationMatrix(
        pt_matrix_three_js_format,
        "XYZ"
      );
      var pitch = THREE.MathUtils.radToDeg(euler_angles["x"]);
      var yaw = THREE.MathUtils.radToDeg(euler_angles["y"]);
      var roll = THREE.MathUtils.radToDeg(euler_angles["z"]);
      return { pitch, yaw, roll };
    }
  }
}

// Processing functions
function onResults(results) {
  drawLandmarks(results);

  var params = getParams(results);

  var changed = false;

  if (params.yaw > 10 || params.yaw < -10) {
    if (lookingAtScreen) {
      lookingAtScreen = false;
      changed = true;
    }
  } else if (results.multiFaceGeometry.length > 1) {
    if (lookingAtScreen) {
      lookingAtScreen = false;
      changed = true;
    }
  } else {
    if (!lookingAtScreen) {
      lookingAtScreen = true;
      changed = true;
    }
  }

  document.getElementById("lookingAtScreen").innerText = lookingAtScreen;

  if (!lookingAtScreen && changed) {
    invoke("hide");
  }
}

// Create a facemesh
const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});
faceMesh.setOptions({
  maxNumFaces: 2,
  enableFaceGeometry: true,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Run results function on results
faceMesh.onResults((results) => {
  try {
    onResults(results);
  } catch (e) {
    console.log(e);
  }
});

// Create a camera to acess the camera and send frames to the facemesh
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();
