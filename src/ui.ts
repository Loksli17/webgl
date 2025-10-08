import type IScene from "./core/Scene/IScene";
import FileService from "./FileService";



const handleUITexture = (scene: IScene) => 
{
    const button = document.querySelector('#add-texture') as HTMLButtonElement;
    const input  = document.querySelector('#node-texture-index') as HTMLInputElement;

    if (!button || !input) return;


    button.addEventListener('click', async () => 
    {
        const { image } = await (new FileService()).getFile(() => {});
        
        const index = Number(input.value);
        const node  = scene.getViewportNodes('COLOR')[index];

        if (!node) return;

        scene.removeNode(node);
        
        node.setTexture(image);
        node.setType('TEXTURE');

        scene.insertNode(node);
    });
}



export 
{
    handleUITexture,
};