
import faker from 'faker';
import Parse from 'parse/node';
import Data from './lib/dataGenerator';

var argv = process.argv;

if(argv.length < 3) {
  throwError('   USAGE : babel-node sample-data [COMMAND] [Additional Options]');
}

var {SERVER_URL, APP_ID} = require('../env');

Parse.initialize(APP_ID);
Parse.serverURL = `${SERVER_URL}/parse`;

var Follows = Parse.Object.extend("Follows");

var notNullValue = function(value, fakerValue) {
  return value? value: fakerValue;
}

var login = function(username, callback){

  Parse.User.logIn(username, 'password', {
    success: function(user) {
      callback(user);
    },
    error: function(user, error) {
      console.log(error);
    }
  });

}

function createUser(username, password, email, nickName, profileImage) {

  var user = new Parse.User();

  // Essential values
  user.set("username",    notNullValue(username, faker.internet.userName())); // username
  user.set("password",    notNullValue(password, "password")); // password

  // Additional values
  user.set("email",       notNullValue(email, faker.internet.email()));    // email
  user.set("nickName",    notNullValue(nickName, faker.name.findName()));     // nickName
  user.set("profileImage",notNullValue(profileImage, faker.internet.avatar()));   // profileImage

  user.signUp(null, {
    success: function(user) {
      console.log(JSON.stringify(user, null, '\t'));
    },
    error: function(user, error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
};

function createFollow(username, follow_username){

  login(username, (user) => {

    var currentUser = Parse.User.current();
    console.log(currentUser);

    Parse.Cloud.run('createFollow', {'username': follow_username}, {
      success: function(result) {
        console.log(result);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });

}

function follows(username){

  login(username, (user) => {
    Parse.Cloud.run('follows', {}, {
      success: function(result) {
        console.log(result);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });

}

switch (argv[2]) {
  case "user:create":
    if(!argv[3]) { createUser(); } else{ createUser(argv[3]); }
    break;
  case "follow:create":
    if(!argv[3] || !argv[4]) throwError(' USAGE : babel-node sample-data friend:create [username] [firend\'s username]');
    createFollow(argv[3], argv[4]);
    break;
  case "follow:list":
    if(!argv[3]) throwError(' USAGE : babel-node sample-data friend:list [username] ');
    follows(argv[3]);
    break;
  default:
    console.log("Sorry, we are out of " + argv[2] + ".");
}

function throwError(msg) {
  console.info('\n', msg || 'ERROR !! ', '\n');
  process.exit(0);
}
