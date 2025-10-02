
interface IRGBAColor
{
    r: number;
    g: number;
    b: number;
    a: number;
}



interface INode
{

}


interface IScene
{
    setColor(color: IRGBAColor): void;
    getColor()                 : IRGBAColor;

    insertNode(node: INode): boolean;
    removeNode(node: INode): boolean;
}



class Scene implements IScene
{

    private color: IRGBAColor = { r: 0, g: 0, b: 0, a: 1 };
    private nodes: INode[]    = [];


    public render(): void 
    {
        
    }
    

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


const vertexShaderSource: string = 
`
    attribute vec3 aVertexPosition;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main(void)
    {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    }
`;


const simpleVertexShaderSource: string = 
`
    attribute vec3 aPos;
    
    void main()
    {
        gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
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

    // todo delete shaders

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error(`Shader program has not been inited`);
        return null;
    }

    return program;
}


const initTriangleProgram = (gl: WebGLRenderingContext): void =>
{
    const vertexShader   = makeShader(gl, simpleVertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = makeShader(gl, fragmentShaderSource,     gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    const program = makeShaderProgram(gl, vertexShader, fragmentShader);

    if (program) gl.useProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
}



const render = (scene: IScene, gl: WebGLRenderingContext) => 
{
    if (!gl) return;

    const sceneColor = scene.getColor();

    
    gl.clearColor(sceneColor.r, sceneColor.g, sceneColor.b, sceneColor.a);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    nodeRenderTest(gl);
}


const nodeRenderTest = (gl: WebGLRenderingContext) => 
{
    const vertexes = 
    [
        -0.5, -0.5, 0,
         0.5, -0.5, 0,
            0, 0.5, 0 
    ];

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

    initTriangleProgram(gl);

    requestAnimationFrame(() => 
    {
        render(scene, gl);
    });
}


main();

