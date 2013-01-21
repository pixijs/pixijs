

$(document).ready(onReady)

$(window).resize(resize)
window.onorientationchange = resize;

var width = 480;
var height = 320;

var aliens = [];

var maxX = width;
var minX = 0;
var maxY = height;
var minY = 0;

var startAlienCount = 100;
var isAdding = false;
var count = 0;
var loader;
var alienFrames = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

function onReady()
{
	loader = new PIXI.AssetLoader(["GameAssets.json"])
	
	loader.addEventListener( 'loaded', function ( event ) {
		init();
	} );
	
	loader.load();
}

function init()
{
	renderer = PIXI.autoDetectRenderer(800, 600);
	
	stage = new PIXI.Stage;
	
	document.body.appendChild(renderer.view);
	
	stats = new Stats();
	
	document.body.appendChild( stats.domElement );
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "0px";
	requestAnimFrame(update);
	
	resize();
	
	// add a bunch of aliens
	for (var i = 0; i < startAlienCount; i++) 
	{
		var alien = new PIXI.Sprite.spriteFromFrame(alienFrames[i % 4]);
		alien.position.x = Math.random() * maxX;
		alien.position.y = Math.random() * maxY;
		alien.anchor.x = 0.5;
		alien.anchor.y = 0.5;
		aliens.push(alien);
		
		stage.addChild(alien);
	}
	
	// add some events counter
	$(renderer.view).mousedown(function(){
		isAdding = true;
	});
	
	$(renderer.view).mouseup(function(){
		isAdding = false;
	})
	
	document.addEventListener("touchstart", onTouchStart, true);
	document.addEventListener("touchend", onTouchEnd, true);
	
	// add the bunny counter
	counter = document.createElement("div");
	counter.className = "counter";
	document.body.appendChild( counter);
	
	count = startAlienCount;
	counter.innerHTML = count + " ALIENS";
	
	
}

function onTouchStart(event)
{
	isAdding = true;
}

function onTouchEnd(event)
{
	isAdding = false;
}

function resize()
{
	var width = $(window).width(); 
	var height = $(window).height(); 
	
	maxX = width;
	maxY = height;

	renderer.resize(width, height);
	
	for (var i = 0; i < aliens.length; i++) 
	{
		var alien = aliens[i];
		alien.position.x = Math.random() * maxX;
		alien.position.y = Math.random() * maxY;
	}
}

function update()
{
	stats.begin();
	
	if(isAdding)
	{
		// add 10 at a time :)
		
		for (var i = 0; i < 2; i++) 
		{
			var alien = PIXI.Sprite.spriteFromFrame(alienFrames[count % 4]);
			alien.position.x = Math.random() * maxX;
			alien.position.y = Math.random() * maxY;
			alien.anchor.x = 0.5;
			alien.anchor.y = 0.5;
			alien.rotation = Math.random() - 0.5;
			stage.addChild(alien);
			count++;
			aliens.push(alien);
		}
		
		counter.innerHTML = count + " ALIENS";
	}
	
	for (var i = 0; i < aliens.length; i++) 
	{
		var alien = aliens[i];
		alien.rotation += 0.05;
	}

	renderer.render(stage);
	requestAnimFrame(update);
	stats.end();
}
