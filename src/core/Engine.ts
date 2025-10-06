import type IScene from "./Scene/IScene";



export default class Engine
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