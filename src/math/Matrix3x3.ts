

export default class Matrix3x3
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