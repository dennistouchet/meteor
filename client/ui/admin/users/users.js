import { Template } from 'meteor/templating';
import { Workspaces } from '../../../../imports/collections/tenant/workspace.js';

import './users.html';

Template.users.onCreated(function(){
    Meteor.subscribe('users', function(){
      console.log("Users - Users collection subscribed");
    });
});

Template.users.helpers({
  users(){
    console.log("inside users template helpers");
    us = Meteor.users.find({});
    console.log(us);
    return us;
  }
});

Template.users.events({
  'click':function(){
    console.log("users page click event");
  }
});

Template.user.helpers({
  userConfig(id){
    var user = Meteor.users.findOne({_id:id});
    if(user){
      return user.config;
    }
  },
  getFirstEmail: function(emailObj){
    if(emailObj){
      emailObj.verificationTokens.forEach(eobj => {
      });
      return emailObj.verificationTokens;
    }
  },
  getFirstPassword: function(passObj){
    if(passObj){
      return passObj.bcrypt;
    }
  },
  getWorkspaceName: function(ws_id){
    var ws = Workspaces.findOne(ws_id);
    if(ws)
      return ws.name;
  }
});

Template.user.events({
  'click .edit': function(e){
    e.preventDefault();
    Meteor.tools.userEdit(this._id, {}, {});
    console.log("Clicked user:", this._id);
    ModalHelper.openUserEditModalFor(this._id);
  },
  'click .editconfig': function(e){
    e.preventDefault();
    var errDiv = document.getElementById("addErrUser");
    //reset errors
    errDiv.innerHTML = "";
    errDiv.style.display = "none";

    var ws = Session.get("currentWs");
    if(ws){
      var config = {
        workspace: ws._id,
        route: FlowRouter.current().path
      }

      Meteor.tools.userConfigEdit(this._id, config);
      console.log("Clicked user:", this._id);
      ModalHelper.openUserEditConfigModalFor(this._id);
    }
    else{
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error:</span> No Workspace Selected.</li>";
    }
  },
  'click .delete': function(e){
    e.preventDefault();
    Meteor.tools.userRemove(this._id);
  },
})
