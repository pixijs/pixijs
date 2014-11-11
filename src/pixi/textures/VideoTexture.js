
PIXI.VideoTexture = function( source, scaleMode )
{
    if( !source ){
        throw new Error( 'No video source element specified.' );
    }

    // hook in here to check if video is already available.
    // PIXI.BaseTexture looks for a source.complete boolean, plus width & height.

    if( (source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA ) && source.width && source.height )
    {
        source.complete = true;
    }

    PIXI.BaseTexture.call( this, source, scaleMode );

    this.autoUpdate = false;
    this.updateBound = this._onUpdate.bind(this);

    if( !source.complete )
    {
        this._onCanPlay = this.onCanPlay.bind(this);

        source.addEventListener( 'canplay', this._onCanPlay );
        source.addEventListener( 'canplaythrough', this._onCanPlay );

        // started playing..
        source.addEventListener( 'play', this.onPlayStart.bind(this) );
        source.addEventListener( 'pause', this.onPlayStop.bind(this) );
    }

};

PIXI.VideoTexture.prototype   = Object.create( PIXI.BaseTexture.prototype );

PIXI.VideoTexture.constructor = PIXI.VideoTexture;

PIXI.VideoTexture.prototype._onUpdate = function()
{
    if(this.autoUpdate)
    {
        window.requestAnimationFrame(this.updateBound);
        this.dirty();
    }
};

PIXI.VideoTexture.prototype.onPlayStart = function()
{
    if(!this.autoUpdate)
    {
        window.requestAnimationFrame(this.updateBound);
        this.autoUpdate = true;
    }
};

PIXI.VideoTexture.prototype.onPlayStop = function()
{
    this.autoUpdate = false;
};

PIXI.VideoTexture.prototype.onCanPlay = function()
{
    if( event.type === 'canplaythrough' )
    {
        this.hasLoaded  = true;


        if( this.source )
        {
            this.source.removeEventListener( 'canplay', this._onCanPlay );
            this.source.removeEventListener( 'canplaythrough', this._onCanPlay );

            this.width      = this.source.videoWidth;
            this.height     = this.source.videoHeight;

            // prevent multiple loaded dispatches..
            if( !this.__loaded ){
                this.__loaded = true;
                this.dispatchEvent( { type: 'loaded', content: this } );
            }
        }
    }
};


/**
 * Mimic Pixi BaseTexture.from.... method.
 * @param video
 * @param scaleMode
 * @returns {PIXI.VideoTexture}
 */
PIXI.VideoTexture.baseTextureFromVideo = function( video, scaleMode )
{
    if( !video._pixiId )
    {
        video._pixiId = 'video_' + PIXI.TextureCacheIdGenerator++;
    }

    var baseTexture = PIXI.BaseTextureCache[ video._pixiId ];

    if( !baseTexture )
    {
        baseTexture = new PIXI.VideoTexture( video, scaleMode );
        PIXI.BaseTextureCache[ video._pixiId ] = baseTexture;
    }

    return baseTexture;
};


PIXI.VideoTexture.prototype.destroy = function()
{
    if( this.source && this.source._pixiId )
    {
        PIXI.BaseTextureCache[ this.source._pixiId ] = null;
        delete PIXI.BaseTextureCache[ this.source._pixiId ];

        this.source._pixiId = null;
        delete this.source._pixiId;
    }

    PIXI.BaseTexture.prototype.destroy.call( this );
};

/**
 * Mimic PIXI Texture.from... method.
 * @param video
 * @param scaleMode
 * @returns {PIXI.Texture}
 */
PIXI.VideoTexture.textureFromVideo = function( video, scaleMode )
{
    var baseTexture = PIXI.VideoTexture.baseTextureFromVideo( video, scaleMode );
    return new PIXI.Texture( baseTexture );
};

PIXI.VideoTexture.fromUrl = function( videoSrc, scaleMode )
{
    var video = document.createElement('video');
    video.src = videoSrc;
    video.autoPlay = true;
    video.play();
    return PIXI.VideoTexture.textureFromVideo( video, scaleMode);
};

