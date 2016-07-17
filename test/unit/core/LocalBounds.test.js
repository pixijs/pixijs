describe('getLocalBounds', function () {


    it('should register correct local-bounds with a LOADED Sprite', function() {
        var parent = new PIXI.Container();
        var texture = PIXI.RenderTexture.create(10, 10);

        var sprite = new PIXI.Sprite(texture);

        parent.addChild(sprite);


        var bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        var bounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);


    });

    it('should register correct local-bounds with Graphics', function() {
        var parent = new PIXI.Container();

        var graphics = new PIXI.Graphics();

        graphics.beginFill(0xFF0000).drawCircle(0, 0, 10);//texture);

        graphics.scale.set(2);

        parent.addChild(graphics);

        var bounds = graphics.getLocalBounds();

        expect(bounds.x).to.equal(-10);
        expect(bounds.y).to.equal(-10);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

    });

    it('should register correct local-bounds with an empty Container', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        parent.addChild(container);

        var bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);


    });

	it('should register correct local-bounds with an item that has already had its parent Container transformed', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

    	var graphics = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);//texture);


        parent.addChild(container);
        container.addChild(graphics);

	    container.position.x = 100;
    	container.position.y = 100;

        var bounds = container.getLocalBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);



    });

	it('should register correct local-bounds with a Mesh', function() {
	        var parent = new PIXI.Container();

	    	var texture = PIXI.RenderTexture.create(10, 10);

	        var plane = new PIXI.mesh.Plane(texture);

	        parent.addChild(plane);

		    plane.position.x = 20;
	    	plane.position.y = 20;

	        var bounds = plane.getLocalBounds();

	        expect(bounds.x).to.equal(0);
	        expect(bounds.y).to.equal(0);
	        expect(bounds.width).to.equal(10);
	        expect(bounds.height).to.equal(10);


	    });
	});
