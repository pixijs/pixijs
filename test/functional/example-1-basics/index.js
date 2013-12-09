describe('Example 1 - Basics', function () {
    'use strict';

    var baseUri = '/base/test/functional/example-1-basics';
    var expect = chai.expect;
    var currentFrame = 0;
    var frameEvents = {};
    var stage;
    var renderer;
    var bunny;

    function onFrame(frame, callback) {
        frameEvents[frame] = callback;
    }

    function animate() {
        currentFrame += 1;

        window.requestAnimFrame( animate );

        // just for fun, lets rotate mr rabbit a little
        bunny.rotation += 0.1;

        // render the stage
        renderer.render(stage);

        if (frameEvents[currentFrame])
            frameEvents[currentFrame](currentFrame);
    }

    function initScene() {
        // create an new instance of a pixi stage
        stage = new PIXI.Stage(0x66FF99);

        // create a renderer instance
        renderer = PIXI.autoDetectRenderer(400, 300);
        console.log('Is PIXI.WebGLRenderer: ' + (renderer instanceof PIXI.WebGLRenderer));

        // add the renderer view element to the DOM
        document.body.appendChild(renderer.view);

        window.requestAnimFrame( animate );

        // create a texture from an image path
        var texture = PIXI.Texture.fromImage(baseUri + '/bunny.png');
        // create a new Sprite using the texture
        bunny = new PIXI.Sprite(texture);

        // center the sprites anchor point
        bunny.anchor.x = 0.5;
        bunny.anchor.y = 0.5;

        // move the sprite t the center of the screen
        bunny.position.x = 200;
        bunny.position.y = 150;

        stage.addChild(bunny);
    }

    it('assets loaded', function (done) {
        var loader = new PIXI.AssetLoader([
            baseUri + '/bunny.png',
            baseUri + '/frame-30.png',
            baseUri + '/frame-60.png',
            baseUri + '/frame-90.png'
        ]);
        // loader.on('onProgress', function (event) {
        //     console.log(event.content);
        // });
        loader.on('onComplete', function () {
            done();
            initScene();
        });
        loader.load();
    });

    it('frame 30 should match', function (done) {
        this.timeout(700);
        onFrame(30, function () {
            var str = renderer.view.toDataURL('image/png');
            //console.log('<img src="' + str + '" />');
            resemble(str)
                .compareTo(baseUri + '/frame-30.png')
                .onComplete(function (data) {
                    expect(data).to.be.an('object');
                    expect(data.isSameDimensions).to.equal(true);
                    expect(data.misMatchPercentage).to.be.below(0.2);
                    done();
                });
        });
    });

    it('frame 60 should match', function (done) {
        this.timeout(1200);
        onFrame(60, function () {
            var str = renderer.view.toDataURL('image/png');
            //console.log('<img src="' + str + '" />');
            resemble(str)
                .compareTo(baseUri + '/frame-60.png')
                .onComplete(function (data) {
                    expect(data).to.be.an('object');
                    expect(data.isSameDimensions).to.equal(true);
                    expect(data.misMatchPercentage).to.be.below(0.2);
                    done();
                });
        });
    });

    it('frame 90 should match', function (done) {
        this.timeout(1700);
        onFrame(90, function () {
            var str = renderer.view.toDataURL('image/png');
            //console.log('<img src="' + str + '" />');
            resemble(str)
                .compareTo(baseUri + '/frame-90.png')
                .onComplete(function (data) {
                    expect(data).to.be.an('object');
                    expect(data.isSameDimensions).to.equal(true);
                    expect(data.misMatchPercentage).to.be.below(0.2);
                    done();
                });
        });
    });

    // it('capture something', function (done) {
    //     this.timeout(2000000);
    //     onFrame(30, function () {
    //         var img = new Image();
    //         img.src = renderer.view.toDataURL('image/png');
    //         document.body.appendChild(img);
    //     });
    // });
});
