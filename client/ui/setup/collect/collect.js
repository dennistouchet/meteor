import { Template } from 'meteor/templating';
import { Workspaces } from '../../../../imports/collections/tenant/workspace.js';
import { Systems } from '../../../../imports/collections/tenant/system.js';
import { Connectors } from '../../../../imports/collections/global/connector.js';
import { ExternalObjects } from '../../../../imports/collections/tenant/external_object.js';
import { ObjectsList } from '../../../../imports/collections/global/object_list.js';
import { VertifyObjects } from '../../../../imports/collections/tenant/vertify_object.js';

import './collect.html';

Template.collect.onCreated(function(){
  Meteor.subscribe('workspaces', function (){
    console.log( "Collect - Workspaces now subscribed.");
  });

  Meteor.subscribe('systems', function (){
    console.log( "Collect - Systems now subscribed.");
  });

  Meteor.subscribe('connectors', function (){
    console.log( "Collect - Connectors now subscribed.");
  });

  Meteor.subscribe('objects_list', function (){
    console.log( "Collect - ObjectsList now subscribed.");
  });

  Meteor.subscribe('external_objects', function (){
    console.log( "Collect - ExternalObjects now subscribed.");
  });

});

Template.collect.helpers({
  systems() {
    var ws = Session.get("currentWs")
    if(ws)
    {
      var systems = Systems.find({"workspace_id": ws._id},{sort: {name:1}});
      systems.forEach(function(sys){
        sys.external_objects.sort(Meteor.tools.compare);
      });
      return systems;
    }
  },
  external_objects() {
    var ws = Session.get("currentWs")
    if(ws)
    {
      return ExternalObjects.find({"workspace_id": ws._id});
    }
  },
  isValid: function(){
    var ws = Session.get("currentWs");
    if(ws){
      return Meteor.tools.connectStatus(ws._id);
    }else{
      return false;
    }
  },
  hasObject : function(){
    var ws = Session.get("currentWs");
    var has = false;
    if(ws){
      var object = ExternalObjects.find({"workspace_id": ws._id});
      if(object.count() > 0){
        has = true;
      }
    }
    return has;
  },
  hasEnoughObject : function(){
    //TODO: NEED TO VERIFY THESE ARE ALSO COLLECTED
    var ws = Session.get("currentWs");
    var hasEnough = false;
    if(ws){
      var object = ExternalObjects.find({"workspace_id": ws._id});
      if(object.count() > 1){
        hasEnough = true;
      }
    }
    return hasEnough;
  }
});

Template.collect.events({
  'click .delete' : function(){
    var errDiv = document.getElementById("addErrCollect");
    errDiv.style.display = 'none';
    errDiv.innerHTML = ""; //reset errors

    var ws = Session.get("currentWs");
    var eo = ExternalObjects.findOne(this._id);

    //TODO: move this later
    // TODO: ad validation to check by external object
    var objectCount = VertifyObjects.find({"workspace_id": ws._id}).count();
    if(objectCount > 0){
      //TODO: improve with error Template
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[ Existing Dependencies ] You must delete any existing Vertify Objects before you can remove external objects.</li>";
    }
    else{
      Meteor.call('tasks.insert', 'deleteexternalobject', ws._id, eo.id
      , (error, result) => {
        if(error){
          //console.log(err);
          //TODO: improve with error Template
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[ Task " + err.error + "] " + err.reason + "</li>";
        }
        else {
          console.log('Successfully created task: deleteexternalobject');
          //TODO: Change this so elixir deletes workspace data by oplog data
          /*
          Meteor.call('external_objects.remove', this._id, ws._id
          , (err, res) => {
            if(err){
              //console.log(err);
              //TODO: improve with error Template
              errDiv.style.display = 'block';
              errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[ ExternalObject " + err.error + "] " + err.reason + "</li>";
            }
            else {
              // successful call
            }
          });*/
        }
      });
    }
  },
  'click .toConnect': function(){
    FlowRouter.go('/setup/connect');
  },
  'click .toMatch' : function(e){
    console.log('Collect - toMatch event clicked.');
    FlowRouter.go('/setup/match');
  },
  'click .objlistddl li a' : function(e, t){
    var errDiv = document.getElementById("addErrCollect");
    errDiv.style.display = 'none';
    errDiv.innerHTML = ""; //reset errors

    var text = e.target.text;
    document.getElementById("objectlist").value = text.toString().trim();
    var sysId = parseInt(e.target.getAttribute("data-system"));
    var name = e.target.getAttribute("data-name");

    var ws = Session.get("currentWs");
    if(ws == null){
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>No Workspace selected.</li>";
      return;
    }

    //verify that variable doesn't already exist for the system
    var obj = ExternalObjects.findOne({"name": name.trim(), "system_id": sysId });
    if(obj == null){
      //console.log("ws._id: " + ws._id + "sys.id: " + sysId + " obj.id: " + thisId + " | name: " + name );
      Meteor.call('external_objects.insert'
        , ws._id, sysId, name
        , (err, res) => {
          if(err){
            //console.log(err);
            //TODO: improve with error Template
            errDiv.style.display = 'block';
            errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li><li>" + err + "</li>";
            console.log(err);
          }
          else {
            // successful call
            // return true;
            Meteor.call('tasks.insert', "collectschema", ws._id, res
            , (error, result) => {
              if(error){
                //console.log(err);
                errDiv.style.display = 'block';
                errDiv.innerHTML = errDiv.innerHTML + "<li><span>CollectSchema Error: </span>[ " + error.error + "] " + error.reason + "</li>";
                //return false;
                return;
              }
              else {
                // successful call

                Meteor.call('tasks.insert', "collect", ws._id, res
                , (err, res) => {
                  if(err){
                    //console.log(err);
                    errDiv.style.display = 'block';
                    errDiv.innerHTML = errDiv.innerHTML + "<li><span>Collect Error: </span>[" + err.error + "] " + err.reason + "</li>";
                    //return false;
                    return;
                  }
                  else {
                    // successful call
                    Modal.hide('systemaddmodal');
                  }
                });
              }
            });

            Meteor.tools.artificalProgressBarLoading("collect", res);
            console.log("called artifical loading");
          }
        });
    }
    else{
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span> ExternalObject already exists.</li>";
    }
  },
  'click .addobj a' : function(e, t){
    var errDiv = document.getElementById("addErrCollect");
    errDiv.style.display = 'none';
    errDiv.innerHTML = ""; //reset errors

    var text = e.target.childNodes[4].textContent + " - " +  e.target.childNodes[1].textContent;
    document.getElementById("objectlist").value = text;
    var sysId = parseInt(e.target.childNodes[7].textContent);
    var name = e.target.childNodes[1].textContent;

    var ws = Session.get("currentWs");
    if(ws == null){
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>No Workspace selected.</li>";
      return;
    }

    //verify that variable doesn't already exist for the system
    var obj = ExternalObjects.findOne({"name": name.trim(), "system_id": sysId });
    if(obj == null){
      //console.log("ws._id: " + ws._id + "sys.id: " + sysId + " obj.id: " + thisId );
      Meteor.call('external_objects.insert'
        , ws._id, sysId, name
        , (err, res) => {
          if(err){
            //console.log(err);
            //TODO: improve with error Template
            errDiv.style.display = 'block';
            errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li>";
          }
          else {
            // successful call
            // return true;
            Meteor.call('tasks.insert', "collectschema", ws._id, res
            , (error, result) => {
              if(error){
                //console.log(err);
                errDiv.style.display = 'block';
                errDiv.innerHTML = errDiv.innerHTML + "<li><span>CollectSchema Error: </span>[ " + error.error + "] " + error.reason + "</li>";
                //return false;
                return;
              }
              else {
                // successful call
                Meteor.call('tasks.insert', "collect", ws._id, res
                , (err, res) => {
                  if(err){
                    //console.log(err);
                    errDiv.style.display = 'block';
                    errDiv.innerHTML = errDiv.innerHTML + "<li><span>Collect Error: </span>[" + err.error + "] " + err.reason + "</li>";
                    //return false;
                    return;
                  }
                  else {
                    // successful call

                    Modal.hide('systemaddmodal');
                  }
                });
              }
            });
            Meteor.tools.artificalProgressBarLoading("collect", res);
            console.log("called artifical loading");
          }
        });
    }
    else{
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span> External Objects already exist.</li>";
    }
  },
});

Template.collectZeroObjHeader.helpers({
  hasWorkspace : function(){
    if(Session.get("currentWs")){
      return true;
    }
    else {
      return false;
    }
  },
  hasSystems : function(){
    var ws = Session.get("currentWs");
    var has = false;
    if(ws) {
      var sys = Systems.find({"workspace_id": ws._id});
      if(sys.count > 0)
        has = true;
    }
    return has;
  },
});

Template.collectZeroObjHeader.events({
  'click .toConnect': function(){
    FlowRouter.go('/setup/connect');
  }
});

Template.systemObjectList.helpers({
  getObjectName : function(id){
    var i = parseInt(id);
    //var c = ObjectsList.find({"id" : id}).count();
    //alert("count: " + c);
    var curObj = ObjectsList.findOne({"id": id});
    return curObj.name;
  },
  getSystemName : function(id){
    if(Session.get("currentWs")){
      var curSys = Systems.findOne({"id":id});
      return curSys.name;
    }
    else {
      console.log("no workspace selected");
      return "DefaultSystem";
    }
  },
  doesntAlreadyExist : function(name, id){
    var extObj = ExternalObjects.findOne({"system_id": id, "name": name});
    if(extObj){
      return false;
    }
    return true;
  }
});

Template.objectList.helpers({
  getObjectName : function(id){
    var i = parseInt(id);
    //var c = ObjectsList.find({"id" : id}).count();
    //alert("count: " + c);
    var curObj = ObjectsList.findOne({"id": id});
    return curObj.name;
  },
  getSystemName : function(id){
    var curSys = Systems.findOne({"id":id});
    return curSys.name;
  },
  getConnectorName : function(id){
    var curSys = Systems.findOne({"id":id});
    var curCon = Connectors.findOne({"id": curSys.connector_id});
    return curCon.name;
  },
  doesntAlreadyExist : function(name, id){
    var extObj = ExternalObjects.findOne({"system_id": id, "name": name});
    if(extObj){
      return false;
    }
    return true;
  },
});

Template.collectObj.helpers({
  getObjectName : function(id){
    var i = parseInt(id);
    //var c = ObjectsList.find({"id" : id}).count();
    //alert("count: " + c);
    var curObj = ObjectsList.findOne({"id": id});
    return curObj.name;
  },
  getSystemName : function(id){
    var curSys = Systems.findOne({"id":id});
    return curSys.name;
  },
  getConnectorName : function(id){
    var curSys = Systems.findOne({"id":id});
    var curCon = Connectors.findOne({"id": curSys.connector_id});
    return curCon.name;
  },
  getCollectedRecords : function(record_count, percentage){
    if(percentage == 0){
      return percentage;
    }
    percentage = (percentage / 100);
    var records_collected = record_count * percentage;
    return records_collected;
  },
  timeRemaining : function(percentage){
    var time = 100 - percentage;
    return time + " seconds";
  }
});