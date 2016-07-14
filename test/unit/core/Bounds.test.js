describe('getBounds', function () {


    it('should register correct width and height with a LOADED Sprite', function() {
        var parent = new PIXI.Container();
        var texture = PIXI.RenderTexture.create(10, 10);

        var sprite = new PIXI.Sprite(texture);

        parent.addChild(sprite);


        var bounds = sprite.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        var bounds = sprite.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);


        var bounds = sprite.getBounds(true);

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

    });

    it('should register correct width and height with Graphics', function() {
        var parent = new PIXI.Container();

        var graphics = new PIXI.Graphics();

        var bounds = graphics.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

        graphics.beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        parent.addChild(graphics);

        var bounds = graphics.getBounds();

        expect(bounds.x).to.equal(-10);
        expect(bounds.y).to.equal(-10);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.position.x = 20;
        graphics.position.y = 20;

        graphics.scale.x = 2;
        graphics.scale.y = 2;

        var bounds = graphics.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(40);
        expect(bounds.height).to.equal(40);

        var bounds = graphics.getBounds(true);

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(40);
        expect(bounds.height).to.equal(40);

    });

    it('should register correct width and height with an empty Container', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        parent.addChild(container);

        var bounds = container.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        var bounds = container.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

    });

    it('should register correct width and height with a Container', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

    	var graphics = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

    	var texture = PIXI.RenderTexture.create(10, 10);
        var sprite = new PIXI.Sprite(texture);

        container.addChild(sprite);
        container.addChild(graphics);

        parent.addChild(container);

	    sprite.position.x = 30;
    	sprite.position.y = 20;
	    graphics.position.x = 100;
    	graphics.position.y = 100;

        var bounds = container.getBounds();

        expect(bounds.x).to.equal(30);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(80);
        expect(bounds.height).to.equal(90);

	    container.rotation = 0.1;

        var bounds = container.getBounds();

        expect(bounds.x).to.equal(26.855121612548828);
        expect(bounds.y).to.equal(22.89508628845215);
        expect(bounds.width).to.equal(73.61032906981947);
        expect(bounds.height).to.equal(97.53704772328177);

        var bounds = container.getBounds(true);

        expect(bounds.x).to.equal(26.855121612548828);
        expect(bounds.y).to.equal(22.89508628845215);
        expect(bounds.width).to.equal(73.61032906981947);
        expect(bounds.height).to.equal(97.53704772328177);


    });

	it('should register correct width and height with an item that has already had its parent Container transformed', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

    	var graphics = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);//texture);


        parent.addChild(container);
        container.addChild(graphics);

	    container.position.x = 100;
    	container.position.y = 100;

        var bounds = container.getBounds();

        expect(bounds.x).to.equal(100);
        expect(bounds.y).to.equal(100);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);


        var bounds = graphics.getBounds(true);

        expect(bounds.x).to.equal(100);
        expect(bounds.y).to.equal(100);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);




    });

	it('should register correct width and height with a Mesh', function() {
	        var parent = new PIXI.Container();

	    	var texture = PIXI.RenderTexture.create(10, 10);

	        var plane = new PIXI.mesh.Plane(texture);

	        parent.addChild(plane);

		    plane.position.x = 20;
	    	plane.position.y = 20;

	        var bounds = plane.getBounds();

	        expect(bounds.x).to.equal(20);
	        expect(bounds.y).to.equal(20);
	        expect(bounds.width).to.equal(10);
	        expect(bounds.height).to.equal(10);

	        plane.scale.x = 2;
	    	plane.scale.y = 2;

	        var bounds = plane.getBounds();

	        expect(bounds.x).to.equal(20);
	        expect(bounds.y).to.equal(20);
	        expect(bounds.width).to.equal(20);
	        expect(bounds.height).to.equal(20);

	    });
	});
