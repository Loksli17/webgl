
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



const fragmentShader = 
`
    void main(void)
    {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;


const vertexShader = 
`
    attribute vec3 aVertexPosition;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main(void)
    {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
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
        console.warn(`Fragment shader wasn't compile ${gl.getShaderInfoLog(shader)}`);
        return null;
    }

    return shader;
}


/**
 * 
 * @param gl 
 * @param fShader 
 * @param vShader 
 * @returns 
 */
const makeShaderProgram = (gl: WebGLRenderingContext, fShader: WebGLShader, vShader: WebGLShader): WebGLProgram | null => 
{
    const program: WebGLProgram = gl.createProgram();
    
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.warn(`Shader program has not been inited`);
        return null;
    }

    return program;
}



const render = (scene: IScene, gl: WebGLRenderingContext) => 
{
    if (!gl) return;

    const sceneColor = scene.getColor();

    gl.clearColor(sceneColor.r, sceneColor.g, sceneColor.b, sceneColor.a);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
}




const main = () => 
{
    const canvas = document.querySelector('#canvas-gl') as HTMLCanvasElement;
    const gl     = canvas.getContext('webgl');

    const scene = new Scene()
    Engine.Instance().insertScene(scene);

    requestAnimationFrame(() => 
    {
        if (gl) render(scene, gl);
    });
}


main();

