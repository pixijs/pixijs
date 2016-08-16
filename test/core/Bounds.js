describe('getBounds', function () {

    it('should register correct width and height with a LOADED Sprite', function() {
        var parent = new PIXI.Container();
        var texture = PIXI.RenderTexture.create(10, 10);

        var sprite = new PIXI.Sprite(texture);

        parent.addChild(sprite);

        var bounds;

        bounds = sprite.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        bounds = sprite.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);


        bounds = sprite.getBounds(true);

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

    });

    it('should register correct width and height with Graphics', function() {
        var parent = new PIXI.Container();

        var graphics = new PIXI.Graphics();

        var bounds;

        bounds = graphics.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

        graphics.beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        parent.addChild(graphics);

        bounds = graphics.getBounds();

        expect(bounds.x).to.equal(-10);
        expect(bounds.y).to.equal(-10);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        graphics.position.x = 20;
        graphics.position.y = 20;

        graphics.scale.x = 2;
        graphics.scale.y = 2;

        bounds = graphics.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(40);
        expect(bounds.height).to.equal(40);

        bounds = graphics.getBounds(true);

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(40);
        expect(bounds.height).to.equal(40);

    });

    it('should register correct width and height with an empty Container', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        parent.addChild(container);

        var bounds;

        bounds = container.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);

        container.position.x = 20;
        container.position.y = 20;

        container.scale.x = 2;
        container.scale.y = 2;

        bounds = container.getBounds();

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

        var bounds;

        bounds = container.getBounds();

        expect(bounds.x).to.equal(30);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(80);
        expect(bounds.height).to.equal(90);

        container.rotation = 0.1;

        bounds = container.getBounds();

        expect(bounds.x | 0).to.equal(26);
        expect(bounds.y | 0).to.equal(22);
        expect(bounds.width | 0).to.equal(73);
        expect(bounds.height | 0).to.equal(97);

        bounds = container.getBounds(true);

        expect(bounds.x | 0).to.equal(26);
        expect(bounds.y | 0).to.equal(22);
        expect(bounds.width | 0).to.equal(73);
        expect(bounds.height | 0).to.equal(97);


    });

    it('should register correct width and height with an item that has already had its parent Container transformed', function() {
        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        var graphics = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 10, 10);//texture);


        parent.addChild(container);
        container.addChild(graphics);

        container.position.x = 100;
        container.position.y = 100;

        var bounds;

        bounds = container.getBounds();

        expect(bounds.x).to.equal(100);
        expect(bounds.y).to.equal(100);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        bounds = graphics.getBounds(true);

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

        var bounds;

        bounds = plane.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        plane.scale.x = 2;
        plane.scale.y = 2;

        bounds = plane.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

    });

    it('should register correct width and height with an a DisplayObject is visible false', function() {

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

        graphics.visible = false;

        var bounds;

        bounds = container.getBounds();

        expect(bounds.x).to.equal(30);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(10);
        expect(bounds.height).to.equal(10);

        container.visible = false;

        bounds = container.getBounds();

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.equal(0);
        expect(bounds.height).to.equal(0);


    });

    it('should register correct width and height with an a DisplayObject parent has moved', function() {

        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        var graphics = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10);//texture);

        container.addChild(graphics);

        parent.addChild(container);

      //  graphics.position.x = 100;
      //  graphics.position.y = 100;
        container.position.x -= 100;
        container.position.y -= 100;

        var bounds = graphics.getBounds();

        expect(bounds.x).to.equal(-110);
        expect(bounds.y).to.equal(-110);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);


    });

    it('should register correct width and height with an a Text Object', function() {

        var parent = new PIXI.Container();

        var container = new PIXI.Container();//Graphics().beginFill(0xFF0000).drawCircle(0, 0, 10, 10);//texture);

        var text = new PIXI.Text('i am some text');

        container.addChild(text);

        parent.addChild(container);

        var bounds;

        bounds = text.getBounds();
        var bx = bounds.width;

        expect(bounds.x).to.equal(0);
        expect(bounds.y).to.equal(0);
        expect(bounds.width).to.be.greaterThan(0);
        expect(bounds.height).to.greaterThan(0);

        text.text = 'hello!';

        bounds = text.getBounds();

        // this variable seems to be different on different devices. a font thing?
        expect(bounds.width).to.not.equal(bx);

    });

    it('should return a different rectangle if getting local bounds after global bounds ', function() {

        var parent = new PIXI.Container();
        var texture = PIXI.RenderTexture.create(10, 10);
        var sprite = new PIXI.Sprite(texture);

        sprite.position.x = 20;
        sprite.position.y = 20;

        sprite.scale.x = 2;
        sprite.scale.y = 2;

        parent.addChild(sprite);

        var bounds = sprite.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);

        var localBounds = sprite.getLocalBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(20);
        expect(bounds.height).to.equal(20);
    });

    it('should ensure bounds respect the trim of a texture ', function() {

        var parent = new PIXI.Container();
        var baseTexture = new PIXI.BaseRenderTexture(100, 100);

        var orig = new PIXI.Rectangle(0,0,100,50);
        var frame = new PIXI.Rectangle(2,2,50,50);
        var trim = new PIXI.Rectangle(25,0,50,50);

        var trimmedTexture = new PIXI.Texture(baseTexture, frame, orig, trim);

        var sprite = new PIXI.Sprite(trimmedTexture);

        sprite.position.x = 20;
        sprite.position.y = 20;

        parent.addChild(sprite);

        var bounds = sprite.getBounds();

        expect(bounds.x).to.equal(20);
        expect(bounds.y).to.equal(20);
        expect(bounds.width).to.equal(100);
        expect(bounds.height).to.equal(50);

    });
});