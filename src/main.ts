import './style.css'


interface IRGBAColor
{
    r: number;
    g: number;
    b: number;
    a: number;
}


class Matrix3x3
{
    elements: number[] = 
    [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    ];


    constructor(elements?: number[])
    {
        if (elements) this.elements = elements.slice();
    }
}



interface INode
{
    geometry   : number[];
    localMatrix: Matrix3x3; 
}


interface IScene
{
    setColor(color: IRGBAColor): void;
    getColor()                 : IRGBAColor;

    insertNode(node: INode): boolean;
    removeNode(node: INode): boolean;

    getRenderNodes(): INode[];
}



class Scene implements IScene
{

    private color: IRGBAColor = { r: 0, g: 0, b: 0, a: 1 };
    private nodes: INode[]    = [];

    public setColor(color: IRGBAColor): void 
    {
        this.color = color
    }


    public getColor(): IRGBAColor 
    {
        return this.color;
    }

    
    public insertNode(node: INode): boolean 
    {
        this.nodes.push(node);
        return true;
    }
    

    public removeNode(node: INode): boolean 
    {
       const index = this.nodes.indexOf(node);
       const res   = this.nodes.splice(index, 1);

       if (res.length) return true;

       return false;
    }


    public getRenderNodes(): INode[] 
    {
        return this.nodes;    
    }

}




class Engine
{

    private static instance: Engine;

    private scenes          : IScene[] = [];
    private activeSceneIndex: number   = 0;
    

    private constructor() { };


    public static Instance(): Engine
    {
        return this.instance || (this.instance = new this()); 
    }


    public insertScene(scene: IScene)
    {
        this.scenes.push(scene);
    }


    public getActiveScene(): IScene | null
    {
        return this.scenes[this.activeSceneIndex] || null;
    }

}



const fragmentShaderSource: string = 
`
    void main(void)
    {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
        renderers[i](gl, programs[i], scene.getRenderNodes());
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
    
    scene.insertNode(
        {
            geometry:
            [
                50,  50,
                100, 50,
                100, 100,
                50, 100,
            ],

            localMatrix: new Matrix3x3(),
        },

    );

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
                          -1,                    1, 1  
    ]);


    const cameraMatrix = new Matrix3x3();


    const renderers = 
    [
        //todo vertexBuffer to func
        
        (gl: WebGLRenderingContext, program: WebGLProgram, nodes: INode[]) => 
        {
            const positionAttributeLocation = gl.getAttribLocation(program, "aPos");
            const vertexBuffer              = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nodes[0].geometry), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            const projectionMatrixUniform = gl.getUniformLocation(program, 'uMatP');
            const cameraMatrixUniform     = gl.getUniformLocation(program, 'uMatV');
            const localMatrixUniform      = gl.getUniformLocation(program, 'uMat');
            
            gl.uniformMatrix3fv(projectionMatrixUniform, false, projectionMatrix.elements);
            gl.uniformMatrix3fv(cameraMatrixUniform,     false, cameraMatrix.elements);
            gl.uniformMatrix3fv(localMatrixUniform,      false, nodes[0].localMatrix.elements);
            
            gl.drawArrays(gl.TRIANGLES, 0, 4);
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

