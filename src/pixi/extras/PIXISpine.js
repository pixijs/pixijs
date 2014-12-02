/* Esoteric Software SPINE wrapper for pixi.js */

spine.Bone.yDown = true;
PIXI.AnimCache = {};

/**
 * Supporting class to load images from spine atlases as per spine spec.
 *
 * @class SpineTextureLoader
 * @uses EventTarget
 * @constructor
 * @param basePath {String} Tha base path where to look for the images to be loaded
 * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
 */
PIXI.SpineTextureLoader = function(basePath, crossorigin)
{
    PIXI.EventTarget.call(this);

    this.basePath = basePath;
    this.crossorigin = crossorigin;
    this.loadingCount = 0;
};

/* constructor */
PIXI.SpineTextureLoader.prototype = PIXI.SpineTextureLoader;

/**
 * Starts loading a base texture as per spine specification
 *
 * @method load
 * @param page {spine.AtlasPage} Atlas page to which texture belongs
 * @param file {String} The file to load, this is just the file path relative to the base path configured in the constructor
 */
PIXI.SpineTextureLoader.prototype.load = function(page, file)
{
    page.rendererObject = PIXI.BaseTexture.fromImage(this.basePath + '/' + file, this.crossorigin);
    if (!page.rendererObject.hasLoaded)
    {
        var scope = this;
        ++scope.loadingCount;
        page.rendererObject.addEventListener('loaded', function(){
            --scope.loadingCount;
            scope.dispatchEvent({
                type: 'loadedBaseTexture',
                content: scope
            });
        });
    }
};

/**
 * Unloads a previously loaded texture as per spine specification
 *
 * @method unload
 * @param texture {BaseTexture} Texture object to destroy
 */
PIXI.SpineTextureLoader.prototype.unload = function(texture)
{
    texture.destroy(true);
};

/**
 * A class that enables the you to import and run your spine animations in pixi.
 * Spine animation data needs to be loaded using the PIXI.AssetLoader or PIXI.SpineLoader before it can be used by this class
 * See example 12 (http://www.goodboydigital.com/pixijs/examples/12/) to see a working example and check out the source
 *
 * @class Spine
 * @extends DisplayObjectContainer
 * @constructor
 * @param url {String} The url of the spine anim file to be used
 */
PIXI.Spine = function (url) {
    PIXI.DisplayObjectContainer.call(this);

    this.spineData = PIXI.AnimCache[url];

    if (!this.spineData) {
        throw new Error('Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: ' + url);
    }

    this.skeleton = new spine.Skeleton(this.spineData);
    this.skeleton.updateWorldTransform();

    this.stateData = new spine.AnimationStateData(this.spineData);
    this.state = new spine.AnimationState(this.stateData);

    this.slotContainers = [];

    for (var i = 0, n = this.skeleton.drawOrder.length; i < n; i++) {
        var slot = this.skeleton.drawOrder[i];
        var attachment = slot.attachment;
        var slotContainer = new PIXI.DisplayObjectContainer();
        this.slotContainers.push(slotContainer);
        this.addChild(slotContainer);

        if (attachment instanceof spine.RegionAttachment)
        {
            var spriteName = attachment.rendererObject.name;
            var sprite = this.createSprite(slot, attachment);
            slot.currentSprite = sprite;
            slot.currentSpriteName = spriteName;
            slotContainer.addChild(sprite);
        }
        else if (attachment instanceof spine.MeshAttachment)
        {
            var mesh = this.createMesh(slot, attachment);
            slot.currentMesh = mesh;
            slot.currentMeshName = attachment.name;
            slotContainer.addChild(mesh);
        }
        else
        {
            continue;
        }

    }

    this.autoUpdate = true;
};

PIXI.Spine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
PIXI.Spine.prototype.constructor = PIXI.Spine;

/**
 * If this flag is set to true, the spine animation will be autoupdated every time
 * the object id drawn. The down side of this approach is that the delta time is
 * automatically calculated and you could miss out on cool effects like slow motion,
 * pause, skip ahead and the sorts. Most of these effects can be achieved even with
 * autoupdate enabled but are harder to achieve.
 *
 * @property autoUpdate
 * @type { Boolean }
 * @default true
 */
Object.defineProperty(PIXI.Spine.prototype, 'autoUpdate', {
    get: function()
    {
        return (this.updateTransform === PIXI.Spine.prototype.autoUpdateTransform);
    },

    set: function(value)
    {
        this.updateTransform = value ? PIXI.Spine.prototype.autoUpdateTransform : PIXI.DisplayObjectContainer.prototype.updateTransform;
    }
});

/**
 * Update the spine skeleton and its animations by delta time (dt)
 *
 * @method update
 * @param dt {Number} Delta time. Time by which the animation should be updated
 */
PIXI.Spine.prototype.update = function(dt)
{
    this.state.update(dt);
    this.state.apply(this.skeleton);
    this.skeleton.updateWorldTransform();

    var drawOrder = this.skeleton.drawOrder;
    for (var i = 0, n = drawOrder.length; i < n; i++) {
        var slot = drawOrder[i];
        var attachment = slot.attachment;
        var slotContainer = this.slotContainers[i];

        if (!attachment)
        {
            slotContainer.visible = false;
            continue;
        }

        var type = attachment.type;
        if (type === spine.AttachmentType.region)
        {
            if (attachment.rendererObject)
            {
                if (!slot.currentSpriteName || slot.currentSpriteName !== attachment.name)
                {
                    var spriteName = attachment.rendererObject.name;
                    if (slot.currentSprite !== undefined)
                    {
                        slot.currentSprite.visible = false;
                    }
                    slot.sprites = slot.sprites || {};
                    if (slot.sprites[spriteName] !== undefined)
                    {
                        slot.sprites[spriteName].visible = true;
                    }
                    else
                    {
                        var sprite = this.createSprite(slot, attachment);
                        slotContainer.addChild(sprite);
                    }
                    slot.currentSprite = slot.sprites[spriteName];
                    slot.currentSpriteName = spriteName;
                }
            }

            var bone = slot.bone;

            slotContainer.position.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
            slotContainer.position.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
            slotContainer.scale.x = bone.worldScaleX;
            slotContainer.scale.y = bone.worldScaleY;

            slotContainer.rotation = -(slot.bone.worldRotation * spine.degRad);

            slot.currentSprite.tint = PIXI.rgb2hex([slot.r,slot.g,slot.b]);
        }
        else if (type === spine.AttachmentType.skinnedmesh)
        {
            if (!slot.currentMeshName || slot.currentMeshName !== attachment.name)
            {
                var meshName = attachment.name;
                if (slot.currentMesh !== undefined)
                {
                    slot.currentMesh.visible = false;
                }

                slot.meshes = slot.meshes || {};

                if (slot.meshes[meshName] !== undefined)
                {
                    slot.meshes[meshName].visible = true;
                }
                else
                {
                    var mesh = this.createMesh(slot, attachment);
                    slotContainer.addChild(mesh);
                }

                slot.currentMesh = slot.meshes[meshName];
                slot.currentMeshName = meshName;
            }

            attachment.computeWorldVertices(slot.bone.skeleton.x, slot.bone.skeleton.y, slot, slot.currentMesh.vertices);

        }
        else
        {
            slotContainer.visible = false;
            continue;
        }
        slotContainer.visible = true;

        slotContainer.alpha = slot.a;
    }
};

/**
 * When autoupdate is set to yes this function is used as pixi's updateTransform function
 *
 * @method autoUpdateTransform
 * @private
 */
PIXI.Spine.prototype.autoUpdateTransform = function () {
    this.lastTime = this.lastTime || Date.now();
    var timeDelta = (Date.now() - this.lastTime) * 0.001;
    this.lastTime = Date.now();

    this.update(timeDelta);

    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
};

/**
 * Create a new sprite to be used with spine.RegionAttachment
 *
 * @method createSprite
 * @param slot {spine.Slot} The slot to which the attachment is parented
 * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
 * @private
 */
PIXI.Spine.prototype.createSprite = function (slot, attachment) {
    var descriptor = attachment.rendererObject;
    var baseTexture = descriptor.page.rendererObject;
    var spriteRect = new PIXI.Rectangle(descriptor.x,
                                        descriptor.y,
                                        descriptor.rotate ? descriptor.height : descriptor.width,
                                        descriptor.rotate ? descriptor.width : descriptor.height);
    var spriteTexture = new PIXI.Texture(baseTexture, spriteRect);
    var sprite = new PIXI.Sprite(spriteTexture);

    var baseRotation = descriptor.rotate ? Math.PI * 0.5 : 0.0;
    sprite.scale.set(descriptor.width / descriptor.originalWidth, descriptor.height / descriptor.originalHeight);
    sprite.rotation = baseRotation - (attachment.rotation * spine.degRad);
    sprite.anchor.x = sprite.anchor.y = 0.5;

    slot.sprites = slot.sprites || {};
    slot.sprites[descriptor.name] = sprite;
    return sprite;
};

PIXI.Spine.prototype.createMesh = function (slot, attachment) {
    var descriptor = attachment.rendererObject;
    var baseTexture = descriptor.page.rendererObject;
    var texture = new PIXI.Texture(baseTexture);

    var strip = new PIXI.Strip(texture);
    strip.drawMode = PIXI.Strip.DrawModes.TRIANGLES;
    strip.canvasPadding = 1.5;

    strip.vertices = new PIXI.Float32Array(attachment.uvs.length);
    strip.uvs = attachment.uvs;
    strip.indices = attachment.triangles;

    slot.meshes = slot.meshes || {};
    slot.meshes[attachment.name] = strip;

    return strip;
};
