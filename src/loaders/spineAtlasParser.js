var Resource = require('asset-loader').Resource,
    async = require('async'),
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
            var atlasOptions = {
                crossOrigin: resource.crossOrigin,
                xhrType: Resource.XHR_RESPONSE_TYPE.TEXT
            };

            this.loadResource(new Resource(atlasPath, atlasOptions), function (res)
            {
                // create a spine atlas using the loaded text
                var spineAtlas = new spine.Atlas(this.ajaxRequest.responseText, this.baseUrl, res.crossOrigin);

                // spine animation
                var spineJsonParser = new spine.SkeletonJsonParser(new spine.AtlasAttachmentParser(spineAtlas));
                var skeletonData = spineJsonParser.readSkeletonData(resource.data);

                // core.utils.AnimCache[originalLoader.url] = skeletonData;

                resource.spine = skeletonData;
                resource.spineAtlas = spineAtlas;

                // Go through each spineAtlas.pages and wait for page.rendererObject (a baseTexture) to
                // load. Once all loaded, then call the next function.
                async.each(spineAtlas.pages, function (page, done)
                {
                    if (page.rendererObject.hasLoaded)
                    {
                        done();
                    }
                    else
                    {
                        page.rendererObject.once('loaded', done);
                    }
                }, next);
            });
        }
        else {
            next();
        }
    };
};
