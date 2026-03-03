// description: A basic integration of PixiJS and Three.js sharing the same WebGL context
// Import required classes from PixiJS and Three.js
import { Container, Graphics, Text, WebGLRenderer } from 'pixi.js';
import * as THREE from 'three';

// Self-executing async function to set up the demo
(async () => {
  // Initialize window dimensions
  let WIDTH = window.innerWidth;
  let HEIGHT = window.innerHeight;

  // === THREE.JS SETUP ===
  // Create Three.js WebGL renderer with antialiasing and stencil buffer
  const threeRenderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });

  // Configure Three.js renderer size and background color
  threeRenderer.setSize(WIDTH, HEIGHT);
  threeRenderer.setClearColor(0xdddddd, 1); // Light gray background
  document.body.appendChild(threeRenderer.domElement);

  // Create Three.js scene
  const scene = new THREE.Scene();

  // Set up perspective camera with 70° FOV
  const threeCamera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT);

  threeCamera.position.z = 50; // Move camera back to see the scene
  scene.add(threeCamera);

  // Create a simple cube mesh
  const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
  const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x0095dd }); // Blue color
  const cube = new THREE.Mesh(boxGeometry, basicMaterial);

  scene.add(cube);

  // === PIXI.JS SETUP ===
  // Create PixiJS renderer that shares the WebGL context with Three.js
  const pixiRenderer = new WebGLRenderer();

  // Initialize PixiJS renderer with shared context
  await pixiRenderer.init({
    context: threeRenderer.getContext() as WebGL2RenderingContext,
    width: WIDTH,
    height: HEIGHT,
    clearBeforeRender: false, // Don't clear the canvas as Three.js will handle that
  });

  // Create PixiJS scene graph
  const stage = new Container();

  // Create a yellow rounded rectangle UI element
  const uiLayer = new Graphics().roundRect(20, 80, 300, 300, 20).fill(0xffff00);

  // Add text overlay
  const text = new Text({ text: 'Pixi and Three.js', style: { fontFamily: 'Arial', fontSize: 24, fill: 'black' } });

  uiLayer.addChild(text);
  stage.addChild(uiLayer);

  // Animation loop
  function loop() {
    // Rotate cube continuously
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Animate UI layer position using sine wave
    uiLayer.y = ((Math.sin(Date.now() * 0.001) + 1) * 0.5 * WIDTH) / 2;

    // Render Three.js scene
    threeRenderer.resetState();
    threeRenderer.render(scene, threeCamera);

    // Render PixiJS scene
    pixiRenderer.resetState();
    pixiRenderer.render({ container: stage });

    // Continue animation loop
    requestAnimationFrame(loop);
  }

  // Start animation loop
  requestAnimationFrame(loop);

  // Handle window resizing
  window.addEventListener('resize', () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    // Update Three.js renderer
    threeRenderer.setSize(WIDTH, HEIGHT);
    // Update Three.js camera aspect ratio so it renders correctly
    threeCamera.aspect = WIDTH / HEIGHT;
    threeCamera.updateProjectionMatrix();

    // Update PixiJS renderer
    pixiRenderer.resize(WIDTH, HEIGHT);
  });
})();
