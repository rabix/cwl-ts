export class UnimplementedMethodException {
    constructor(method: string, parent?: string){
        const prefix = `${parent || ""}${parent ? "." : ""}`;
        console.warn(`Expected child class to implement ${prefix}${method}.`);
    }
}