import type Matrix3x3 from "./Matrix3x3";



export default class Vec2
{
    x: number = 0;
    y: number = 0;


    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }


    public copy(vec: Vec2): this
    {
        this.x = vec.x;
        this.y = vec.y;

        return this;
    }


    public clone(): Vec2
    {
        return new Vec2(this.x, this.y);
    }


    public applyMatrix(m: Matrix3x3): this
    {
        const x = this.x, y = this.y;
        const e = m.elements;

        this.x = e[0] * x + e[3] * y + e[6];
        this.y = e[1] * x + e[4] * y + e[7];

        return this;
    }


    public set(x: number, y: number): this
    {
        this.x = x;
        this.y = y;

        return this;
    }

}