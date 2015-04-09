var Resource = require('resource-loader').Resource,
    async = require('async'),
    spine = require('pixi-spine');

module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data
        if (!resource.data || !resource.data.bones)
        {
            return next();
        }

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
        var baseUrl = resource.url.substr(0, resource.url.lastIndexOf('/') + 1);


        this.add(resource.name + '_atlas', atlasPath, atlasOptions, function (res)
        {
            // create a spine atlas using the loaded text
            var spineAtlas = new spine.SpineRuntime.Atlas(this.xhr.responseText, baseUrl, res.crossOrigin);

            // spine animation
            var spineJsonParser = new spine.SpineRuntime.SkeletonJsonParser(new spine.SpineRuntime.AtlasAttachmentParser(spineAtlas));
            var skeletonData = spineJsonParser.readSkeletonData(resource.data);

            resource.spineData = skeletonData;
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
    };
};
