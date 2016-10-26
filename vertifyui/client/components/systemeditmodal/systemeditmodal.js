import { Template } from 'meteor/templating';

import { Systems } from '../../../imports/collections/tenant/system.js';

Template.systemeditmodal.helpers({
  system: function(){
    var sysId = Session.get('selectedSystem');

    if(typeof sysId !== "undefined") {
      var system = Systems.findOne(sysId);
      return system;
    } else {
      return {name: '', pf:'', st: '', un:'', pw:'',maxtasks:''}
    }
  }
});

Template.systemeditmodal.events({

  'click #save': function(e) {
    e.preventDefault();
    var errDiv = document.getElementById("editErrModal");
    errDiv.style.display = 'none';
    errDiv.innerHTML = ""; //reset errors

    //TODO: VERIFY WORKSPACE ID
    var sysId = Session.get('selectedSystem');

    var nm = document.getElementById("name");
    var pf = document.getElementById("pf");
    var maxtasks = document.getElementById("maxtasks");
    var settings = document.querySelectorAll('*[id^="setting_"]');

    if(sysId) {
      //TODO: Fix logic error that doesn't allow it to reenter same name/prefix for itself
      var nmexists = Systems.findOne({"name" : nm.value.trim()});
      var pfexists = Systems.findOne({"prefix" : pf.value.trim()});
      var setErr = 0;
      if (settings){
            for(i = 0; i < settings.length; i++){
              if(settings[i].value === ''){
                errDiv.style.display = 'block';
                errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error:</span> Missing Credential parameter: " + settings[i].name + ".</li>";
                setErr++;
              }
            }
      }
      var sets = [];
      for(i = 0; i < settings.length; i++){
        var set = {
          setting: settings[i].name,
          value: settings[i].value
        }
        console.log(set);
        sets.push(set);
      }

      if (nmexists) {
        errDiv.style.display = 'block';
        errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error:</span> The system name already exists. Please use a different name</li>";
      }
      if (pfexists) {
        errDiv.style.display = 'block';
        errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error:</span> The system prefix already exists. Please use a different prefix</li>";
      }
      if(nmexists == null && pfexists == null && setErr == 0){
      Meteor.call('systems.edit', sysId, nm.value.trim(), pf.value.trim()
        , parseInt(maxtasks.value), sets
        , (err, res) => {
          if(err){
            //console.log(err);
            //return false;
            errDiv.style.display = 'block';
            errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[" + err.error + "] " + err.reason + "</li>";
          }
          else {
            Meteor.call('tasks.insert', "authentication", ws.id, res
            , (error, result) => {
              if(error){
                //console.log(err);
                errDiv.style.display = 'block';
                errDiv.innerHTML = errDiv.innerHTML + "<li><span>Authentication Error: </span>[" + error.error + "] " + error.reason + "</li>";
                //return false;
                return;
              }
              else {
                // successful call
                Meteor.call('tasks.insert', "discover", ws.id, res
                , (err, result) => {
                  if(err){
                    //console.log(err);
                    errDiv.style.display = 'block';
                    errDiv.innerHTML = errDiv.innerHTML + "<li><span>Discover Error: </span>[" + err.error + "] " + err.reason + "</li>";
                    //return false;
                    return;
                  }
                  else {
                    // successful call
                    Meteor.call('tasks.insert', "scan", ws.id, res
                    , (err, result) => {
                      if(err){
                        //console.log(err);
                        errDiv.style.display = 'block';
                        errDiv.innerHTML = errDiv.innerHTML + "<li><span>Scan Error: </span>[" + err.error + "] " + err.reason + "</li>";
                        //return false;
                        return;
                      }
                      else {
                        // successful call

                        Modal.hide('systemeditmodal');
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
    else {
      errDiv.style.display = 'block';
      errDiv.innerHTML = errDiv.innerHTML + "<li><span>Error: </span>[ Missing Value ] No System selected</li>";
    }
  }
});

Meteor.subscribe('systems', function (){
  console.log( "Systemeditmodal - Systems now subscribed.");
});
