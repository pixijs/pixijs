---
title: Overview
category: scene
---

# Scene

This is where you'll find all the display objects available in Pixi.
All display objects inherit from the {@link Container} class. You can use a `Container` for simple grouping of
other display objects. Here's all the available display object classes.

-   {@link Container} is the base class for all display objects that act as a container for other objects.
    -   {@link Sprite} is a display object that uses a texture
        -   {@link AnimatedSprite} is a sprite that can play animations
    -   {@link TilingSprite} a fast way of rendering a tiling image
    -   {@link NineSliceSprite} allows you to stretch a texture using 9-slice scaling
    -   {@link Graphics} is a graphic object that can be drawn to the screen.
    -   {@link Mesh} empowers you to have maximum flexibility to render any kind of visuals you can think of
        -   {@link MeshSimple} mimics Mesh, providing easy-to-use constructor arguments
        -   {@link MeshPlane} allows you to draw a texture across several points and then manipulate these points
        -   {@link MeshRope} allows you to draw a texture across several points and then manipulate these points
    -   {@link Text} render text using custom fonts
        -   {@link BitmapText} render text using a bitmap font
        -   {@link HTMLText} render text using HTML and CSS
