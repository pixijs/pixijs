

$(document).ready(onReady)

$(window).resize(resize)
window.onorientationchange = resize;

var width = 480;
var height = 320;

var wabbitTexture;
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

function onReady()
{
	var webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )()
	
	if(webgl)
	{
		renderer = new PIXI.WebGLRenderer();
	}
	else
	{
		renderer = new PIXI.CanvasRenderer(480, 320);
	}
	
	stage = new PIXI.Stage;
	
	document.body.appendChild(renderer.view);
	
	stats = new Stats();
	
	document.body.appendChild( stats.domElement );
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "0px";
	requestAnimFrame(update);
	
	wabbitTexture = new PIXI.Texture("wabbit.png")
	
	counter = document.createElement("div");
	counter.className = "counter";
	document.body.appendChild( counter);
	
	count = startBunnyCount;
	counter.innerHTML = count + " BUNNIES";
	
	
	container = new PIXI.DisplayObjectContainer();
	stage.addChild(container);
	
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
	
	
	$(renderer.view).mousedown(function(){
		isAdding = true;
	});
	
	$(renderer.view).mouseup(function(){
		isAdding = false;
	})
	
	document.addEventListener("touchstart", onTouchStart, true);
	document.addEventListener("touchend", onTouchEnd, true);
	
	renderer.view.touchstart = function(){
		
		isAdding = true;
	}
	
	renderer.view.touchend = function(){
		isAdding = false;
	}
	resize();
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
	minX = 0;
	maxY = height;
	minY = 0;

	renderer.resize(width, height);
}

function update()
{
	stats.begin();
	
	if(isAdding)
	{
		// add 10 at a time :)
		
		for (var i = 0; i < 2; i++) 
		{
			var bunny = new PIXI.Sprite(wabbitTexture, {x:0, y:0, width:26, height:37});
			bunny.speedX = Math.random() * 10;
			bunny.speedY = (Math.random() * 10) - 5;
			
			bunny.anchor.x = 0.5;
			bunny.anchor.y = 1;
			bunny.alpha = 0.3 + Math.random() * 0.7;
			bunnys.push(bunny);
			bunny.rotation = Math.random() - 0.5;
			container.addChild(bunny);
			
			count++;
		}
		
		counter.innerHTML = count + " BUNNIES";
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
	requestAnimFrame(update);
	stats.end();
}
