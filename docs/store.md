# Module Implementation

## Create Store

Create redux store by using `createReduxStore` of `@wordpress/data`.

Example: `store.js`

```js
import { createReduxStore } from '@wordpress/data';

/**
 * Default state.
 */
const DEFAULT_STATE = {
  createBumpForm: {},
};

/**
 * Reducer to update the state.
 */
 const reducer = (state = DEFAULT_STATE, action) => {
  switch ( action.type ) {
    case 'UPDATE_BUMP_CREATE_FORM':
      return {
        ...state,
        createBumpForm: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Actions to call the reducer.
 */
const actions = {
  setCreateFromData(payload) {
    return {
      type: 'UPDATE_BUMP_CREATE_FORM',
      payload,
    };
  }
};

/**
 * Selectors to retrieve data from state.
 */
const selectors = {
  getCreateFromData(state) {
    return state.createBumpForm;
  }
};

export default createReduxStore( 'sbfw_order_bump', {
  reducer,
  actions,
  selectors
} );
```

## Registering a Store

Register redux store by using `register` method of `@wordpress/data`.

Example: `index.js`

```js
import { register } from '@wordpress/data';
import OrderBumpStore from './store';

register( OrderBumpStore );
```

## Using Store Inside Components

```js
import { useDispatch, useSelect } from '@wordpress/data';

function CreateBump() {
    // Update to store.
    const { setCreateFromData } = useDispatch( 'sbfw_order_bump' );

    // Get data from store.
    const { bumpData } = useSelect((select) => ({
        bumpData: select('sbfw_order_bump').getCreateFromData()
    }));

    return (
        <div>Something</div>
    );
}

export default CreateBump;
```
