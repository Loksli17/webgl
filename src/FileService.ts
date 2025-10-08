


export default class FileService 
{
    
    private accept = ['image/jpg', 'image/jpeg', 'image/png'];


    public getNameWithoutExtension(name = '') 
    {
        return name.replace(/\.[^/.]+$/, '');
    }


    public getFile(onCancelCb: () => void): Promise<
    {
        file : File;
        image: HTMLImageElement;
        name : string;
    }> 
    {
        
        return new Promise((resolve, reject) => 
        {
            const input = document.createElement('input');
            input.type = 'file';
            input.setAttribute('accept', this.accept.join(','));

            input.onchange = (e: Event) => 
            {
                const file = (e.target as HTMLInputElement).files?.[0];
                
                if (file) 
                {
                    const { error } = this.checkFile(file);
                    if (!error) {
                        const image = new Image();
                        const fileReader = new FileReader();

                        fileReader.onload = (e) => 
                        {
                            image.src = e.target?.result as string;
                            image.setAttribute('data-name', file.name);
                            image.setAttribute('data-size', `${file.size}`);
                            image.setAttribute('data-lastModified', `${file.lastModified}`);
                            
                            resolve(
                            {
                                file,
                                image,
                                name: this.getNameWithoutExtension(file.name),
                            });
                        };
                        
                        fileReader.readAsDataURL(file as File);
                    } else {
                        reject(error);
                    }
                }
            };

            input.oncancel = onCancelCb;
            input.click();
        });
    }


    public checkFile(file: File) 
    {
        if (!this.accept.includes(file.type)) 
        {
            return {
                error: `Файл Изображения ${file.name} не импортирован.`,
            };
        }

        if (file.size / (1024 * 1024) > 50) 
        {
            return {
                error: `Файл Изображения ${file.name} не импортирован. Файл слишком большой`,
            };
        }

        return {
            error: null,
        };
    }
}