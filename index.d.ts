import { Action, Store, Middleware, Dispatch } from 'redux';

export type RequestMiddleware = (options: IOptions) => Middleware;
export type RequestReducer = (state: IReducerState, action: Action) => IReducerState;

export type IBody = any;

export interface IError {
    status: number;
}

export interface IAppState {
    request: IReducerState;
}

export interface IRequestState {
    error: IError | null;
    status: number | null;
    requestData: IResponseData | null;
}

export type IReducerAction = Action & {
    type: string;
    requestId: string;
    timestamp: string;
    payload: IRequestState;
};

export interface IRequestHistory {
    requests: {
        [timestamp: string]: IRequestState;
    };
    activeRequest: string;
}

export interface IReducerState {
    [requestId: string]: IRequestHistory;
}

export interface IOptions {
    onUnauthorized: () => any;
}

export interface IRequestAction {
    request: Promise<any>;
    type: string;
    onSuccess?: (body: IBody) => any;
    onFailure?: (error: IError) => any;
}

export interface ILinkPage {
    page: string;
    rel: string;
    url: string;
}

export interface IHeaders {}

export interface IResponse {
    body: IBody;
    headers: IHeaders;
    status: number;
}

export interface IResponseData {
    link?: {
        nextPage?: ILinkPage;
        prevPage?: ILinkPage;
        firstPage?: ILinkPage;
        lastPage?: ILinkPage;
    };
}

export interface IRequestPayload {}
