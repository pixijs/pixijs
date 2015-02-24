Pixi Renderer 
=============

#### *** IMPORTANT - V2 API CHANGES *** ####

A heads up for anyone updating their version of pixi.js to version 2, as we have changed a couple of bits that you need to be aware of. Fortunately, there are only two changes, and both are small.

1: Creating a renderer now accepts an options parameter that you can add specific settings to:
``` 
// an optional object that contains the settings for the renderer
var options = {
    view:myCanvas,
    resolution:1
};

var renderer = new PIXI.WebGLRenderer(800, 600, options) 
```

2: A ```PIXI.RenderTexture``` now accepts a ```PIXI.Matrix``` as its second parameter instead of a point. This gives you much more flexibility: 

``` myRenderTexture.render(myDisplayObject, myMatrix) ```

Check out the docs for more info!


![pixi.js logo](http://www.goodboydigital.com/pixijs/logo_small.png) 

[<img src="http://www.pixijs.com/wp-content/uploads/2013/05/headerPanel_projects-898x342.jpg">](http://www.pixijs.com/projects)
#### JavaScript 2D Renderer ####

The aim of this project is to provide a fast lightweight 2D library that works
across all devices. The Pixi renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of webGL. Also, it's fast.

If you’re interested in pixi.js then feel free to follow me on twitter
([@doormat23](https://twitter.com/doormat23)) and I will keep you posted!  And
of course check back on [our site](<http://www.goodboydigital.com/blog/>) as
any breakthroughs will be posted up there too!

[![Inline docs](http://inch-ci.org/github/GoodBoyDigital/pixi.js.svg?branch=master)](http://inch-ci.org/github/GoodBoyDigital/pixi.js)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/GoodBoyDigital/pixi.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

### Demos ###

- [WebGL Filters!](<http://www.goodboydigital.com/pixijs/examples/15/indexAll.html>)

- [Run pixie run](<http://www.goodboydigital.com/runpixierun/>)

- [Fight for Everyone](<http://www.goodboydigital.com/casestudies/fightforeveryone/>)

- [Flash vs HTML](<http://flashvhtml.com>)

- [Bunny Demo](<http://www.goodboydigital.com/pixijs/bunnymark>)
 
- [Storm Brewing](<http://www.goodboydigital.com/pixijs/storm/>)

- [Filters Demo](<http://www.goodboydigital.com/pixijs/examples/15/indexAll.html>)

- [Render Texture Demo](<http://www.goodboydigital.com/pixijs/examples/11/>)

- [Primitives Demo](<http://www.goodboydigital.com/pixijs/examples/13/>)

- [Masking Demo](<http://www.goodboydigital.com/pixijs/examples/14/>)

- [Interaction Demo](<http://www.goodboydigital.com/pixijs/examples/6/>)

- [photonstorm Balls Demo](<http://gametest.mobi/pixi/balls/>)

- [photonstorm Morph Demo](<http://gametest.mobi/pixi/morph/>)

Thanks to [@photonstorm](https://twitter.com/photonstorm) for providing those
last 2 examples and allowing us to share the source code :)

### Docs ###

[Documentation can be found here](<http://www.goodboydigital.com/pixijs/docs/>)

### Resources ###

[Tutorials and other helpful bits](<https://github.com/GoodBoyDigital/pixi.js/wiki/Resources>)

[Pixi.js forum](<http://www.html5gamedevs.com/forum/15-pixijs/>)


### Road Map ###

* Create a Typescript definition file for Pixi.js
* Implement Flash animation to pixi
* Update Loader so that it support XHR2 if it is available
* Improve the Documentation of the Project
* Create an Asset Loader Tutorial
* Create a MovieClip Tutorial
* Create a small game Tutorial

### Contribute ###

Want to be part of the pixi.js project? Great! All are welcome! We will get there quicker together :)
Whether you find a bug, have a great feature request or you fancy owning a task from the road map above feel free to get in touch.

Make sure to read the [Contributing Guide](https://github.com/GoodBoyDigital/pixi.js/blob/master/CONTRIBUTING.md)
before submitting changes.

### How to build ###

PixiJS is built with Grunt. If you don't already have this, go install Node and NPM then install the Grunt Command Line.

```
$> npm install -g grunt-cli
```

Then, in the folder where you have downloaded the source, install the build dependencies using npm:

```
$> npm install
```

Then build:

```
$> grunt
```

This will create a minified version at bin/pixi.js and a non-minified version at bin/pixi.dev.js.

It also copies the non-minified version to the examples.

### Current features ###

- WebGL renderer (with automatic smart batching allowing for REALLY fast performance)
- Canvas renderer (Fastest in town!)
- Full scene graph
- Super easy to use API (similar to the flash display list API)
- Support for texture atlases
- Asset loader / sprite sheet loader
- Auto-detect which renderer should be used
- Full Mouse and Multi-touch Interaction
- Text
- BitmapFont text
- Multiline Text
- Render Texture
- Spine support
- Primitive Drawing
- Masking
- Filters

### Usage ###

```javascript

	// You can use either PIXI.WebGLRenderer or PIXI.CanvasRenderer
	var renderer = new PIXI.WebGLRenderer(800, 600);

	document.body.appendChild(renderer.view);

	var stage = new PIXI.Stage;

	var bunnyTexture = PIXI.Texture.fromImage("bunny.png");
	var bunny = new PIXI.Sprite(bunnyTexture);

	bunny.position.x = 400;
	bunny.position.y = 300;

	bunny.scale.x = 2;
	bunny.scale.y = 2;

	stage.addChild(bunny);

	requestAnimationFrame(animate);

	function animate() {
		bunny.rotation += 0.01;

		renderer.render(stage);

		requestAnimationFrame(animate);
	}
```

This content is released under the (http://opensource.org/licenses/MIT) MIT License.

[![Analytics](https://ga-beacon.appspot.com/UA-39213431-2/pixi.js/index)](https://github.com/igrigorik/ga-beacon)
