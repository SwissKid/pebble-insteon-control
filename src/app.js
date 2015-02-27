/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var secrets = require('secrets');



console.log("Version 0.0.5");
var account_authorization;
var API_Key = secrets.API_Key;
var insteon_server = secrets.insteon_server;
var Refresh_Token = secrets.Refresh_Token;
var looped = false;
var rooms;
console.log(API_Key);
console.log(insteon_server);
console.log(Refresh_Token);
function jesus_fuck_this(){}
function display_room_menu(room_menu_list){
  console.log("GONNA DISPLAY NOW");
  var room_menu = new UI.Menu({
    sections: [{
      items: room_menu_list
    }]
  });
  room_menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  room_menu.show();
  
}
function generate_room_menu(roomlist){
  console.log(JSON.stringify(roomlist) + " IS THE ROOMLIST");
  console.log(JSON.stringify(rooms) + " IS THE ROOMS");
  var return_list = [];
  for (var i = 0; i < roomlist.length; i++) { 
    console.log(roomlist[i].RoomName);
    var item_object = {
      title: roomlist[i].RoomName
    };
    return_list.push(item_object);
    console.log("Pushed " + JSON.stringify(item_object));
}
  console.log(return_list);
  display_room_menu(return_list);
  return return_list;
}
function fuck_get_request(endpoint){
  var ajax = require('ajax');
  console.log("general get request!");
  var answer = "";
  var request_headers = {
    "Content-Type" : "application/json",
    "Authentication" : "APIKey " + API_Key,
    "Authorization" : "Bearer " + account_authorization
  };
  var request_url = insteon_server + "/api/v2/" + endpoint;
  ajax(
    {
      async: false, //lol doesn't even work
      url: request_url,
      type: 'json',
      headers: request_headers
    },
    function(data,status,request){
      console.log("Requested " + request_url + " And got: " + JSON.stringify(data));
      answer = data;
      rooms = data;
      var room_menu_list = generate_room_menu(rooms.RoomList);
      console.log("JSON ROOM MENU LIST: " + JSON.stringify(room_menu_list));
    },
    function(error,status,request){
      console.log('Error! The return was ' + JSON.stringify(error) + " Also "  + error );
      if(status == 401){
        console.log("Access Denied, refreshing Bearer");
        if(looped){
          console.log("Looped");
        }else{
          looped=true;
          jesus_fuck_this();
        }
      }
      }
  );
  return answer;
}
  
function jesus_fuck_this(){
  var ajax = require('ajax');
  var request_data = {
    'client_id': API_Key,
    'grant_type': 'refresh_token',
    'refresh_token': Refresh_Token
  };
  ajax(
    {
      url: insteon_server + '/api/v2/oauth2/token',
      type: 'json',
      method: 'post',
      data: request_data
    },
    function(data,status,request){
      console.log('The return was ' + JSON.stringify(data));
      console.log('The access_token is ' + data.access_token);
      account_authorization = data.access_token;
      fuck_get_request("rooms");
    },
    function(error,status,request){
      console.log('Error! The return was ' + error );
    }
  );
}



console.log("Pre-Fuckery");
jesus_fuck_this();


