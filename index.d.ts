import { Action, Store, Middleware, Dispatch } from 'redux';

export type IAppState = {
    request: IReducerState;
};
export type IBody = any;
export type RequestMiddleware = (options: IOptions) => Middleware;
export type RequestReducer = (state: IReducerState, action: Action) => IReducerState;

export interface IRequestState {
    error: IError | null;
    status: number | null;
    paginating: boolean;
    requestData: IResponseData | null;
}

export type IReducerAction = Action & {
    type: string;
    requestId: string;
    timestamp: string;
    payload: IRequestState;
};

export interface IRequestStatus {
    requests: {
        [timestamp: string]: IRequestState;
    };
    activeRequest: string;
}

export interface IReducerState {
    [requestId: string]: IRequestStatus;
}

export interface IOptions {}

export interface IError {
    status: number;
}

export interface IRequestAction {
    request: Promise<any>;
    type: string;
    onSuccess?: (body: IBody) => any;
    onFailure?: (error: IError) => any;
    paginating?: boolean
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
