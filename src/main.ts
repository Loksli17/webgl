import Engine      from './core/Engine';
import type INode  from './core/Node/INode';
import Node        from './core/Node/Node';
import type IScene from './core/Scene/IScene';
import Scene       from './core/Scene/Scene';
import Matrix3x3   from './math/Matrix3x3';
import Vec2        from './math/Vector2';


import type { NODE_TYPE } from './core/Node/NodeType';

import './style.css'
import { handleUITexture } from './ui';

import fragmentColorShaderSource from'./render/programs/colorProgram/fs.glsl?raw';
import colorVertexShaderSource   from './render/programs/colorProgram/vs.glsl?raw';

import fragmentTextureShaderSource from'./render/programs/textureProgram/fs.glsl?raw';
import textureVertexShaderSource   from './render/programs/textureProgram/vs.glsl?raw';
import { makeShader, makeShaderProgram } from './render/utils';



interface IShaderProgramDTO
{
    name         : NODE_TYPE;
    vShaderSource: string;
    fShaderSource: string;
}


interface ProgramProxy
{
    program: WebGLProgram;
    type   : NODE_TYPE;
}



const makeShaderPrograms = (gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO[]): ProgramProxy[] => 
{
    const proxy: ProgramProxy[] = [];
    
    for (let i = 0; i < programsDTO.length; i++)
    {
        const vertexShader   = makeShader(gl, programsDTO[i].vShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = makeShader(gl, programsDTO[i].fShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader)
        {
            console.error(`Error with vertex shader of program with name ${programsDTO[i].name}`);
            return [];
        }

        if (!fragmentShader)
        {
            console.error(`Error with fragment shader of program with name ${programsDTO[i].name}`);
            return [];
        }

        const program = makeShaderProgram(gl, vertexShader, fragmentShader);

        if (!program) return [];

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        proxy.push({program, type: programsDTO[i].name});
    }

    return proxy;
}



const renderScene = (scene: IScene, gl: WebGLRenderingContext) => 
{
    const sceneColor = scene.getColor();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(sceneColor.r, sceneColor.g, sceneColor.b, sceneColor.a);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
}



const render = (
    scene    : IScene, 
    gl       : WebGLRenderingContext, 
    programs : ProgramProxy[], 
    renderers: ((gl: WebGLRenderingContext, program: WebGLProgram, nodes: INode[]) => void)[]
) => 
{
    if (!gl) return;

    renderScene(scene, gl);

    for (let i = 0; i < programs.length; i++)
    {
        gl.useProgram(programs[i].program);
        renderers[i](gl, programs[i].program, scene.getViewportNodes(programs[i].type));
    }
}



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

    const scene = new Scene()
    Engine.Instance().insertScene(scene);

    makeNodes(scene, 50);
    handleUITexture(scene);

    const programsDTO: IShaderProgramDTO[] = 
    [
        {
            name         : 'COLOR', 
            vShaderSource: colorVertexShaderSource, 
            fShaderSource: fragmentColorShaderSource,
        },

        {
            name         : 'TEXTURE', 
            vShaderSource: textureVertexShaderSource, 
            fShaderSource: fragmentTextureShaderSource,
        },
    ];


    const projectionMatrix = new Matrix3x3(
    [
        2 / gl.canvas.width,                     0, 0,
                          0, -2 / gl.canvas.height, 0,
                         -1,                     1, 1  
    ]);


    const cameraMatrix = new Matrix3x3();


    const renderers = 
    [
        //todo vertexBuffer to func
        
        (gl: WebGLRenderingContext, program: WebGLProgram, nodes: INode[]) => 
        {
            const projectionMatrixUniform = gl.getUniformLocation(program, 'uMatP');
            const cameraMatrixUniform     = gl.getUniformLocation(program, 'uMatV');
            const localMatrixUniform      = gl.getUniformLocation(program, 'uMat');
            const colorUniform            = gl.getUniformLocation(program, 'uColor');
            
            const positionAttributeLocation = gl.getAttribLocation(program, "aPos");
            const vertexBuffer              = gl.createBuffer();


            // const texture     = gl.createTexture();
            // const frameBuffer = gl.createFramebuffer();

            // gl.bindTexture(gl.TEXTURE_2D, texture);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            // gl.texImage2D(
            //     gl.TEXTURE_2D,
            //     0,
            //     gl.RGBA,
            //     gl.canvas.width,
            //     gl.canvas.height,
            //     0,
            //     gl.RGBA,
            //     gl.UNSIGNED_BYTE,
            //     null
            // );

            // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

            // //геометрия вся херня
            // //this.drawArrays

            // gl.bindFramebuffer(gl.FRAMEBUFFER, null);


            gl.uniformMatrix3fv(projectionMatrixUniform, false, projectionMatrix.elements);
            gl.uniformMatrix3fv(cameraMatrixUniform,     false, cameraMatrix.elements);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            for (let i = 0; i < nodes.length; i++)
            {   
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nodes[i].getGeometry()), gl.STATIC_DRAW);
                gl.uniformMatrix3fv(localMatrixUniform, false, nodes[i].getLocalMatrix().elements);
                gl.uniform4f(colorUniform, nodes[i].getColor().r, nodes[i].getColor().g, nodes[i].getColor().b, nodes[i].getColor().a);
                
                gl.drawArrays(gl.TRIANGLES, 0, nodes[i].getGeometry().length / 2);
            }

            //todo remove buffer
        },

        (gl: WebGLRenderingContext, program: WebGLProgram, nodes: INode[]) => 
        {
            const texture = gl.createTexture();

            const projectionMatrixUniform = gl.getUniformLocation(program, 'uMatP');
            const cameraMatrixUniform     = gl.getUniformLocation(program, 'uMatV');
            const localMatrixUniform      = gl.getUniformLocation(program, 'uMat');
            const textureLocation         = gl.getUniformLocation(program, 'uTexture');

            const positionAttributeLocation = gl.getAttribLocation(program, "aPos");
            const vertexBuffer              = gl.createBuffer();

            const texPositionAttributeLocation = gl.getAttribLocation(program, "aTexPos");
            const texVertexBuffer              = gl.createBuffer();

            gl.uniformMatrix3fv(projectionMatrixUniform, false, projectionMatrix.elements);
            gl.uniformMatrix3fv(cameraMatrixUniform,     false, cameraMatrix.elements);

            for (let i = 0; i < nodes.length; i++)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nodes[i].getGeometry()), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(positionAttributeLocation);
                gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, texVertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(texPositionAttributeLocation);
                gl.vertexAttribPointer(texPositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

                gl.uniformMatrix3fv(localMatrixUniform, false, nodes[i].getLocalMatrix().elements);

                const image = nodes[i].getTexture();

                if (image)
                {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                    gl.uniform1i(textureLocation, 0);
                }

                gl.drawArrays(gl.TRIANGLES, 0, nodes[i].getGeometry().length / 2);
            }

            // gl.deleteBuffer(texVertexBuffer);
            // gl.deleteBuffer(vertexBuffer);
            gl.deleteTexture(texture);
        },
    ];
    
    const programs = makeShaderPrograms(gl, programsDTO);

    const processRender = () => 
    {
        render(scene, gl, programs, renderers);
        requestAnimationFrame(processRender)  
    }

    requestAnimationFrame(processRender);
}


main();

