const wedocConfig = require("@pixi/webdoc-docusaurus-template/docusaurus/config.js")
const config = {
    title: "PixiJS",
    url: "https://pixijs.download/",
    baseUrl: "/",
    onBrokenLinks: "ignore",
    onBrokenMarkdownLinks: "ignore",
    presets: [
        [
            "classic",
            ({
                theme: { customCss: wedocConfig.cssLocation, },
                docs: { path: "docusaurus/api", routeBasePath: "/" },
            }),
        ],
    ],
    themeConfig: { prism: wedocConfig.themes },
};

module.exports = config;
