import { Component, createFactory } from 'react';
import { connect } from 'react-redux';
import { is, curry, merge, not, omit } from 'ramda';
import { getRequest } from './accessors';
import {
    IAppState,
    IRequestState,
    ILink,
    IConnectOptions,
    IRequestHOProps,
    IRequestProps
} from '../';

const isLastPage = (link: ILink): boolean => {
    return link.next ? not(link.next.url) : true;
};

const requestWrapper = (connectOptions: IConnectOptions, MyComponent: any): any => {
    const {
        requestName
    } = connectOptions;

    if (not(requestName) && (not(is(String, requestName)) || not(is(Function, requestName)))) {
        throw(new Error('connectLoading requires the "requestName" option to be set'));
    }

    const RequestWrapper = (props: IRequestHOProps) => {
        const requestNameId: string = is(String, requestName) ? requestName : requestName(props);

        if (not(is(String, requestNameId))) {
            throw(new Error('connectLoading "requestName" must resolve to a string'));
        }

        const { request } = props._requestState;

        const parentProps: any = omit(['_requestProps'], props);

        if (!request) {
            const componentProps: IRequestProps = merge(parentProps, {
                pending: false,
                lastPage: true,
                requestDispatched: false
            });

            return createFactory(MyComponent)(componentProps);
        }

        const { error, status, requestData } = request;
        const { link = {} } = (requestData || {});

        const requestProps: IRequestProps = {
            pending: not(status),
            lastPage: isLastPage(link),
            requestDispatched: true
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
