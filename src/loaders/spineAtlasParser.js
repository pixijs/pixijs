var Resource = require('asset-loader').Resource,
    core = require('../core'),
    spine = require('../spine');

module.exports = function ()
{
    return function (resource, next)
    {
        // if this is a spritesheet object
        if (resource.data && resource.data.bones)
        {
            /**
             * use a bit of hackery to load the atlas file, here we assume that the .json, .atlas and .png files
             * that correspond to the spine file are in the same base URL and that the .json and .atlas files
             * have the same name
             */
            var atlasPath = resource.url.substr(0, resource.url.lastIndexOf('.')) + '.atlas';
            var atlasOptions = { crossOrigin: resource.crossOrigin, xhrType: Resource.XHR_RESPONSE_TYPE.TEXT };

            this.loadResource(new Resource(atlasPath, atlasOptions), function (res) {
                /////////////////////////////////////////////////
                // TODO: THIS IS OLD STYLE


                // create a new instance of a spine texture loader for this spine object //
                var textureLoader = new SpineTextureLoader(this.url.substring(0, this.url.lastIndexOf('/')));

                // create a spine atlas using the loaded text and a spine texture loader instance //
                var spineAtlas = new spine.Atlas(this.ajaxRequest.responseText, textureLoader);

                // now we use an atlas attachment loader //
                var attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas);

                // spine animation
                var spineJsonParser = new spine.SkeletonJson(attachmentLoader);
                var skeletonData = spineJsonParser.readSkeletonData(originalLoader.json);

                core.utils.AnimCache[originalLoader.url] = skeletonData;
                originalLoader.spine = skeletonData;
                originalLoader.spineAtlas = spineAtlas;
                originalLoader.spineAtlasLoader = atlasLoader;

                // wait for textures to finish loading if needed
                if (textureLoader.loadingCount > 0)
                {
                    textureLoader.addEventListener('loadedBaseTexture', function (evt)
                    {
                        if (evt.content.content.loadingCount <= 0)
                        {
                            originalLoader.onLoaded();
                        }
                    });
                }
                else
                {
                    originalLoader.onLoaded();
                }


                /////////////////////////////////////////////////

                next();
            });
        }
        else {
            next();
        }
    };
};
