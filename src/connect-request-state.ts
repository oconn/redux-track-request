import { Component, createFactory } from 'react';
import { connect } from 'react-redux';
import { curry, merge, not, omit } from 'ramda';
import { getRequest } from './accessors';
import {
    IAppState,
    IRequestState,
    ILink ,
    IConnectOptions,
    IRequestHOProps,
    IRequestProps
} from '../';

const isLastPage = (link: ILink): boolean => {
    return link.next ? not(link.next.url) : true;
};

const requestWrapper = (connectOptions: IConnectOptions, MyComponent: any): any => {
    const { requestName } = connectOptions;

    if (!requestName) {
        window.console.error('connectLoading requires the "requestName" option to be set');
    }

    const RequestWrapper = (props: IRequestHOProps) => {
        const { request } = props._requestState;
        const parentProps: any = omit(['_requestProps'], props);

        if (!request) {
            window.console.error(`request named "${requestName}" was not found in state`);

            return createFactory(MyComponent)(parentProps);
        }

        const { error, status, requestData } = request;
        const { link = {} } = (requestData || {});

        const requestProps: IRequestProps = {
            pending: not(status),
            lastPage: isLastPage(link)
        };

        const componentProps: IRequestProps & any = merge(parentProps, requestProps);

        return createFactory(MyComponent)(componentProps);
    }

    const mapStateToProps = (state: IAppState): IRequestHOProps => {
        return {
            _requestState: {
                request: getRequest(requestName, state)
            }
        };
    }

    return connect(mapStateToProps, {})(RequestWrapper);
};

export const connectRequest = curry(requestWrapper);
