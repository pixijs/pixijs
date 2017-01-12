'use strict';

/**
 * Add drag-n-drop handling
 * @class Droppable
 */
class Droppable
{
    /**
     * @constructor
     * @param {HTMLElement} node Element to listen on
     * @param {Function} callback Callback when complete
     */
    constructor(node, callback)
    {
        node.addEventListener('dragenter', (ev) =>
        {
            ev.preventDefault();
            node.className = Droppable.CLASS_NAME;
        });

        node.addEventListener('dragover', (ev) =>
        {
            ev.preventDefault();
            if (node.className !== Droppable.CLASS_NAME)
            {
                node.className = Droppable.CLASS_NAME;
            }
        });

        node.addEventListener('dragleave', (ev) =>
        {
            ev.preventDefault();
            node.className = '';
        });

        node.addEventListener('drop', (ev) =>
        {
            ev.preventDefault();
            node.className = '';
            const fileList = ev.dataTransfer.files;

            if (fileList.length > 1)
            {
                callback(new Error('Only one file at a time.'));
            }
            else
            {
                const file = fileList[0];

                callback(null, file.path);
            }
        });
    }

    /**
     * The name of the class to add to the HTML node
     * @static
     * @property {String} CLASS_NAME
     */
    static get CLASS_NAME()
    {
        return 'dragging';
    }
}

module.exports = Droppable;
