export interface DocumentData {
    documentName: string;
}

export interface DocumentResponse {
    status: string;
    code: number;
    message?: string;
    roomId?: string;
    documentName?: string;
}

export type DocumentCallback = (response: DocumentResponse) => any;
