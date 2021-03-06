import { Meteor } from  "meteor/meteor";
import { check } from 'meteor/check';
import { Systems } from "../imports/collections/tenant/system.js";
import { Connectors } from '../imports/collections/global/connector.js';
import { ExternalObjects } from "../imports/collections/tenant/external_object.js";
import { MatchSetup } from "../imports/collections/tenant/match_setup.js";
import { VertifyObjects } from "../imports/collections/tenant/vertify_object.js";
import { VertifyProperties } from '../imports/collections/tenant/vertify_property.js';
import { UserConfigurationSchema } from '../imports/collections/global/user.js';

Meteor.tools = {
  /*******************************************
            GENERAL CASE TOOLS
  *******************************************/
  myAlert : function(msg) {
    alert(msg);

    if (msg == null){
      return false;
    }
    return true;
  },
  CapitalizeFirstLetter : function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  },
  randomUUID : function(){
    var date = new Date().getTime();
    // user higher precision if available
    if(window.performance && typeof window.performance.now === "function"){
      date += performance.now();
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
      var rand = (date + Math.random()*16)%16 | 0;
      date = Math.floor(date/16);
      return (char=='x' ? rand : (rand&0x3|0x8)).toString(16);
    });
    return uuid;
  },
  taskRunner : function(ws_id, objectid, tasktype, other){
    //TODO
  },
  compare : function(a,b){
    if( a.name < b.name)
      return -1;
    if( a.name > b.name)
      return 1;
    return 0;
  },
  /*******************************************
            SPECIFIC CASE TOOLS
  *******************************************/
  connectStatus : function(ws_id){
    var systemCount = Systems.find({"workspace_id": ws_id}).count();
    if(systemCount > 1)
    {
      return true;
    }
    return false;
  },
  collectStatus : function(ws_id){
    var externalObjectCount = ExternalObjects.find({"workspace_id": ws_id}).count();
    if(this.connectStatus(ws_id) && (externalObjectCount > 1))
    {
      return true;
    }
    return false;
  },
  matchStatus : function(ws_id){
    //TODO: adjust to be more precise
    var complete = false;
    var vertifyObjectsExist = VertifyObjects.find({"workspace_id": ws_id, match: true});
    if(this.collectStatus(ws_id) && vertifyObjectsExist){

      vertifyObjectsExist.forEach(function(vo){

        var voextobj = vo.external_objects;
        if(voextobj){
          voextobj.forEach(function(voeo){
            if(voeo.approved) complete = voeo.approved;
          });
        }
      });
    }
    return complete;
  },
  alignStatus : function(ws_id){
    var approvedVPs = false;
    var approvedVO = false;

    if(this.matchStatus(ws_id)){
      var vertifyPropertiesExist = VertifyProperties.find({"workspace_id": ws_id});
      if(vertifyPropertiesExist.count() > 0){
        vertifyPropertiesExist.forEach(function(vprop){
        if(vprop.align) approvedVPs = vprop.align;
        });
      }
      var vertifyObjectsExist = VertifyObjects.find({"workspace_id": ws_id});
      if(vertifyObjectsExist.count() > 0){
        vertifyObjectsExist.forEach(function(vobj){
          if(vobj.align) approvedVO = vobj.align;
        });
      }
    }
    if(approvedVPs && approvedVO){
      return true;
    }
    else{
      return false;
    }
  },
  setupStatus : function(ws_id, status){
    if(status == "Connect"){
      return this.connectStatus(ws_id);
    }
    else if(status == "Collect"){
      return this.collectStatus(ws_id);
    }
    else if(status == "Match"){
      return this.matchStatus(ws_id);
    }
    else if(status == "Align"){
      return this.alignStatus(ws_id);
    }
    else{
      return false;
    }
  },
  getQueryParamByName: function(name, url){
    if(!url)
      url = window.location.href;

    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);

    if(!results) return null;
    if(!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },
  convertMatchSetuptoVertifyObj : function(ws_id, msid){
    //console.log("Convert values = ws_id: " + ws_id + " | msid: " + msid );

    //TODO: Check Vertify object with current External Object doesn't already exist.
    MatchObject = MatchSetup.findOne({"id": msid, "workspace_id": ws_id});
    if(MatchObject){
      //Create new VO
      if(MatchObject.new_object){
          Meteor.call('vertify_objects.insert', MatchObject,
          (error, result) => {
            if(error){
              //error
              throw new Meteor.Error(error.error,error.reason);
            }
            else{
              //success
            }
          });
      }//Update Existing VO
      else{
        //TODO: this function doesn't exist
        // NOT HAPPY PATH
        // Will be used to ADD TO EXISTING VO's that are in progress
          Meteor.call('vertify_objects.update', MatchObject);
      }
    }
    else{
      throw new Meteor.Error("Error","Error Retrieving Match Setup Object");
    }
  },
  proceedToNextStep : function (t, step){
    t.currentTab.set( step );

    var tabs = $(".nav-pills li");
    tabs.removeClass("active");

    var currentTab = $("ul").find("[data-template='" + step + "']");
    currentTab.addClass("active");
  },
  updateVertifyObjectStatus: function(ws_id, vo_id, field, status){
    Meteor.call('vertify_objects.updateStatus', ws_id, vo_id, field, status
    , (err, res) => {
      if(err){
        console.log("Tools.js updateVertifyObjectStatus error:");
        console.log(err);
        errDiv.style.display = 'block';
        errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[ Vertify Object " + err.error + "] " + err.reason + "</li>";
        //return false;
        return;
      }else {
        console.log("Vertify Object " + field + " status update success");
        //success
        console.log("result: "+res);
      }
    });
  },
  updateSystemStatus: function(ws_id, id, field, status){
    Meteor.call('systems.updateStatus', ws_id, id, field, status
    , (err, res) => {
      if(err){
        console.log("Tools.js updateSystemStatus error:");
        console.log(err);
      }else {
        //console.log("System " + field + " status update success");
        //console.log("result: "+res);
      }
    });
  },
  deleteAllWorkspaceData: function(ws_id){
    check(ws_id, String);
    if(Roles.userIsInRole(this.userId, 'admin', Roles.GLOBAL_GROUP)){
      Meteor.call('vertify_properties.removeAll', ws._id
      , (error, result) => {
        if(error){
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + error.error + "] " + error.reason + "</li>";
        }else{
          console.log("Vertify Properties removed for workspace: " + ws._id + " Items removed: " + result);
          Meteor.call('vertify_objects.removeAll', ws._id
          , (err, res) => {
            if(error){
              errDiv.style.display = 'block';
              errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li>";
            }else{
              console.log("Vertify Objects removed for workspace: " + ws._id + " Items removed: " + res);
              Meteor.call('external_objects.removeAll', ws._id
              , (error, result) => {
                if(error){
                  errDiv.style.display = 'block';
                  errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + error.error + "] " + error.reason + "</li>";
                }else{
                  console.log("External Objects removed for workspace: " + ws._id + " Items removed: " + result);
                  Meteor.call('systems.removeAll', ws._id
                  , (err, res) => {
                    if(error){
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li>";
                    }else{
                      console.log("Systems removed from workspace: " + ws._id + " Items removed: " + res);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    // delete vertify objects
    // delete match_setup
    // delete vertify objects
    // delete external_objects
    // delete systems
  },
  createDynamicCollection : function(ws_id, vs_id){
    console.log("Meteor.tools.createDynamicCollection called.");
    var collection_name = ws_id + "_" + vs_id;
    console.log("Collection name: " + collection_name);
  },
  cancelTask : function(t_id, ws_id, status, msg){
    check(t_id, String);
    check(ws_id, String);
    check(status, String);
    check(msg, String);

    Meteor.call('task.updateStatus', ws_id, t_id, status, msg,
    (error, results) => {
      if(error){
        console.log(error);
      }
      else{
        //success
        console.log(result);
      }
    });
  },
  validateSystem : function(t_id, ws_id, fields){
    check(t_id, String);
    check(ws_id, String);
    check(status, fields);


  },
  insertSystem : function(t_id, ws_id, system){
    check(t_id, String);
    check(ws_id, String);

    Meteor.call('systems.insert', ws_id, sysInfoId, nm.value.trim(), pf.value.trim()
      , maxtasks.value.trim(), sets
      , (err, res) => {
        if(err){
          //console.log(err);
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li>";
          //return false;
        }
        else {
          Meteor.call('tasks.insert', "authentication", ws_id, res
          , (error, result) => {
            if(error){
              //console.log(err);
              errDiv.style.display = 'block';
              errDiv.innerHTML = errDiv.innerHTML + "<li><span>Authentication Error: </span>[" + error.error + "] " + error.reason + "</li>";
              return;
            }
            else {
              //Meteor.tools.updateSystemStatus(ws._id, res, "authentication", true);
              Meteor.call('tasks.insert', "discover", ws_id, res
              , (err, result) => {
                if(err){
                  //console.log(err);
                  errDiv.style.display = 'block';
                  errDiv.innerHTML = errDiv.innerHTML + "<li><span>Discover Error: </span>[" + err.error + "] " + err.reason + "</li>";
                  return;
                }
                else {
                  //Meteor.tools.updateSystemStatus(ws._id, res, "discover", true);
                  Meteor.call('tasks.insert', "scan", ws_id, res
                  , (err, result) => {
                    if(err){
                      //console.log(err);
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Scan Error: </span>[" + err.error + "] " + err.reason + "</li>";
                      return;
                    }
                    else {
                      //Meteor.tools.updateSystemStatus(ws_id, res, "scan", true);
                      Modal.hide('systemaddmodal');
                    }
                  });
                }
              });
            }
          });
        }
      });

  },
  /*******************************************
            USER MOD FUNCTIONS
  *******************************************/
  userEdit : function(userId, options, config){
    check(options, Object);
    check(config, Object);
    console.log("todo: user edit");

    Meteor.users.update(userId, { $set: {"testVal": "todaysVal"}});
  },
  userConfigEdit : function(userId, config){
    check(userId, String);
    check(config, Object);

    var user = Meteor.users.findOne(userId);
    // Adds config object fields w/out replacing any OTHER existing object fields
    $.extend(true, user.config, config);

    console.log("config: ", config);
    UserConfigurationSchema.validate(user.config);
    Meteor.users.update(userId, { $set: {"config.workspace": user.config.workspace, "config.route": user.config.route }});
  },
  userRemove: function(userId){
    console.log("users.remove called with user: ", userId);

    return Meteor.users.remove(userId);
  },
  userAddToGlobal: function(userId){
    console.log("in userAddToGlobal: ", userId);
    var isSuperAdmin = Roles.userIsInRole(Meteor.userId(), 'super-admin');
    console.log("user in admin: ", isSuperAdmin);
    if(isSuperAdmin){
      Roles.addUsersToRoles(userId, 'super-admin', Roles.GLOBAL_GROUP);
      console.log("Upgraded user to super-admin in global group", userId);
      return true;
    }
    return false;
  },
  userRemoveFromGlobal: function(userId){
    console.log("in userRemoveFromGlobal: ", userId);
    var isSuperAdmin = Roles.userIsInRole(Meteor.userId(), 'super-admin');
    console.log("user in admin: ", isSuperAdmin);
    if(isSuperAdmin){
      Roles.removeUsersFromRoles(userId, 'super-admin', Roles.GLOBAL_GROUP);
      console.log("Removed from Global super admin", userId);
      return true;
    }
    return false
  },
  /*******************************************
        HAPPY PATH MOCKING FUNCTIONS
  *******************************************/
  getExternalObjects : function(ws_id, conn_id){
    console.log("getExternalObjects Called from tools.js");

    var netsuiteExternalObjects = [{
          name: "Netsuite Customer",
          is_dynamic: false
        },{
          name: "Netsuite Object",
          is_dynamic: false
        }];

    var marketoExternalObjects = [{
          name: "Marketo LeadRecord",
          is_dynamic: true
        },{
          name: "Marketo Agent",
          is_dynamic: true
        },{
          name: "Market Object",
          is_dynamic: true
        }];

    var jiraExternalObjects = [{
          name: "Jira Issue",
          is_dynamic: true
        }];

    var salesforceExternalObjects = [{
          name: "Salesforce User",
          is_dynamic: true
        },{
          name: "Salesforce Customer",
          is_dynamic: true
        }];

    var extobj = null;
    var connector = Connectors.findOne(conn_id);
    if(connector){
      if(connector.name === "Netsuite"){
        extobj = netsuiteExternalObjects;
      }
      else if (connector.name == "Marketo"){
        extobj = marketoExternalObjects;
      }
      else if (connector.name == "Salesforce"){
        extobj = salesforceExternalObjects;
      }
      else if (connector.name == "Jira"){
        extobj = jiraExternalObjects;
      }
    }
    return extobj;
  },
  getExternalObjectProperties: function(ws_id, sys_id){
    console.log("getExternalObjectProperties Called from tools.js");

    var ExternalObjectProperties1 = [{
        name: "internalId",
        is_custom: false,
        is_array: false,
        type: "integer",
        is_key: true
      },
      {
        name: "firstName",
        is_custom: false,
        is_array: false,
        type: "string",
        is_key: false
      },
      {
        name: "company",
        is_custom: false,
        is_array: false,
        type: "string",
        is_key: false
      }];

    var ExternalObjectProperties2 = [{
        name: "Id",
        is_custom: false,
        is_array: false,
        external_type: "System.Int32",
        type: "integer",
        is_key: true
      },
      {
        name: "Email",
        is_custom: false,
        is_array: false,
        external_type: "System.String",
        type: "string",
        is_key: false
      },
      {
        name: "CompanyId",
        is_custom: false,
        is_array: false,
        external_type: "System.Int32",
        type: "integer",
        is_key: true
      },
      {
        name: "leadAttributeList",
        is_custom: false,
        is_array: false,
        external_type: "System.String",
        type: "string",
        is_key: false
      },
      {
        name: "leadAttributeList.FirstName",
        is_custom: false,
        is_array: false,
        external_type: "System.String",
        type: "string",
        is_key: false
      },
      {
        name: "leadAttributeList.LastName",
        is_custom: false,
        is_array: false,
        external_type: "System.String",
        type: "string",
        is_key: true
      },
      {
        name: "leadAttributeList.Email",
        is_custom: false,
        is_array: false,
        external_type: "System.String",
        type: "string",
        is_key: true
      },
      {
        name: "leadAttributeList.Company",
        is_custom: false,
        is_array: false,
        external_type: "System.Int32",
        type: "string",
        is_key: false
      }];

    var properties = null;
    var system = Systems.findOne(sys_id, {"workspace_id": ws_id});
    if(system){
      var conn = Connectors.findOne(system.connector_id);

      if(conn.name == "Netsuite" || conn.name === "Jira"){
        properties = ExternalObjectProperties1;
        console.log("tools.js | inside property assignment");
      }
      else if (conn.name ==  "Marketo" || conn.name === "Salesforce"){
        properties = ExternalObjectProperties2;
        console.log("inside property assignment");
      }
    }
    return properties;

  },
  doTimeout(obj){
    method = obj.method;
    objid = obj.id;
    i = obj.index;

    //Make update call to percentage
    setTimeout( function() {
      Meteor.call(method, objid, i);
    }, (5000 + (i * 100)));
  },
  artificalProgressBarLoading: function(task, objid){
    console.log("Trigger " + this.CapitalizeFirstLetter(task) + " artifical loading...");

    var method;
    if(task == "collect"){
        method = 'external_objects.updateLoading';
    }else if(task == "analyze"){
        method = 'vertify_objects.updateLoading';
    }

    console.log(this.CapitalizeFirstLetter(task) + " artifical loading. Id: " + objid);
    for(i = 0; i < 100; i++){
      var j = i + 1;
      var params = {
        method : method,
        id : objid,
        index : j
      }
      this.doTimeout(params);
    }
  },
  updateVertifyPropertyAlignStatus: function(ws_id, vobjid){
    var vertifyPropertiesExist = VertifyProperties.find({"workspace_id": ws_id, "vertify_object_id": vobjid});
    if(vertifyPropertiesExist){
      console.log("TODO: this mock method is incomplete and does not update VertifyProperty collection");
      vertifyPropertiesExist.forEach(function(vp){
        var vpextobj = vp.external_objects;
        if(vpextobj){
        vpextobj.forEach(function(vpeo){
          vpeo.approved = true;
        });
      }
      });
    }
    else{
      throw new Meteor.Error("Missing Values", "No Vertify Properties found with the Vertify Object Id: " + vobjid);
    }
  }
}
