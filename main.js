//import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
//import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://unpkg.com/three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://unpkg.com/three/examples/jsm/loaders/MTLLoader.js";

function main() {
  var mainClock = new THREE.Clock();

  //const radians_to_degrees = (rad) => (rad * 180) / Math.PI;
  const degrees_to_radians = (deg) => (deg * Math.PI) / 180.0;

  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });

  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 20);

  const controls = new OrbitControls(camera, canvas);

  //How far you can zoom in and out.
  controls.minDistance = 15;
  controls.maxDistance = 25;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  controls.minPolarAngle = degrees_to_radians(45); // radians
  controls.maxPolarAngle = degrees_to_radians(135); // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  controls.minAzimuthAngle = degrees_to_radians(-35); // radians
  controls.maxAzimuthAngle = degrees_to_radians(35); // radians

  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("grey");

  var mouseIsDown = false;
  var manual = false;
  let body;
  window.onload = function get_body() {
    body = document.getElementsByTagName("body")[0];
  };

  {
    //wall plane
    const planeSize = 400;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://threejs.org/manual/examples/resources/images/checker.png"
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.position.z = -0.7;
    //mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }

  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  //const sound = new THREE.Audio(listener);

  // create the PositionalAudio object (passing in the listener)
  const onSound = new THREE.PositionalAudio(listener);
  const offSound = new THREE.PositionalAudio(listener);
  const onRobotSound = new THREE.PositionalAudio(listener);
  const offRobotSound = new THREE.PositionalAudio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("sounds/on_manual.ogg", function (buffer) {
    onSound.setBuffer(buffer);
    onSound.setRefDistance(20);
    //sound.setLoop(true);
    onSound.setVolume(2);
  });
  audioLoader.load("sounds/off_manual.ogg", function (buffer) {
    offSound.setBuffer(buffer);
    offSound.setRefDistance(20);
    //sound.setLoop(true);
    offSound.setVolume(2);
  });
  audioLoader.load("sounds/on_robot.ogg", function (buffer) {
    onRobotSound.setBuffer(buffer);
    onRobotSound.setRefDistance(20);
    //sound.setLoop(true);
    onRobotSound.setVolume(2);
  });
  audioLoader.load("sounds/off_robot.ogg", function (buffer) {
    offRobotSound.setBuffer(buffer);
    offRobotSound.setRefDistance(20);
    //sound.setLoop(true);
    offRobotSound.setVolume(2);
  });

  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      /* restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }
      */
      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(
        scene.children
      );
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;

        if (this.pickedObject.parent.name == "LowerWippe" && mouseIsDown) {
          if (switch_status == "10") {
            switch_status = "00";
            offSequence = true;
            manual = true;
          }
        }
        if (this.pickedObject.parent.name == "UpperWippe" && mouseIsDown) {
          if (switch_status == "01") {
            switch_status = "00";
            onSequence = true;
            manual = true;
          }
        }
        /*save its color
        if (this.pickedObject) {
          this.pickedObjectSavedColor =
            this.pickedObject.material.emissive.getHex();
          // set its emissive color to flashing red/yellow
          this.pickedObject.material.emissive.setHex(
            (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
          );
        }*/
      }
    }
  }

  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 3;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  document.getElementById("setProactiveSequenceButton").onclick = function () {
    setProSequence();
  };

  document.getElementById("setReactiveSequenceButton").onclick = function () {
    setReSequence();
  };

  function setProSequence() {
    var input_sequence = document.getElementById(
      "proactiveSequenceTextInput"
    ).value;
    if (
      input_sequence.includes("/0/") ||
      input_sequence == "" ||
      input_sequence == undefined
    ) {
      proactive_sequence = "hold/0/";
      console.log("set proactive_sequence:", proactive_sequence);
    } else {
      proactive_sequence = input_sequence;
      console.log("set proactive_sequence:", proactive_sequence);
      current_sequence = proactive_sequence.split("/");
      current_progress = 0;
    }
  }

  function setReSequence() {
    var input_sequence = document.getElementById(
      "reactiveSequenceTextInput"
    ).value;
    if (
      input_sequence.includes("/0/") ||
      input_sequence == "" ||
      input_sequence == undefined
    ) {
      reactive_sequence = "hold/0/";
      console.log("set reactive_sequence:", reactive_sequence);
    } else {
      reactive_sequence = input_sequence;
      console.log("set reactive_sequence:", reactive_sequence);
    }
  }

  {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }

  {
    var rahmen = undefined;
    const mtlRahmen = new MTLLoader();
    mtlRahmen.load("models/rahmen.mtl", (mtl) => {
      mtl.preload();
      const objRahmen = new OBJLoader();
      objRahmen.setMaterials(mtl);
      //objRahmen.castShadow = true;
      //objRahmen.receiveShadow = true;
      objRahmen.load("models/rahmen.obj", (object) => {
        object.name = "Rahmen";
        rahmen = object;
        scene.add(rahmen);
      });
    });
    var upperWippe = undefined;
    const mtlUpperWippe = new MTLLoader();
    mtlUpperWippe.load("models/upperWippe.mtl", (mtl) => {
      mtl.preload();
      const objWippe = new OBJLoader();
      objWippe.setMaterials(mtl);
      //objWippe.castShadow = true;
      //objWippe.receiveShadow = true;
      objWippe.load("models/upperWippe.obj", (object) => {
        object.name = "UpperWippe";
        upperWippe = object;
        scene.add(upperWippe);
      });
    });

    var lowerWippe = undefined;
    const mtlLowerWippe = new MTLLoader();
    mtlLowerWippe.load("models/lowerWippe.mtl", (mtl) => {
      mtl.preload();
      const objWippe = new OBJLoader();
      objWippe.setMaterials(mtl);
      //objWippe.castShadow = true;
      //objWippe.receiveShadow = true;
      objWippe.load("models/lowerWippe.obj", (object) => {
        object.name = "LowerWippe";
        lowerWippe = object;
        scene.add(lowerWippe);
      });
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  var proactive_sequence = "hold/1/switch/1/";
  var reactive_sequence = "hold/0/";
  var current_sequence = proactive_sequence.split("/");
  var current_progress = 0;
  var prev_progress = -1;
  var count = 0;
  var elapsedSinceTrigger;
  var hold_time = 0.0;

  function render(time) {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    //monitor time
    var currentClock = mainClock.getElapsedTime();
    if (hold_time != 0.0 && currentClock - elapsedSinceTrigger > hold_time) {
      hold_time = 0.0;
      current_progress++;
    }
    //monitor sequence progress
    if (current_progress != prev_progress) {
      prev_progress = current_progress;
      if (current_sequence.length - current_progress != 1) {
        //console.log("current item: ", current_sequence[current_progress]);
        if (current_sequence[current_progress] == "switch") {
          current_progress++;
          count = Number(current_sequence[current_progress]);
          //console.log("switch_status ", switch_status, "count: ", count);
          if (switch_status == "01") {
            switch_status = "00";
            onSequence = true;
            soundTriggered = false;
          }
          if (switch_status == "10") {
            switch_status = "00";
            offSequence = true;
            soundTriggered = false;
          }
        } else if (current_sequence[current_progress] == "hold") {
          current_progress++;
          hold_time = parseFloat(current_sequence[current_progress]);
          elapsedSinceTrigger = mainClock.getElapsedTime();
          prev_progress = current_progress;
        }
      } else {
        current_progress = -1;
        prev_progress = current_progress;
      }
    }

    if (pickHelper.pickedObject != null) {
      if (
        pickHelper.pickedObject.name == "Körper29" ||
        pickHelper.pickedObject.name == "Körper30"
      ) {
        body.classList.add("cursorPointer");
      } else {
        body.classList.remove("cursorPointer");
      }
    }

    pickHelper.pick(pickPosition, scene, camera, time);
    if (count != 0) {
      if (prev_switch_status == "01") {
        switchOff();
      } else if (prev_switch_status == "10") {
        switchOn();
      }
    } else {
      if (offSequence) {
        switchOff();
      } else if (onSequence) {
        switchOn();
      }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(render);
  if (
    upperWippe != undefined &&
    lowerWippe != undefined &&
    rahmen != undefined
  ) {
    upperWippe.add(onSound);
    lowerWippe.add(offSound);
  }
  const upperbound = degrees_to_radians(8);
  const lowerbound = degrees_to_radians(-8);
  var angle = degrees_to_radians(0);
  var onSequence = false;
  var offSequence = false;
  var switch_status = "10";
  var prev_switch_status = switch_status;
  var soundTriggered = false;

  function switchOff() {
    onSequence = false;
    if (!soundTriggered && !manual) {
      offRobotSound.play();
      soundTriggered = true;
    }
    if (angle < upperbound) {
      onSound.isPlaying = false; //https://github.com/mrdoob/three.js/issues/9067
      onRobotSound.isPlaying = false; //https://github.com/mrdoob/three.js/issues/9067
      switch_status = "00";
      angle = angle + degrees_to_radians(8);
      upperWippe.rotation.x = angle;
      lowerWippe.rotation.x = angle;
    } else {
      if (current_progress != -1) {
        count--;
        if (count == 0) {
          current_progress++;
        }
      } else {
        if (reactive_sequence != "hold/0/") {
          console.log("reactive_sequence", reactive_sequence);
          current_sequence = reactive_sequence.split("/");
          current_progress = 0;
        }
      }
      prev_switch_status = "10";
      switch_status = "01";
      offSequence = false;
      soundTriggered = false;
      if (manual) {
        offSound.play();
        manual = false;
      }
      console.log("OFF", count);
    }
  }
  function switchOn() {
    offSequence = false;
    if (!soundTriggered && !manual) {
      onRobotSound.play();
      soundTriggered = true;
    }
    if (angle > lowerbound) {
      offSound.isPlaying = false; //https://github.com/mrdoob/three.js/issues/9067
      offRobotSound.isPlaying = false; //https://github.com/mrdoob/three.js/issues/9067
      switch_status = "00";
      angle = angle - degrees_to_radians(8);
      upperWippe.rotation.x = angle;
      lowerWippe.rotation.x = angle;
    } else {
      if (current_progress != -1) {
        count--;
        if (count == 0) {
          current_progress++;
        }
      } else {
        if (reactive_sequence != "hold/0/") {
          console.log("reactive_sequence", reactive_sequence);
          current_sequence = reactive_sequence.split("/");
          current_progress = 0;
        }
      }
      prev_switch_status = "01";
      switch_status = "10";
      onSequence = false;
      soundTriggered = false;
      if (manual) {
        onSound.play();
        manual = false;
      }
      console.log("ON", count);
    }
  }

  const pickHelper = new PickHelper();
  const pickPosition = { x: 0, y: 0 };
  clearPickPosition();

  function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
  }

  function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }

  function setMouseDown() {
    mouseIsDown = true;
  }

  function setMouseUp() {
    mouseIsDown = false;
  }
  window.addEventListener("mousemove", setPickPosition);
  window.addEventListener("mouseout", clearPickPosition);
  window.addEventListener("mouseleave", clearPickPosition);
  window.addEventListener("mousedown", setMouseDown);
  window.addEventListener("mouseup", setMouseUp);

  window.addEventListener(
    "touchstart",
    (event) => {
      // prevent the window from scrolling
      event.preventDefault();
      setPickPosition(event.touches[0]);
    },
    { passive: false }
  );

  window.addEventListener("touchmove", (event) => {
    setPickPosition(event.touches[0]);
  });

  window.addEventListener("touchend", clearPickPosition);
}

main();
