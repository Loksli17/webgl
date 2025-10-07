import Engine from './core/Engine';
import type INode from './core/Node/INode';
import Node from './core/Node/Node';
import type IScene from './core/Scene/IScene';
import Scene from './core/Scene/Scene';
import Matrix3x3 from './math/Matrix3x3';
import Vec2 from './math/Vector2';
import './style.css'



const fragmentShaderSource: string = 
`precision mediump float;
    
    uniform vec4 uColor;

    void main(void)
    {
        gl_FragColor = uColor;
    }
`;


const simpleVertexShaderSource: string = 
`
    attribute vec2 aPos;

    uniform mat3 uMatP;
    uniform mat3 uMatV;
    uniform mat3 uMat;
    
    void main()
    {
        vec2 pos = (uMatP * uMatV * uMat * vec3(aPos, 1)).xy;
        gl_Position = vec4(pos, 0, 1);
    }
`;


/**
 * 
 * @param gl 
 * @param source 
 * @param type 
 * @returns 
 */
const makeShader = (gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null =>
{
    const shader: WebGLShader | null = gl.createShader(type);

    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.error(`Shader wasn't compile ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


/**
 * 
 * @param gl 
 * @param vShader 
 * @param fShader 
 * @returns 
 */
const makeShaderProgram = (gl: WebGLRenderingContext, vShader: WebGLShader, fShader: WebGLShader): WebGLProgram | null => 
{
    const program: WebGLProgram = gl.createProgram();
    
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error(`Shader program has not been inited`);
        gl.deleteProgram(program);
        return null;
    }

    return program;
}



interface IShaderProgramDTO
{
    name         : string;
    vShaderSource: string;
    fShaderSource: string;
}


const makeShaderPrograms = (gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO[]) => 
{
    const programs: WebGLProgram[] = [];
    
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

        gl.useProgram(program);

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        programs.push(program);
    }

    return programs;
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
    programs : WebGLProgram[], 
    renderers: ((gl: WebGLRenderingContext, program: WebGLProgram, nodes: INode[]) => void)[]
) => 
{
    if (!gl) return;

    renderScene(scene, gl);

    for (let i = 0; i < programs.length; i++)
    {
        renderers[i](gl, programs[i], scene.getViewportNodes());
    }
}



const makeNodes = (scene: IScene) => 
{
    const nodesAmount = 100;

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

        console.log(scene.getViewportNodes()[scene.getViewportNodes().length - 1].getColor());

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

    makeNodes(scene);

    const programsDTO: IShaderProgramDTO[] = 
    [
        {
            name         : 'Graphics', 
            vShaderSource: simpleVertexShaderSource, 
            fShaderSource: fragmentShaderSource,
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
            
            gl.uniformMatrix3fv(projectionMatrixUniform, false, projectionMatrix.elements);
            gl.uniformMatrix3fv(cameraMatrixUniform,     false, cameraMatrix.elements);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            for (let i = 0; i < nodes.length; i++)
            {   
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nodes[i].getGeometry()), gl.STATIC_DRAW);

                gl.uniformMatrix3fv(localMatrixUniform, false, new Matrix3x3().elements);
                gl.uniformMatrix3fv(localMatrixUniform, false, nodes[i].getLocalMatrix().elements);

                gl.uniform4f(colorUniform, nodes[i].getColor().r, nodes[i].getColor().g, nodes[i].getColor().b, nodes[i].getColor().a);
                
                gl.drawArrays(gl.TRIANGLES, 0, nodes[i].getGeometry().length / 2);
            }
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

