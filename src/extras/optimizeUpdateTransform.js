var core = require('../core'),
    DisplayObject = core.DisplayObject,
    Container = core.Container;

DisplayObject.prototype.updateTransform = function (transformDirty)
{
    transformDirty = transformDirty || this.transformDirty || false;
    if(transformDirty) {
        this.displayObjectUpdateTransform();
        this.transformDirty = false;
    }
};

Container.prototype.updateTransform = function(transformDirty) {
    if (!this.visible)
    {
        return;
    }

    transformDirty = transformDirty || this.transformDirty || false;
    if(transformDirty) {
        this.displayObjectUpdateTransform();
        this.transformDirty = false;
    }

    for (var i = 0, j = this.children.length; i < j; ++i)
    {
        this.children[i].updateTransform(transformDirty);
    }
};
