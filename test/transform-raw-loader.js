module.exports = {
    process: (content) => ({ code: `module.exports = ${JSON.stringify(content)}` })
};
