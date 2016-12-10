/// <reference path='../typings/globals/jest/index.d.ts' />
/// <reference path='../node_modules/typescript/lib/lib.es6.d.ts' />

import configureStore from 'redux-mock-store'
import { middleware } from '../src';

const mockStore = configureStore([ middleware({}) ]);

const waitForResponse = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve({});
    }, 10)
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
            request: Promise.resolve({
                status: 200,
                body: []
            })
        };

        store.dispatch(validAction);

        await waitForResponse();

        // Equals track request + action + resolve request
        expect(store.getActions().length).toEqual(3);
    });

    it('should trigger onFailure if the request failed', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        let onFailureTriggers = 0;

        const action = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                reject({ status: 401 });
            }),
            onFailure: (err) => { onFailureTriggers++; }
        };

        store.dispatch(action);

        await waitForResponse();

        expect(onFailureTriggers).toEqual(1);
    });

    it('should not trigger onSuccess if the request failed', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        let onFailureTriggers = 0;
        let onSuccessTriggers = 0;

        const action = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                reject({ status: 401 });
            }),
            onSuccess: () => { onSuccessTriggers++; },
            onFailure: (err) => { onFailureTriggers++; }
        };

        store.dispatch(action);

        await waitForResponse();

        expect(onFailureTriggers).toEqual(1);
        expect(onSuccessTriggers).toEqual(0);
    });

    it('should trigger onSuccess if the request succeeded', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        let onSuccessTriggers = 0;

        const action = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                resolve({ status: 200 });
            }),
            onSuccess: () => { onSuccessTriggers++; }
        };

        store.dispatch(action);

        await waitForResponse();

        expect(onSuccessTriggers).toEqual(1);
    });

    it('should not trigger onFailure if the request succeeded', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        let onSuccessTriggers = 0;
        let onFailureTriggers = 0;

        const action = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                resolve({ status: 200 });
            }),
            onSuccess: () => { onSuccessTriggers++; },
            onFailure: () => { onFailureTriggers++; }
        };

        store.dispatch(action);

        await waitForResponse();

        expect(onSuccessTriggers).toEqual(1);
        expect(onFailureTriggers).toEqual(0);
    });

    it('should trigger complete callback if the request succeeded or failed', async () => {
        const initialState = { request: {} };
        const store = mockStore(initialState);

        let onSuccessTriggers = 0;
        let onFailureTriggers = 0;
        let completeTriggers = 0;

        const actionSuccess = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                resolve({ status: 200 });
            }),
            onSuccess: () => { onSuccessTriggers++; },
            onFailure: () => { onFailureTriggers++; },
            complete: () => { completeTriggers++ }
        };

        const actionFailure = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                reject({ status: 401 });
            }),
            onSuccess: () => { onSuccessTriggers++; },
            onFailure: () => { onFailureTriggers++; },
            complete: () => { completeTriggers++ }
        };

        store.dispatch(actionSuccess);

        await waitForResponse();

        expect(onSuccessTriggers).toEqual(1);
        expect(onFailureTriggers).toEqual(0);
        expect(completeTriggers).toEqual(1);

        store.dispatch(actionFailure);

        await waitForResponse();

        expect(onSuccessTriggers).toEqual(1);
        expect(onFailureTriggers).toEqual(1);
        expect(completeTriggers).toEqual(2);
    });


    it('should trigger onUnauthorized callback if the request failed with 401 and middle is built with onUnauthorized option', async () => {
        let onFailureTriggers = 0;
        let onUnauthorizedTriggers = 0;

        const initialState = { request: {} };
        const store = configureStore([ middleware({
            onUnauthorized: () => { onUnauthorizedTriggers++; }
        }) ])(initialState);

        const action = {
            type: 'ANY_ACTION',
            request: new Promise((resolve, reject) => {
                reject({ status: 401 });
            }),
            onFailure: () => { onFailureTriggers++; }
        };

        store.dispatch(action);

        await waitForResponse();

        expect(onFailureTriggers).toEqual(1);
        expect(onUnauthorizedTriggers).toEqual(1);
    });
});
