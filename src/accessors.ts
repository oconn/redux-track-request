import { concat, toPairs, pathOr, values, flatten, map, merge, reduce, head, last } from 'ramda';
import { IAppState, IRequestState, ILinkPage, IRequestHistory } from '../';

export const getRequest = (requestName: string, state: IAppState): IRequestState | undefined => {
    const activeRequest: string | undefined = pathOr(undefined, ['request', requestName, 'activeRequest'], state);

    return activeRequest ? pathOr(undefined, ['request', requestName, 'requests', activeRequest], state) : undefined;
};

const _getPage = (requestName: string, state: IAppState, pageType: string): ILinkPage | undefined => {
    const request = getRequest(requestName, state);

    return request ? pathOr(undefined, ['requestData', 'link', pageType], request) : undefined;
};

export const getAppHistory = (state: IAppState): any => {
    const nameSpacedRequests = values(pathOr({}, ['request'], state)) as IRequestHistory[];
    const nameSpacedHistory = flatten(map(nsr => nsr.history, nameSpacedRequests)) as any[];
    const mergedHistory = reduce((acc, history) => {
        const requests = toPairs(history);
        const data = map(request => {
            return merge(last(request), { timestamp: head(request) })
        }, requests);

        return concat(data, acc);
    }, [], nameSpacedHistory);

    return mergedHistory;
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
