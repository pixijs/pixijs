'use strict';

require('../../dist/pixi');
PIXI.utils.skipHello();

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const remote = electron.remote;
const clipboard = electron.clipboard;
const dialog = remote.dialog;
const Renderer = require('../../test/renders/lib/Renderer');
const Droppable = require('./droppable');
const $ = document.querySelector.bind(document);

// Feature parity with floss: chai, sinon, sinon-chai
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

global.chai = chai;
global.sinon = sinon;
global.should = chai.should;
global.assert = chai.assert;
global.expect = chai.expect;
global.chai.use(sinonChai);

// Create the renderer to convert the json into
// a JSON solution which can be used by testing
const renderer = new Renderer(
    $('#view-webgl'),
    $('#view-canvas')
);

// Clicking on the solution copies it to the clipboard
const solution = $('#solution');

// Current filename
let currentName;
let currentPath;

// drag-n-drop
new Droppable($('body'), (err, file) => // eslint-disable-line no-new
{
    if (err)
    {
        dialog.showErrorBox('Drop Error', err.message);
    }
    else if (!(/\.js$/).test(file))
    {
        dialog.showErrorBox('Invalid Filetype', 'The specified file must be a ".js" file.');
    }
    else
    {
        open(file);
    }
});

// Click on the chooser button to browser for file
$('#choose').addEventListener('click', () =>
{
    dialog.showOpenDialog({
        filters: [{
            name: 'JavaScript',
            extensions: ['js'],
        }],
    },
    (fileNames) =>
    {
        if (fileNames)
        {
            open(fileNames[0]);
        }
    });
});

const save = $('#save');

save.addEventListener('click', () =>
{
    dialog.showSaveDialog({
        title: 'Save Solution',
        defaultPath: path.join(currentPath, `${currentName}.json`),
        filters: [{
            name: 'JSON',
            extensions: ['json'],
        }],
    }, (fileName) =>
    {
        if (fileName)
        {
            fs.writeFileSync(fileName, solution.innerHTML);
        }
    });
});

let copiedId = null;

solution.addEventListener('click', () =>
{
    if (solution.innerHTML)
    {
        clipboard.writeText(solution.innerHTML);
        solution.className = 'copied';
        if (copiedId)
        {
            clearTimeout(copiedId);
            copiedId = null;
        }
        copiedId = setTimeout(() =>
        {
            solution.className = '';
            copiedId = null;
        }, 3000);
    }
});

function open(file)
{
    save.className = 'disabled';
    renderer.run(file, (err, result) =>
    {
        if (err)
        {
            dialog.showErrorBox('Invalid Output Format', err.message);
        }
        else
        {
            solution.innerHTML = JSON.stringify(result, null, '  ');
            save.className = '';
            currentName = path.basename(file, '.js');
            currentPath = path.dirname(file);
        }
    });
}
