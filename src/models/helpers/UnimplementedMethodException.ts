export class UnimplementedMethodException extends Error {
    constructor(method: string){
        super(`Expected child class to implement ${method}.`);
    }
}