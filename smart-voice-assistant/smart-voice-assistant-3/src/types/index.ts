export interface Command {
    name: string;
    parameters: Record<string, any>;
}

export interface Language {
    code: string;
    name: string;
}