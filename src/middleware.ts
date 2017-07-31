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
    IRequestHistoryState,
    IResponse,
    IResponseData,
    RequestMiddleware
} from '../';

const isRequestAction = (action: Action | IRequestAction): action is IRequestAction => {
    return !!((<IRequestAction>action).request && (<IRequestAction>action).request.then);
};

// custom response parsers used to make accessing response data a bit easier
const parseResponseData = (response: IResponse): IResponseData => {
    const { headers = {} } = response;

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

    // if complete callback was specificied then trigger
    if (action.complete && is(Function, action.complete)) {
        action.complete();
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

    return undefined;
};

const handleRequestFailure = (store: Store<IAppState>, action: IRequestAction, timestamp: string, options: IOptions) => (error: IError): void => {
    const { onUnauthorized } = options;

    // if onFailure callback was specified then trigger with error
    if (action.onFailure && is(Function, action.onFailure)) {
        action.onFailure(error);
    }

    // if complete callback was specificied then trigger
    if (action.complete && is(Function, action.complete)) {
        action.complete();
    }

    // if onUnauthorized callback is specified in options then trigger
    if (error.status === 401 && (!!onUnauthorized && is(Function, onUnauthorized))) {
        onUnauthorized();
    }

    const payload: IRequestState = {
        error: error,
        status: error.status,
        requestData: null
    };

    store.dispatch({
        type: RESOLVE_REQUEST,
        requestId: action.type,
        timestamp,
        payload
    });

    return undefined;
};

export const middleware: RequestMiddleware = (options: IOptions = {}) => (store: Store<IAppState>) => (next: Dispatch<IAppState>) => (action: Action) => {
    // if the action is not a redux-request-action then next
    if (!isRequestAction(action)) {
        return next(action);
    }

    // since we track the history of all requests, we need to tie each specific request
    // to the time it was dispatched.
    const timestamp = new Date().getTime().toString();

    // build path
    const { pathname: requestingPage } = window.location;

    const { getRequestMethod, getRequestUrl } = options;

    // get request method
    const method: string = getRequestMethod ?
        getRequestMethod(action.request) :
        (action.request && action.request.method) || 'unknown';

    // get request url
    const url: string = getRequestUrl ?
        getRequestUrl(action.request) :
        (action.request && action.request.url) || 'unknown';

    const payload: IRequestState = {
        error: null,
        status: null,
        requestData: null
    };

    const history: IRequestHistoryState = {
        requestingPage,
        method,
        url
    };

    // dispatch request start action
    store.dispatch({
        type: TRACK_REQUEST,
        requestId: action.type,
        timestamp,
        payload,
        history
    });

    action.request
        .then(handleRequestSuccess(store, action, timestamp, options))
        .catch(handleRequestFailure(store, action, timestamp, options));

    return next(action);
}
