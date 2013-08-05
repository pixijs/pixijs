

class Vehicle extends PIXI.Sprite

    @WRAP   = "wrap"
    @BOUNCE = "bounce"

    edgeBehavior    : Vehicle.BOUNCE
    mass            : 1.0
    maxSpeed        : 10
    position       : null
    velocity        : null

    constructor: (texture)->
        PIXI.Sprite.call(@,texture)
        @velocity = new PIXI.Point()

    update: ()->
        
        # make sure velocity stays within max speed.
        @velocity.truncate(@maxSpeed);
        
        # add velocity to position
        @position.add(@velocity);
        #console.log @position.x, @position.y

        @rotation = @velocity.angle + 90;
        
        #handle any edge behavior
        if @edgeBehavior == Vehicle.WRAP
            @wrap()
        else if @edgeBehavior == Vehicle.BOUNCE
            @bounce()
        
        
        # rotate heading to match velocity
        #@rotation = @velocity.angle()


    bounce: ()->
        w = window
        if @stage?
            if @position.x > w.pixiStageWidth
                @position.x = w.pixiStageWidth
                @velocity.x *= -1
            else if @position.x < 0
                @position.x = 0
                @velocity.x *= -1

            if @position.y > w.pixiStageHeight
                @position.y = w.pixiStageHeight
                @velocity.y *= -1
            else if @position.y < 0
                @position.y = 0
                @velocity.y *= -1


    wrap: ()->
        w = window
        if @stage?
            @position.x = 0 if @position.x > w.pixiStageWidth
            @position.x = w.pixiStageWidth if @position.x < 0
            @position.y = 0 if @position.y > w.pixiStageHeight
            @position.y = w.pixiStageHeight if @position.y < 0
