export class UnimplementedMethodException {
    constructor(method: string, parent?: string){
        //Temporarily disabling this log so it doesn't pollute actual debugging

        // const prefix = `${parent || ""}${parent ? "." : ""}`;
        // console.warn(`Expected child class to implement ${prefix}${method}.`);
    }
}