import { Action } from 'redux';
import { compose, identity, lensPath, set } from 'ramda';
import { TRACK_REQUEST, RESOLVE_REQUEST } from './constants';
import { IReducerState, IReducerAction, RequestReducer } from '../';

const initialState: IReducerState = {};

const actionHandlers = {
    [TRACK_REQUEST]: (state: IReducerState, action: IReducerAction): IReducerState => {
        const { requestId, timestamp, payload, history } = action;

        return compose(
            set(lensPath([requestId, 'history', timestamp]), history) as (state: IReducerState) => IReducerState,
            set(lensPath([requestId, 'activeRequest']), timestamp) as (state: IReducerState) => IReducerState,
            set(lensPath([requestId, 'requests', timestamp]), payload) as (state: IReducerState) => IReducerState
        )(state);
    },
    [RESOLVE_REQUEST]: (state: IReducerState, action: IReducerAction): IReducerState => {
        const { requestId, timestamp, payload } = action;

        return set(lensPath([requestId, 'requests', timestamp]), payload, state);
    }
};

export const reducer = (state: IReducerState = initialState, action: Action | IReducerAction): IReducerState => {
    const actionHandler: RequestReducer = actionHandlers[action.type] || identity;

    return actionHandler(state, action);
};
