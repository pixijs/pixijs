

class SteeredVehicle extends Vehicle
    maxForce:          1
    steeringForce:     null
    arrivalThreshold:  100
    wanderAngle:       0
    wanderDistance:    10
    wanderRadius:      5
    wanderRange:       1
    pathIndex:         0
    pathThreshold:     20
    avoidDistance:     300
    avoidBuffer:       20
    inSightDist:       200
    tooCloseDist:      60
    
    constructor: (texture)->
        @steeringForce = new PIXI.Point()
        super(texture)
    
    
    update: ->
        @steeringForce.truncate(@maxForce)
        @steeringForce.divide(@mass)
        @velocity.add(@steeringForce)
        @steeringForce = new PIXI.Point()
        super()
    
    seek:(target)->
        desiredVelocity = target.clone()
        desiredVelocity.subtract(@position)
        desiredVelocity.normalize()
        desiredVelocity.multiply(@maxSpeed)
        desiredVelocity.subtract(@velocity)
        @steeringForce.add(desiredVelocity)
    
    flee: (target)->
        desiredVelocity = target.clone()
        desiredVelocity.subtract(@position)
        desiredVelocity.normalize()
        desiredVelocity.multiply(@maxSpeed)
        desiredVelocity.subtract(@velocity)
        @steeringForce.subtract(desiredVelocity)
    
    
    wander: ()->
        center = @velocity.clone()
        center.normalize()
        center.multiply(@wanderDistance)

        offset = new PIXI.Point
        offset.length = @wanderRadius
        offset.angle = @wanderAngle

        @wanderAngle += Math.random() * @wanderRange - (@wanderRange * .5)
        
        force = center.clone()
        force.add(offset)
        @steeringForce.add(force)
    
    
    flock: (vehicles, startindex)->
        averageVelocity = @velocity.clone()
        averagePosition = new PIXI.Point()
        inSightCount = 0

        i=0
        for vehicle in vehicles
            if i<=startindex
                i++
                continue
            i++
            if vehicle != this and @inSight(vehicle)
                averageVelocity.add(vehicle.velocity)
                averagePosition.add(vehicle.position)
                if @tooClose(vehicle) 
                    @flee(vehicle.position)
                inSightCount++
        
        if inSightCount > 0
            averageVelocity.divide(inSightCount)
            averagePosition.divide(inSightCount)
            @seek(averagePosition)
            s = averageVelocity.clone()
            s.subtract(@velocity)
            @steeringForce.add(s)

    
    inSight: (vehicle)->
        if @position.dist(vehicle.position) > @inSightDist
            return false

        heading = @velocity.clone()
        heading.normalize()
        difference = vehicle.position.clone()
        difference.subtract(@position)
        dotProd = difference.dotProd(heading)
        
        if dotProd < 0
            return false
        return true
    
    tooClose: (vehicle)->
        @position.dist(vehicle.position) < @tooCloseDist
