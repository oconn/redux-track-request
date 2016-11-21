import { Action, Store, Dispatch } from 'redux';
import { compose, is, lensProp, map, over, pick } from 'ramda';
import * as parseLinkHeader from 'parse-link-header';
import { TRACK_REQUEST, RESOLVE_REQUEST } from './constants';

import {
    IAppState,
    IError,
    IOptions,
    IRequestAction,
    IRequestState,
    IResponse,
    IResponseData,
    RequestMiddleware
} from '../';

const isRequestAction = (action: Action | IRequestAction): action is IRequestAction => {
    return !!((<IRequestAction>action).request && (<IRequestAction>action).request.then);
};

const parseResponseData = (response: IResponse): IResponseData => {
    const { headers } = response;

    return compose(
        over(lensProp('link'), parseLinkHeader),
        pick(['link'])
    )(headers);
};

const handleRequestSuccess = (store: Store<IAppState>, action: IRequestAction, timestamp: string) => (response: IResponse): void => {
    if (action.onSuccess && is(Function, action.onSuccess)) {
        action.onSuccess(response.body);
    }

    const payload: IRequestState = {
        error: null,
        status: response.status,
        paginating: !!action.paginating,
        requestData: parseResponseData(response)
    };

    window.setTimeout(() => {
        store.dispatch({
            type: RESOLVE_REQUEST,
            requestId: action.type,
            timestamp,
            payload
        });
    }, 0);
};

const handleRequestFailure = (store: Store<IAppState>, action: IRequestAction, timestamp: string) => (error: IError): void => {
    if (action.onFailure && is(Function, action.onFailure)) {
        action.onFailure(error);
    }

    const payload: IRequestState = {
        error: error,
        status: null,
        paginating: !!action.paginating,
        requestData: null
    };

    store.dispatch({
        type: RESOLVE_REQUEST,
        requestId: action.type,
        timestamp,
        payload
    });

    if (error.status === 401) {
        // TODO
    }

    if (action.onFailure) {
        action.onFailure(error);
    }
};

export const middleware: RequestMiddleware = (options: IOptions) => (store: Store<IAppState>) => (next: Dispatch<IAppState>) => (action: Action) => {
    // if the action is not a redux-request-action then next
    if (!isRequestAction(action)) {
        return next(action);
    }

    const timestamp = new Date().getTime().toString();

    const payload: IRequestState = {
        error: null,
        status: null,
        paginating: !!action.paginating,
        requestData: null
    };

    // dispatch request start action
    store.dispatch({
        type: TRACK_REQUEST,
        requestId: action.type,
        timestamp,
        payload
    });

    action.request
        .then(handleRequestSuccess(store, action, timestamp))
        .catch(handleRequestFailure(store, action, timestamp));

    return next(action);
}
