# redux-request-tracker

## What is redux-request-tracker?

`redux-request-tracker` is a package that aims to make working with
async data and pagination a breeze.

## Getting Started

### Install

`npm install -S redux-request-tracker`

### Setup

There are essentially two required steps to integrate `redux-request-tracker` into your redux backed application.

#### Step One (add middleware)

To add `redux-request-tracker` middleware to your project, import the middleware module and combine it with your other redux middleware.

NOTE: `redux-request-tracker` does have a dependency on [`redux-thunk`](https://github.com/gaearon/redux-thunk) to work properly.

```js
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'                               // <- IMPORT THUNK
import createLogger from 'redux-logger'
import rootReducer from './reducers'
import { middleware as requestMiddleware } from 'redux-request-tracker' // <- IMPORT MIDDLEWARE

const loggerMiddleware = createLogger()

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
      thunkMiddleware,    // <- ADD THUNK MIDDLEWARE
      loggerMiddleware,
      requestMiddleware() // <- ADD MIDDLEWARE
    )
  )
}
```

#### Step Two (add reducer)

To add the `redux-request-tracker` reducer to your project, import the reducer module and combine it with your other reducers.

```js
import { combineReducers } from 'redux'
import todos from './todos'
import counter from './counter'
import { reducer as request } from 'redux-request-tracker' // <- IMPORT REDUCER

export default combineReducers({
  todos,
  counter,
  request // <- ADD REDUCER
})
```

### Using `redux-request-tracker`

After adding the reducer and middleware you're all set and ready to begin using `redux-request-tracker`. All that is required now is to write / modify your actions so they get picked up by your request tracking middleware.

```js
export const getTodos = () => {
  return (dispatch) => {
    dispatch({
      type: 'REQUEST_GET_TODOS',
      request: fetch('/api/todos'),
      onSuccess: (todos) => {
        dispatch({
          type: 'TODOS_UPDATE_TODOS',
          payload: todos
        });
      }
    });
  };
};
```

In this example were using the [`fetch api`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but as long as the dispatched action matches the `redux-request-tracker` middleware signature, you can use any xhr library.

### Middleware signature

For your requests to be picked up by the middleware layer, all you need to do is attach a promise to the `request` property.

The following are the currently supported request action options.

- type:       String    (required)  unique namespace for the action
- request:    Promise   (required)
- onSuccess:  Function  (optional)  callback that receives the request body
- onFailure:  Function  (optional)  callback that receives the response error on failure

### Middleware options

The `redux-request-tracker` middleware takes the following options

- onUnauthorized:  Function  (optional)  callback triggered on all 401 responses

### Connecting to your components

As a convience, `redux-request-tracker` exposes `connectRequest`, a higher order function that binds request metadata to your components.

#### connectRequest

Connect request can take the following parameters in an options hash

- requestName *string | function (props) => string*

```js
import React, { Component } from 'react';
import { connectRequest } from 'redux-request-tracker';

class MyTodoComponent extends Component {
    render() {
        return // ...
    }
}

export default connectRequest({ requestName: 'REQUEST_GET_TODOS' })(MyTodoComponent);
```

##### Dynamic request tracking

When connecting a component to your request store, you may not have a hard coded action that maps to a specific request. Lets say, for example, that you have a component that lists out a collection of TODOS. You could create the constant `REQUEST_FETCH_TODOS` in your actions that you would pass to the list views `connectRequest` function. Now lets say you have a component that only displays a single request and you have an action responsible for fetching individual todos. In this case you'll need a way to dynamically namespace your requests for each todo. To accomplish this, `connectRequest`, allows you to define the `requestName` option as a function that receives `props` as an argument. The following example uses the `params` prop passed in from [`react-router`](https://github.com/ReactTraining/react-router) to get the id out of the path and append it to the requestName.


```js
import React, { Component } from 'react';
import { connectRequest } from 'redux-request-tracker';

const REQUEST_GET_TODO = (id) => `REQUEST_GET_TODO_${id}`;

class MyTodoComponent extends Component {
    render() {
        return // ...
    }
}

export default connectRequest({
    requestName: (props) => REQUEST_GET_TODO(props.params.id)
})(MyTodoComponent);
```

This will map the request tracking props to your Component

#### Request tracking props

- pending           *boolean* (a request has been dispatched, pending resolve)
- lastPage          *boolean* (if link headers are being used, this will notify the component if the last page has been fetched)
- requestDispatched *boolean* (determins if a namespaced request has ever been dispatched)

### Data accessors

Now that all of your request data is managed in redux state, we need a way to access it in out views. The following are data accessors that come out of the box with `redux-request-tracker`, feel free to add your own or submit an isses if you would like to see any additions to this.

#### `getRequest`

Get request is your go to data accessor for determining the state of your request.

```js
const { getRequest } from 'redux-request-tracker';

const mapStateToProps = (state) => {
    return {
        todosRequest: getRequest('REQUEST_GET_TODOS', state)
    };
};
```

#### Pagination accessors

These data accessors are responsible for parsing request pagination if supported. Check out the *Pagination* section for more information.

```js
const { getFirstPage, getLastPage, getNextPage, getPrevPage } from 'redux-request-tracker';

const mapStateToProps = (state) => {
    return {
        nextPage: getNextPage('REQUEST_GET_TODOS', state),
        prevPage: getPrevPage('REQUEST_GET_TODOS', state),
        firstPage: getFirstPage('REQUEST_GET_TODOS', state),
        lastPage: getLastPage('REQUEST_GET_TODOS', state)
    };
};
```

### Pagination

`redux-request-tracker` automatically parses the [Link Header](https://tools.ietf.org/html/rfc5988) if your server supports it. GitHub has a [good example](https://developer.github.com/guides/traversing-with-pagination/) of how this works.

### Suggestions?

Feel free to reach out with feedback and suggestions for improvement.
