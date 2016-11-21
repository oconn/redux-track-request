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

// custom response parsers used to make accessing response data a bit easier
const parseResponseData = (response: IResponse): IResponseData => {
    const { headers } = response;

    return compose(
        over(lensProp('link'), parseLinkHeader),
        pick(['link'])
    )(headers);
};

const handleRequestSuccess = (store: Store<IAppState>, action: IRequestAction, timestamp: string, options: IOptions) => (response: IResponse): void => {
    // if onSuccess callback was specified then trigger with body
    if (action.onSuccess && is(Function, action.onSuccess)) {
        action.onSuccess(response.body);
    }

    const payload: IRequestState = {
        error: null,
        status: response.status,
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

const handleRequestFailure = (store: Store<IAppState>, action: IRequestAction, timestamp: string, options: IOptions) => (error: IError): void => {
    // if onFailure callback was specified then trigger with error
    if (action.onFailure && is(Function, action.onFailure)) {
        action.onFailure(error);
    }

    // if onUnauthorized callback is specified in options then trigger
    if (error.status === 401 && is(Function, options.onUnauthorized)) {
        options.onUnauthorized();
    }

    const payload: IRequestState = {
        error: error,
        status: null,
        requestData: null
    };

    store.dispatch({
        type: RESOLVE_REQUEST,
        requestId: action.type,
        timestamp,
        payload
    });
};

export const middleware: RequestMiddleware = (options: IOptions) => (store: Store<IAppState>) => (next: Dispatch<IAppState>) => (action: Action) => {
    // if the action is not a redux-request-action then next
    if (!isRequestAction(action)) {
        return next(action);
    }

    // since we track the history of all requests, we need to tie each specific request
    // to the time it was dispatched.
    const timestamp = new Date().getTime().toString();

    const payload: IRequestState = {
        error: null,
        status: null,
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
        .then(handleRequestSuccess(store, action, timestamp, options))
        .catch(handleRequestFailure(store, action, timestamp, options));

    return next(action);
}
