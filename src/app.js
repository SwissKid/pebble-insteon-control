/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var secrets = require('secrets');



console.log("Version 0.0.5");

//Variables
//
// Rooms/Scenes/Devices are important. 
// Quick timeout can be changed safely
// Looped is there since I'm debating making it retry if the bearer token isn't correct
var account_authorization;
var looped = false;
var rooms;
var scenes;
var devices;
var quick_timeout = 800;

//Secrets file
//
// Grabbing these from the secrets file, mostly because I don't know how to use the
//  settings function in pebblejs.
var API_Key = secrets.API_Key;
var insteon_server = secrets.insteon_server;
var Refresh_Token = secrets.Refresh_Token;

//Early declared functions
//
// Because I got tired of wondering if I had declared these before I used them
function room_request(){}
function sceneOn(){}
function sceneOff(){}
function deviceOn(){}
function deviceOff(){}

//Compare function to sort text lists
function compare(a,b){
  if (a.title > b.title)
    return 1;
  if (a.title < b.title)
    return -1;
  return 0;
}
//Pre populate all the vars while the app loads
function populate_all(){
  room_request(false);
  device_request(false);
  scene_request(false);
}


//Display Menus (called after the lists are created)

function display_device_menu(device_list){
  console.log("Submenu");
  console.log(JSON.stringify(device_list));
  var quickscreen = new UI.Card({});
  var device_menu = new UI.Menu({
    sections: [{
      items: device_list
    }]
  });
  device_menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    //console.log("Device ID is: "+ device_list[e.itemIndex].DeviceID);
    deviceOn(e.item.DeviceID);
    
    quickscreen.title("Device On");
    quickscreen.subtitle(e.item.title);
    quickscreen.body(e.item.title + " Turned On");
    quickscreen.show();
    setTimeout(function() {
      // Hide the splashScreen to avoid showing it when the user press Back.
      quickscreen.hide();
    }, quick_timeout);
  });
  device_menu.on('longSelect', function(e) {
    console.log('Long Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    deviceOff(e.item.DeviceID);
    quickscreen.title("Device Off");
    quickscreen.subtitle(e.item.title);
    quickscreen.body(e.item.title + " Turned Off");
    quickscreen.show();
    setTimeout(function() {
      // Hide the splashScreen to avoid showing it when the user press Back.
      quickscreen.hide();
    }, quick_timeout);
  });
  device_menu.show();
}

function display_scene_menu(scene_menu_list){
  console.log(JSON.stringify(scene_menu_list));
  var quickscreen = new UI.Card({});
  var scene_menu = new UI.Menu({
    sections: [{
      items: scene_menu_list
    }]
  });
  scene_menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    sceneOn(e.item.SceneID);
    quickscreen.title("Scene On");
    quickscreen.subtitle(e.item.title);
    quickscreen.body(e.item.title + " Turned On");
    quickscreen.show();
    setTimeout(function() {
      // Hide the splashScreen to avoid showing it when the user press Back.
      quickscreen.hide();
    }, quick_timeout);
  });
  scene_menu.on('longSelect', function(e) {
    console.log('Long Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    sceneOff(e.item.SceneID);
    quickscreen.title("Scene Off");
    quickscreen.subtitle(e.item.title);
    quickscreen.body(e.item.title + " Turned Off");
    quickscreen.show();
    setTimeout(function() {
      // Hide the splashScreen to avoid showing it when the user press Back.
      quickscreen.hide();
    }, quick_timeout);
  });
  scene_menu.show();
  
}
function display_room_menu(room_menu_list){
  console.log("GONNA DISPLAY NOW");
  console.log(JSON.stringify(room_menu_list));
  var room_menu = new UI.Menu({
    sections: [{
      items: room_menu_list
    }]
  });
  room_menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    var sub_devs = get_devices(rooms.RoomList[e.itemIndex]);
		//To Do - Add the scenes to this - scenes are part of rooms too
    console.log("Returned devices: " + JSON.stringify(sub_devs));
    generate_device_menu(sub_devs);
  });
  room_menu.show();
  
}


//Generate Menus
function generate_device_menu(devList){
  var return_list = [];
  for (var i = 0; i < devList.length; i++) { 
    var item_object = {
      DeviceID: devList[i].DeviceID,
      title: devList[i].DeviceName.trim()
    };
    return_list.push(item_object);
    console.log("Pushed " + JSON.stringify(item_object));
  }
  return_list.sort(compare);
  console.log(JSON.stringify(return_list));
  display_device_menu(return_list);
}
function generate_room_menu(roomlist){
  var return_list = [];
  for (var i = 0; i < roomlist.length; i++) { 
    console.log(roomlist[i].RoomName);
    var item_object = {
      title: roomlist[i].RoomName.trim()
    };
    return_list.push(item_object);
    console.log("Pushed " + JSON.stringify(item_object));
  }
  console.log(return_list);
  display_room_menu(return_list);
  return return_list;
}
function generate_scene_menu(sceneList){
  var return_list = [];
  for (var i = 0; i < sceneList.length; i++) { 
    console.log(sceneList[i].SceneName);
    var item_object = {
      title: sceneList[i].SceneName.trim(),
      SceneID: sceneList[i].SceneID
    };
    return_list.push(item_object);
    console.log("Pushed " + JSON.stringify(item_object));
  }
  console.log(return_list);
  display_scene_menu(return_list);
  return return_list;
}


function findElement(arr, propName, propValue) {
  console.log("Checking for " + propValue);
  for (var i=0; i < arr.length; i++) {
    if (arr[i][propName] == propValue){
      return arr[i];
    }
  }

  // will return undefined if not found; you could return a default instead
}
function get_devices(room_item){
  console.log("Grabbing devices for " + room_item.RoomName);
  var new_array = [];
  for (var j = 0; j < room_item.DeviceList.length; j++) { 
    var new_element = findElement(devices.DeviceList, "DeviceID", room_item.DeviceList[j].DeviceID);
    new_array.push(new_element);
  }
  
  console.log("This is the new array for devices: " + JSON.stringify(new_array));
  return new_array;
}

//Request Functions
//
//Each has a "Show_menu" argument, which should be true or false. This only exists so that I can call these
///to populate fields without bringing up the menus
function device_request(show_menu){
  var endpoint = "devices";
  var ajax = require('ajax');
  var answer;
  console.log("general get request!");
  var request_headers = {
    "Content-Type" : "application/json",
    "Authentication" : "APIKey " + API_Key,
    "Authorization" : "Bearer " + account_authorization
  };
  var request_url = insteon_server + "/api/v2/" + endpoint;
  ajax(
    {
      url: request_url,
      type: 'json',
      headers: request_headers
    },
    function(data,status,request){
      console.log("Requested " + request_url + " And got: " + JSON.stringify(data));
      devices = data;
      if (show_menu)
        generate_device_menu(devices.DeviceList);
    },
    function(error,status,request){
      console.log('Error! The return was ' + JSON.stringify(error) + " Also "  + error );
      if(status == 401){
        console.log("Access Denied, refreshing Bearer");
        if(looped){
          console.log("Looped");
        }else{
          looped=true;
        }
      }
    }
  );
  while(answer === null)
    {}
  return answer;
}

function scene_request(show_menu){
  var endpoint = "scenes";
  var ajax = require('ajax');
  var request_headers = {
    "Content-Type" : "application/json",
    "Authentication" : "APIKey " + API_Key,
    "Authorization" : "Bearer " + account_authorization
  };
  var request_url = insteon_server + "/api/v2/" + endpoint;
  ajax(
    {
      url: request_url,
      type: 'json',
      headers: request_headers
    },
    function(data,status,request){
      console.log("Requested " + request_url + " And got: " + JSON.stringify(data));
      scenes = data;
      if (show_menu)
        generate_scene_menu(scenes.SceneList);
    },
    function(error,status,request){
      console.log('Error! The return was ' + JSON.stringify(error) + " Also "  + error );
      if(status == 401){
        console.log("Access Denied, refreshing Bearer");
        if(looped){
          console.log("Looped");
        }else{
          looped=true;
        }
      }
      }
  );
}
function room_request(show_menu){
  var endpoint = "rooms?properties=all";
  console.log("Set devices to " + JSON.stringify(devices));
  var ajax = require('ajax');
  console.log("general get request!");
  var request_headers = {
    "Content-Type" : "application/json",
    "Authentication" : "APIKey " + API_Key,
    "Authorization" : "Bearer " + account_authorization
  };
  var request_url = insteon_server + "/api/v2/" + endpoint;
  ajax(
    {
      //async: false, //lol doesn't even work
      url: request_url,
      type: 'json',
      headers: request_headers
    },
    function(data,status,request){
      console.log("Requested " + request_url + " And got: " + JSON.stringify(data));
      rooms = data;
      if (show_menu)
        generate_room_menu(rooms.RoomList);
    },
    function(error,status,request){
      console.log('Error! The return was ' + JSON.stringify(error) + " Also "  + error );
      if(status == 401){
        console.log("Access Denied, refreshing Bearer");
        if(looped){
          console.log("Looped");
        }else{
          looped=true;
        }
      }
      }
  );
}
//Implemented "next request" so that I don't have to create one of these for each scene/room/device list 
function refresh_token(next_request){
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
      next_request();
    },
    function(error,status,request){
      console.log('Error! The return was ' + error );
    }
  );
}

//Commands Endpoint
//
//Different than the other requests - this one is a Post and takes date
//
//ToDo: Get the return of the result to figure out if stuff happened... or if a device is on/off
function commandEndpoint(command){
  var endpoint = "commands";
  var ajax = require('ajax');
  var request_headers = {
    "Content-Type" : "application/json",
    "Authentication" : "APIKey " + API_Key,
    "Authorization" : "Bearer " + account_authorization
  };
  var request_url = insteon_server + "/api/v2/" + endpoint;
  ajax(
    {
      //async: false, //lol doesn't even work
      url: request_url,
      type: 'json',
      method: 'post',
      headers: request_headers,
      data: command
    },
    function(data,status,request){
      console.log("Requested " + request_url + " And got: " + JSON.stringify(data));
    },
    function(error,status,request){
      console.log('Error! The return was ' + JSON.stringify(error) + " Also "  + error );
      if(status == 401){
        console.log("Access Denied, refreshing Bearer");
        if(looped){
          console.log("Looped");
        }else{
          looped=true;
        }
      }
      }
  );
  
}

//Menu starts, so i can call refresh_token(<type>_menu_start)
function scene_menu_start(){
  if (! scenes)
    scene_request(true);
  else
    generate_scene_menu(scenes.SceneList);
  
}
function device_menu_start(){
  if (! devices)
    device_request(true);
  else
    generate_device_menu(devices.DeviceList);
}
function room_menu_start(){
  if (! rooms )
    room_request(true);
  else
    generate_room_menu(rooms.RoomList);
}




//Menu Triggers 
//
//Triggered by the main menu things being clicked. Could put them in there, but this looks cleaner to me
function scene_menu_trigger(){
  console.log("Scene Menu trigger");
  refresh_token(scene_menu_start);
}
function device_menu_trigger(){
  console.log("Device Menu trigger");
  refresh_token(device_menu_start);
}
function room_menu_trigger(){
  console.log("Room Menu trigger");
  refresh_token(room_menu_start);
}




//Top menu - seperated as it's not really dynamic like the others
function top_menu_start(){
  var top_menu = new UI.Menu({
    sections: [{
      items: [
        {
          title: "Scenes",
          command: scene_menu_trigger
        },
        {
          title: "Rooms",
          command: room_menu_trigger
        },
        {
          title: "Devices",
          command: device_menu_trigger
        }
      ]
    }]
  });
  top_menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    e.item.command();
  });
  top_menu.show();
}


//On/Off Commands (devices and scenes)
//
//Pretty self explanitory
function deviceOn(deviceID){
  var commandObj = {
    device_id : deviceID,
    command: "on",
    level: 100
  };
  commandEndpoint(commandObj);
  
}
function deviceOff(deviceID){
  var commandObj = {
    device_id : deviceID,
    command: "off"
  };
  commandEndpoint(commandObj);
  
}
function sceneOn(sceneID){
  var commandObj = {
    scene_id : sceneID,
    command: "on"
  };
  commandEndpoint(commandObj);
  
}
function sceneOff(sceneID){
  var commandObj = {
    scene_id : sceneID,
    command: "off"
  };
  commandEndpoint(commandObj);
  
}

//Start Program
//
//Refresh everything, then spin up the top menu
refresh_token(populate_all);
top_menu_start();
