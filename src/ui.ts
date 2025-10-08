import type IScene from "./core/Scene/IScene";



const handleUITexture = (scene: IScene) => 
{
    const button = document.querySelector('#add-texture') as HTMLButtonElement;
    const input  = document.querySelector('#node-texture-index') as HTMLInputElement;

    if (!button || !input) return;

    const image = new Image();
    image.src = 'public/images/rukav.png';

    //! not good variant, but....
    image.addEventListener('load', () => 
    {
        button.addEventListener('click', () => 
        {
            const index = Number(input.value);
            const node  = scene.getViewportNodes('COLOR')[index];

            if (!node) return;

            scene.removeNode(node);
            
            node.setTexture(image);
            node.setType('TEXTURE');

            scene.insertNode(node);
        });
    });
}



export 
{
    handleUITexture,
};