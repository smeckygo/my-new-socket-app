export class ActiveGameExistsError extends Error {
    constructor(message = 'Már van egy aktív játék.') {
        super(message);
        this.name = 'ActiveGameExistsError';
    }
}