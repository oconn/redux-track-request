import { pathOr } from 'ramda';
import { IAppState, IRequestState, ILinkPage } from '../';

export const getRequest = (requestName: string, state: IAppState): IRequestState | undefined => {
    const activeRequest: string | undefined = pathOr(undefined, ['request', requestName, 'activeRequest'], state);

    return activeRequest ? pathOr(undefined, ['request', requestName, 'requests', activeRequest], state) : undefined;
};

const _getPage = (requestName: string, state: IAppState, pageType: string): ILinkPage | undefined => {
    const request = getRequest(requestName, state);

    return request ? pathOr(undefined, ['requestData', 'link', pageType], request) : undefined;
};

export const getFirstPage = (requestName: string, state: IAppState): ILinkPage | undefined => {
    return _getPage(requestName, state, 'first');
};

export const getLastPage = (requestName: string, state: IAppState): ILinkPage | undefined => {
    return _getPage(requestName, state, 'last');
};

export const getPrevPage = (requestName: string, state: IAppState): ILinkPage | undefined => {
    return _getPage(requestName, state, 'prev');
};

export const getNextPage = (requestName: string, state: IAppState): ILinkPage | undefined => {
    return _getPage(requestName, state, 'next');
};
