export class UnimplementedMethodException {
    constructor(method: string, parent?: string){
        const prefix = `${parent || ""}${parent ? "." : ""}`;
        console.error(`Expected child class to implement ${prefix}${method}.`);
    }
}