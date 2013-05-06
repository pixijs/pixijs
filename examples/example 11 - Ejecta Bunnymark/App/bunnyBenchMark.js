
var width = window.innerWidth;
var height = window.innerHeight;

var wabbitTexture;
var pirateTexture;

var bunnys = [];
var gravity = 0.75//1.5 ;

var maxX = width;
var minX = 0;
var maxY = height;
var minY = 0;

var startBunnyCount = 10;
var isAdding = false;
var count = 0;
var container;
var amount = 10;
var renderer;
var stage;

document.addEventListener("mousedown", onDocumentTouchStart, false);
document.addEventListener("mouseup", onDocumentTouchEnd, false);
document.addEventListener("touchstart", onDocumentTouchStart, false);
document.addEventListener("touchend", onDocumentTouchEnd, false);
window.addEventListener('resize', onWindowResize, false);

init();
animate();

function init()
{
	count = startBunnyCount;
	stage = new PIXI.Stage(0xFFFFFF);
	container = new PIXI.DisplayObjectContainer();
	stage.addChild(container);

	wabbitTexture = new PIXI.Texture.fromImage("bunny.png");
	for (var i = 0; i < startBunnyCount; i++)
	{
		var bunny = new PIXI.Sprite(wabbitTexture, {x:0, y:0, width:26, height:37});
		bunny.speedX = Math.random() * 10;
		bunny.speedY = (Math.random() * 10) - 5;

		bunny.anchor.x = 0.5;
		bunny.anchor.y = 1;
		bunnys.push(bunny);

		container.addChild(bunny);
	}

	renderer = new PIXI.WebGLRenderer(width, height);

	document.body.appendChild(renderer.view);
}

function onDocumentTouchStart(event) {
	isAdding = true;
}

function onDocumentTouchEnd(event) {
	isAdding = false;
}

function onWindowResize() {
	var width = window.innerWidth;
	var height = window.innerHeight;

	maxX = width;
	minX = 0;
	maxY = height;
	minY = 0;

	renderer.resize(width, height);
}

function animate() {
	requestAnimationFrame(animate);
	update();
}

function update() {
	if (isAdding) {
		// add 10 at a time :)

		for (var i = 0; i < amount; i++)
		{
			var bunny = new PIXI.Sprite(wabbitTexture, {x:0, y:0, width:26, height:37});
			bunny.speedX = Math.random() * 10;
			bunny.speedY = (Math.random() * 10) - 5;

			bunny.anchor.x = 0.5;
			bunny.anchor.y = 1;
			bunnys.push(bunny);
			bunny.scale.y = 1;

			container.addChild(bunny)//, random);

			count++;
		}

		if(count >= 16500)amount = 0;
	}

	for (var i = 0; i < bunnys.length; i++)
	{
		var bunny = bunnys[i];

		bunny.position.x += bunny.speedX;
		bunny.position.y += bunny.speedY;
		bunny.speedY += gravity;

		if (bunny.position.x > maxX)
		{
			bunny.speedX *= -1;
			bunny.position.x = maxX;
		}
		else if (bunny.position.x < minX)
		{
			bunny.speedX *= -1;
			bunny.position.x = minX;
		}

		if (bunny.position.y > maxY)
		{
			bunny.speedY *= -0.85;
			bunny.position.y = maxY;
			bunny.spin = (Math.random()-0.5) * 0.2
			if (Math.random() > 0.5)
			{
				bunny.speedY -= Math.random() * 6;
			}
		}
		else if (bunny.position.y < minY)
		{
			bunny.speedY = 0;
			bunny.position.y = minY;
		}

	}

	renderer.render(stage);
}
