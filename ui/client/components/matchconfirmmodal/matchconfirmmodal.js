import { Template } from 'meteor/templating';
import { MatchReults } from '../../../imports/collections/tenant/system.js';
import { Tasks } from '../../../imports/collections/global/task.js';

Template.matchconfirmmodal.helpers({
});

Template.matchconfirmmodal.events({
  'click #save': function(e) {
    e.preventDefault();
    //todo: get id from url
    ws = Session.get("currentWs");
    if(ws){
      Meteor.call('tasks.insert', "match", ws.id, res
      , (error, result) => {
        if(error){
          //console.log(err);
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + "<li><span>Task Error: </span>[ Match " + error.error + "] " + error.reason + "</li>";
          //return false;
          return;
        }
        else {
         //success
        }
      });
    }
  },
});

Meteor.subscribe("match_results", function (){
  console.log( "Matchconfirmmodal - MatchResults now subscribed.");
});


Meteor.subscribe("tasks", function (){
  console.log( "Matchconfirmmodal - Tasks now subscribed.");
});