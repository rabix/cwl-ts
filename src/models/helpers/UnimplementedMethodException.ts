export class UnimplementedMethodException {
    constructor(method: string){
        console.error(`Expected child class to implement ${method}.`);
    }
}