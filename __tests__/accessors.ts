/// <reference path='../typings/globals/jest/index.d.ts' />
/// <reference path='../node_modules/typescript/lib/lib.es6.d.ts' />

import { getAppHistory, getRequest } from '../src';

const appState = {
    request: {
        'REQUEST_USERS': {
            activeRequest: '1',
            history: {
                '0': {
                    method: 'GET',
                    requestingPage: '/users',
                    url: 'https://someurl/api/v1/users'
                },
                '1': {
                    method: 'GET',
                    requestingPage: '/users',
                    url: 'https://someurl/api/v1/users'
                }
            },
            requests: {
                '0': {
                    error: null,
                    requestData: {},
                    status: 200
                },
                '1': {
                    error: null,
                    requestData: {},
                    status: 200
                }
            }
        },
        'REQUEST_TODOS': {
            activeRequest: '2',
            history: {
                '0': {
                    method: 'GET',
                    requestingPage: '/todos',
                    url: 'https://someurl/api/v1/todos'
                },
                '1': {
                    method: 'GET',
                    requestingPage: '/todos',
                    url: 'https://someurl/api/v1/todos'
                },
                '2': {
                    method: 'GET',
                    requestingPage: '/todos',
                    url: 'https://someurl/api/v1/todos'
                }
            },
            requests: {
                '0': {
                    error: null,
                    requestData: {},
                    status: 200
                },
                '1': {
                    error: null,
                    requestData: {},
                    status: 200
                },
                '2': {
                    error: null,
                    requestData: {},
                    status: null
                }
            }
        }
    }
};

describe('getAppHistory data accessor', () => {
    it('should return properly formatted app history given app state', () => {
        const appHistory = getAppHistory(appState);

        expect(appHistory).toEqual([
            { method: 'GET',
              requestingPage: '/todos',
              url: 'https://someurl/api/v1/todos',
              timestamp: '0' },
            { method: 'GET',
              requestingPage: '/todos',
              url: 'https://someurl/api/v1/todos',
              timestamp: '1' },
            { method: 'GET',
              requestingPage: '/todos',
              url: 'https://someurl/api/v1/todos',
              timestamp: '2' },
            { method: 'GET',
              requestingPage: '/users',
              url: 'https://someurl/api/v1/users',
              timestamp: '0' },
            { method: 'GET',
              requestingPage: '/users',
              url: 'https://someurl/api/v1/users',
              timestamp: '1' }
        ]);
    });
});

describe('getRequest data accessor', () => {
    it('should return the requested active record', () => {
        const request = getRequest('REQUEST_TODOS', appState);

        expect(request).toEqual({ error: null, requestData: {}, status: null });
    });

    it('should return undefined if the request does not exist', () => {
        const request = getRequest('REQUEST_INVALID', appState);

        expect(request).toEqual(undefined);
    });
});
