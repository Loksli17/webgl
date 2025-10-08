import type { IShaderProgramDTO } from "../render/ProgramProxy";
import Renderer                   from "../render/Renderer";
import type INode                 from "./Node/INode";
import type { NODE_TYPE }         from "./Node/NodeType";
import type IScene                from "./Scene/IScene";



export default class Engine
{

    private static instance: Engine;

    private scenes          : IScene[] = [];
    private activeSceneIndex: number   = 0;

    private renderer: Renderer<NODE_TYPE, INode>;
    

    private constructor(gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO<NODE_TYPE>[]) 
    { 
        this.renderer = new Renderer<NODE_TYPE, INode>(gl, programsDTO);
    };


    public static makeInstance(gl: WebGLRenderingContext, programsDTO: IShaderProgramDTO<NODE_TYPE>[])
    {
        if (!this.instance)
        {
            this.instance = new this(gl, programsDTO);
        }
    }


    public static Instance(): Engine
    {
        return this.instance; 
    }


    public insertScene(scene: IScene)
    {
        this.scenes.push(scene);
    }


    public getActiveScene(): IScene | null
    {
        return this.scenes[this.activeSceneIndex] || null;
    }


    public render()
    {
        this.renderer.render(this.scenes[this.activeSceneIndex]);
    }
}