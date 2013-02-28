Pixi Renderer
=============

#### JavaScript 2D Renderer ####

The aim of this project is to provide a fast lightweight 2D library that works across all devices.
The Pixi renderer allows everyone to enjoy the power of hardware acceleration without prior knowledge of webGL.
Also its fast.

If you’re interested in pixi.js then feel free to follow me on twitter (@doormat23) and I will keep you posted! 
And of course check back on our [site](http://www.goodboydigital.com/blog/) as any breakthroughs will be posted up here too!


### Demo ###

[Game demo Run pixi run](http://www.goodboydigital.com/runpixierun/)

-

[Bunny Demo](http://matgroves.com/pixijs/)

### Current features ###

- webGL renderer (with automatic smart batching allowing for REALLY fast performance)
- canvas renderer
- full scene graph
- super easy to use API (similar to twhe flash display list API)
- support for texture atlas's
- asset loader / sprite sheet loader
- auto detect which renderer should be used

### Coming soon ###

- Filters
- Render Texture
- Text
- Interactivity


### Coming later ###

- Awesome Post processing effects

### Usage ###

```javascript
	
	/*
		you can use either PIXI.WebGLRenderer or PIXI.CanvasRenderer
	*/
	var renderer = new PIXI.WebGLRenderer(800, 600); 

	document.body.appendChild(renderer.view);
	
	var stage = new PIXI.Stage;

	var bunnyTexture = new PIXI.Texture.fromImage("bunny.png");
	var bunny = new PIXI.Sprite(bunnyTexture);
	
	bunny.position.x = 400;
	bunny.position.y = 300;
	
	bunny.scale.x = 2;
	bunny.scale.y = 2;
	
	stage.addChild(bunny);
	
	requestAnimationFrame( animate );
	
	function animate() {
		
		requestAnimationFrame( animate );
		
		bunny.rotation += 0.01;
		
		renderer.render(stage);
	}
```

This content is released under the (http://opensource.org/licenses/MIT) MIT License.


