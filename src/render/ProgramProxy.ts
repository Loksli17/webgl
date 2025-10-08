import type IScene from "../core/Scene/IScene";



export interface IShaderProgramDTO<T>
{
    type         : T;
    vShaderSource: string;
    fShaderSource: string;
    renderer     : IProgramRenderer<T>;
}


export interface IProgramProxy<T, N>
{
    getGlProgram(): WebGLProgram;
    getType()     : T;

    getRenderer(): IProgramRenderer<N>
}



export interface IProgramRenderer<N>
{
    render(gl: WebGLRenderingContext, program: WebGLProgram, scene: IScene): void;
}


export default class ProgramProxy<T, N> implements IProgramProxy<T, N>
{
    
    private program : WebGLProgram;
    private type    : T;
    private renderer: IProgramRenderer<N>;


    public constructor(program: WebGLProgram, type: T, renderer: IProgramRenderer<N>)
    {
        this.program  = program;
        this.type     = type;
        this.renderer = renderer; 
    }


    public getGlProgram(): WebGLProgram 
    {
        return this.program;    
    }

    
    public getType(): T 
    {
        return this.type
    }


    public getRenderer(): IProgramRenderer<N> 
    {
        return this.renderer;    
    }
}