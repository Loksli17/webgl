import Engine      from './core/Engine';
import Node        from './core/Node/Node';
import type IScene from './core/Scene/IScene';
import Scene       from './core/Scene/Scene';
import Vec2        from './math/Vector2';

import ColorProgramRenderer   from './render/programs/colorProgram/ColorProgramRenderer';
import TextureProgramRenderer from './render/programs/textureProgram/TextureProgramRenderer';


import './style.css'
import { handleUITexture } from './ui';

import colorVertexShaderSource     from './render/programs/colorProgram/vs.glsl?raw';
import colorFragmentShaderSource   from './render/programs/colorProgram/fs.glsl?raw';
import textureVertexShaderSource   from './render/programs/colorProgram/vs.glsl?raw';
import textureFragmentShaderSource from './render/programs/colorProgram/fs.glsl?raw';



const makeNodes = (scene: IScene, nodesAmount: number) => 
{
    const size = 50;
    const gap  = 50;
    const maxX = 1400;

    let x = size;
    let y = size;

    for (let i = 0; i < nodesAmount; i++)
    {
        scene.insertNode(
            new Node(
                new Vec2(size, size), 
                new Vec2(x, y),
                {r: Math.random(), g: Math.random(), b: Math.random(), a: 1},
            )
        );

        x += size + gap;
        
        if (maxX <= x)
        {
            y += size + gap;
            x = size;
        }
    }
}






const main = () => 
{    
    const canvas = document.querySelector('#canvas-gl') as HTMLCanvasElement;
    const gl     = canvas.getContext('webgl');

    if (!gl)
    {
        console.error('errors with gl');
        return;
    }

    Engine.makeInstance(gl, 
    [
        {
            type         : 'COLOR', 
            vShaderSource: colorVertexShaderSource, 
            fShaderSource: colorFragmentShaderSource,
            renderer     : new ColorProgramRenderer(),
        },

        {
            type         : 'TEXTURE', 
            vShaderSource: textureVertexShaderSource, 
            fShaderSource: textureFragmentShaderSource,
            renderer     : new TextureProgramRenderer(),
        },
    ])

    const scene = new Scene(gl.canvas.width, gl.canvas.height);
    Engine.Instance().insertScene(scene);

    makeNodes(scene, 50);
    handleUITexture(scene);

    const processRender = () => 
    {
        Engine.Instance().render();
        requestAnimationFrame(processRender)  
    }

    requestAnimationFrame(processRender);
}


main();

