/// <reference path='../typings/globals/jest/index.d.ts' />
/// <reference path='../node_modules/typescript/lib/lib.es6.d.ts' />

import configureStore from 'redux-mock-store'
import { middleware } from '../src';

const mockStore = configureStore([ middleware({}) ]);

const waitForResponse = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({});
    }, 1)
});

describe('redux-request-tracker middleware', () => {
    it('should ignore actions that do not match the proper signature', () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        // Ignores other actions
        const invalidAction1 = {
            type: 'ANY_ACTION',
            payload: 'Some non request tracker action'
        };

        // Ignores actions with proper named signature with improper values
        const invalidAction2 = {
            type: 'ANY_ACTION',
            request: 5
        };

        // Ignores actions with that match but are not thenable (request must take a promise)
        const invalidAction3 = {
            type: 'ANY_ACTION',
            request: () => {}
        };

        store.dispatch(invalidAction1);
        store.dispatch(invalidAction2);
        store.dispatch(invalidAction3);

        // Equals the exact number of actions dispatched
        expect(store.getActions().length).toEqual(3);
    });

    it('should process vaild request actions that match the proper signature', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        const validAction = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                resolve({
                    status: 200,
                    body: []
                })
            })
        };

        store.dispatch(validAction);

        await waitForResponse();

        // Equals track request + action + resolve request
        expect(store.getActions().length).toEqual(3);
    });
});
