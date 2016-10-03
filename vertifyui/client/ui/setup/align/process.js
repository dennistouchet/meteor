import { Template } from 'meteor/templating';
import { ExternalObjects } from '../../../../imports/collections/tenant/external_object.js';
import { VertifyObjects } from '../../../../imports/collections/tenant/vertify_object.js';
import { VertifyProperties } from '../../../../imports/collections/tenant/vertify_property.js'
import { AlignResults } from '../../../../imports/collections/workspace/align_result.js'

import './process.html';

Template.alignprocess.onCreated(function(){
  this.currentPage = new ReactiveVar("alignProcessZeroData"); //other Page is alignProcessComplete
});

Template.alignprocess.helpers({
  aprocess(){
    return Template.instance().currentPage.get();
  },
  properties(){
    //TODO:
    return null;
  },
  vertify_object(){
    //TODO:
    return "VertifyLeadNs";
  },
  hasObjects(){
    //TODO:
    return false;
  },
  hasProperties(){
    //TODO:
    return false;
  }
});


Template.alignprocess.events({
  'click' : function(){
    console.log("alignprocess click event");
    //ModalHelper.openAlignConfirmModalFor(sysId);
  },
  'change input': function(e, t){
    //TODO: change this event so it only happens on the radio buttons and not other inputs
    console.log(e.target);
    var el = e.target.value;

    if(el === "criteria"){
      console.log("show filter");
      document.getElementById(("filterCriteria")).style.display = "inline";
    }
    else if(el === "count"){
      document.getElementById(("filterCriteria")).style.display = "none";
    }
  },
  'click .align' : function(e, t){
    console.log('Align Process - align event clicked.');
    var errDiv = document.getElementById("addErrAlign");
    errDiv.style.display = 'none';
    errDiv.innerHTML = ""; //reset errors

    ws = Session.get("currentWs");
    var id = Meteor.tools.getQueryParamByName("id");
    var vo = VertifyObjects.findOne({"_id": id});

    if(ws && vo){
      Meteor.call('tasks.insert', "aligntest", ws.id, vo.id
      , (error, result) => {
        if(error){
          //console.log(err);
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Task Error: </span>[ aligntest " + error.error + "] " + error.reason + "</li>";
          //return false;
          return;
        }
        else {
          t.currentPage.set( "alignProcessComplete" );
        }
      });
    }else{
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Task Error: </span>[ Missing Values ] ws:" + ws.id + " | vo :" + vo + "</li>";

    }
  },
});

Template.alignProcessComplete.helpers({
  align_results(){
    var ws = Session.get("currentWs");
    if(ws){
        return AlignResults.findOne({});
    }
    return null;
  },
  vertify_objects(){
    var ws = Session.get("currentWs");
    if(ws){
        return VertifyObjects.find({"id": ws.id});
    }
    return null;
  },
  getVertifyPropertyName: function(id){
    var ws = Session.get("currentWs");
    if(ws){
      var VP = VertifyProperties.findOne({"id": id});
      return VP.name;
    }
    return "no name";
  },
  getAligned : function(){
    return 4;
  },
  getTotal : function(){
    return 5;
  },
  getExternalObjectName: function(id){
    var ws = Session.get("currentWs");
    if(ws){
      var EO = ExternalObjects.findOne({"workspace_id": ws.id, "id": id});
      return EO.name;
    }
    return "no name";
  }
});

Template.alignProcessComplete.events({
  'click .viewAlignment': function(e){
    //TODO:
  },
  'click .cancelAlignment': function(e){
    //TODO cancel alignment/delete align results?
    console.log('cancel alignment clicked');
    FlowRouter.go('/setup/align');
  },
  'click .acceptAlignModal': function(e){
    e.preventDefault();
    var vertifyobjectid = Meteor.tools.getQueryParamByName("id");
    var ws = Session.get("currentWs");
    var alignresults = AlignResults.findOne({"workspace_id": ws.id});

    ModalHelper.openAlignConfirmModalFor(vertifyobjectid, alignresults.id);

    console.log("Align - complete align modal clicked");
  }
});

Meteor.subscribe('external_objects', function (){
  console.log( "Align/Process - VertifyObjects now subscribed." );
});

Meteor.subscribe('vertify_objects', function (){
  console.log( "Align/Process - VertifyObjects now subscribed." );
});

Meteor.subscribe('vertify_properties', function (){
  console.log( "Align/Process - VertifyProperties now subscribed." );
});

Meteor.subscribe('align_results', function (){
  console.log( "Align/Process - AlignResults now subscribed." );
});
