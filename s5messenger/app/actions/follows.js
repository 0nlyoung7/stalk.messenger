
import Parse from 'parse/react-native';

export const LOADED_FOLLOWS   = 'LOADED_FOLLOWS';
export const ADDED_FOLLOWS    = 'ADDED_FOLLOWS';
export const REMOVED_FOLLOWS  = 'REMOVED_FOLLOWS';

const InteractionManager = require('InteractionManager');

const Follows = Parse.Object.extend('Follows');

function loadFollowsAsync () {

  return new Promise( (resolve, reject) => {

    var currentUser = Parse.User.current();

    new Parse.Query(Follows)
      .equalTo('userFrom', currentUser)
      .include('userTo')
      .find()
      .then(
        (list) => {
          resolve(list);
        },
        (err) => { console.error(error); reject(err); }
      );
  });

};

/**
 * Load list of all follows once logined
 * @params N/A
 **/
export function loadFollows() {

  return async (dispatch) => {

    var list = await loadFollowsAsync();
    return dispatch(({type: LOADED_FOLLOWS, list}));

  };

}

/**
 * create follow relation
 * @params id : user.id of target user
 **/
export function createFollow(id) {

  return (dispatch) => {
    return Parse.Cloud.run('follows-create', {id}, {
      success: (result) => {

        InteractionManager.runAfterInteractions(() => {
          dispatch(({type: ADDED_FOLLOWS, result}));
        });

      },
      error: (error) => {
        console.warn(error);
      }
    });
  };

}

/**
 * Remove follow relation
 * @params id : user.id of target user
 **/
export function removeFollow(row) {

  return (dispatch, getState) => {

    console.log(getState().follows.list[row]);
    console.log(getState().follows.list[row].id);

    let followId = getState().follows.list[row].id;

    return Parse.Cloud.run('follows-remove', {id: followId}, {
      success: (result) => {

        InteractionManager.runAfterInteractions(() => {
          dispatch(({type: REMOVED_FOLLOWS, result, row}));
        });

      },
      error: (error) => {
        console.warn(error);
      }
    });
/*
    const result = await Parse.Cloud.run('follows-remove', {id: followId});

    console.log(result);

    return dispatch({
      type: REMOVED_FOLLOWS,
      result,
      row,
    });
*/
    /*
    return Parse.Cloud.run('follows-remove', {id}, {
      success: (result) => {

        InteractionManager.runAfterInteractions(() => {
          dispatch(({type: REMOVED_FOLLOWS, result}));
        });

      },
      error: (error) => {
        console.warn(error);
      }
    });
    */
  };

}
