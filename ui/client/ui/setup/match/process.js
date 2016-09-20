import { Template } from 'meteor/templating';

import './process.html';

Template.process.onCreated(function(){
  this.currentPage = new ReactiveVar("processZeroData"); //other is matchProcessComplete
});

Template.process.helpers({
  mwizard() {
    return Template.instance().currentPage.get();
  },
  properties(){
    //TODO: get vertify object properties
    return false;
  },
  queryParams(){
    console.log("process queryParams:");
    console.log(queryParams);
  },
  incompleteMatch : function(){
    //todo setup page
    return false;
  }
});

Template.process.events({
  'click' : function(){
    console.log("process click event");
    //ModalHelper.openMatchConfirmModalFor(sysId);
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
  'click .match' : function(e, t){
    console.log('Process - match event clicked.');
    //todo: get id from url
    ws = Session.get("currentWs");
/*
    if(ws){
      Meteor.call('tasks.insert', "matchtest", ws.id, res
      , (error, result) => {
        if(error){
          //console.log(err);
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Task Error: </span>[ matchtest " + error.error + "] " + error.reason + "</li>";
          //return false;
          return;
        }
        else {
          // t.currentPage.set( "matchProcessComplete" );
        }
      });
    }
*/
    console.log("about to set template");
    t.currentPage.set( "matchProcessComplete" );
  },
});

Template.matchProcessCompleteFooter.events({
  'click .returnToList' : function(e){
    console.log('Match - returnToList event clicked.');
    FlowRouter.go('/setup/match');
  },
  'click .viewMatchRecords' : function(e){
    console.log('Match - viewMatchRecords event clicked.');
    //FlowRouter.go('/setup/collect');
  },
  'click .editMatchRules' : function(e){
    console.log('Match - editMatchRules event clicked.');
    //FlowRouter.go('/setup/collect');
  },
  'click .acceptMatchModal' : function(e){
      e.preventDefault();

      ModalHelper.openMatchConfirmModalFor();

      console.log("Match - complete match modal clicked");
  },
});