import { Template } from 'meteor/templating';
import { Workspaces } from '../../../../imports/collections/tenant/workspace.js';
import { Systems } from '../../../../imports/collections/tenant/system.js';
import { ExternalObjects } from '../../../../imports/collections/tenant/external_object.js';
import { VertifyObjects } from '../../../../imports/collections/tenant/vertify_object.js';
import { MatchSetup } from '../../../../imports/collections/tenant/match_setup.js';

Template.vertifywizard.onCreated( function() {
  Meteor.subscribe('external_objects', function (){
    console.log( "Match Wizard - ExternalObjects now subscribed.");
  });

  Meteor.subscribe('match_setup', function (){
    console.log( "Match Wizard - MatchSetup now subscribed.");
  });

  //KEEP TRACK OF THE CURRENT VERTIFY OBJECT SETUP PROCESS -incomplete
  delete Session.keys['setupId'];
  var ws = Session.get('currentWs');
  if(ws === 'undefined'){
    return false;
  }
  // Set to Select step for workspaces with no Vertify Objects
  var count = VertifyObjects.find({"workspace_id": ws._id}).count();
  if(count > 0)
  {
    this.currentTab = new ReactiveVar("vwStart");
  }
  else{
    this.currentTab = new ReactiveVar("vwStart");
    //TODO change this and set "active" class
    //this.currentTab = new ReactiveVar("vwSelect");
  }
});

Template.vertifywizard.helpers({
  vwizard : function() {
    return Template.instance().currentTab.get();
  },
  vwizardData : function() {
    var tab = Template.instance().currentTab.get();

    var data = {
      "vwStart": [],
      "vwSelect":[],
      "vwRecords":[],
      "vwMatch":[],
      "vwFinish":[]
    };

    return data[tab];
  },
  isActive : function(tab){
    var currentTab = Template.instance().currentTab.get();
    if(tab == currentTab){
      return true;
    }
    return false;
  },
});

Template.vertifywizard.events({
  'click .nav-pills li' : function(e,t){
    var currentTab = $(e.target).closest("li");

    currentTab.addClass("active");
    $(".nav-pills li").not( currentTab ).removeClass("active");

    console.log("Selected Dynamic Template: " + currentTab.data("template"));
    t.currentTab.set( currentTab.data("template") );
  },
  'click .next' : function(e,t){
    var tnt = Session.get("currentTnt");
    var ws = Session.get('currentWs');
    var steps = [ 'vwStart', 'vwSelect', 'vwFilter', 'vwMatch', 'vwFinish' ];
    var tab = Template.instance().currentTab.get();
    var index = null;
    var errDiv = document.getElementById("addErrMatch");
    errDiv.innerHtml = '';
    errDiv.style.display = "none"; //reset errors
    var errors = 0;

    for(i = 0; i < steps.length; i++){
      if(steps[i] === tab){
        index = i + 1;
      }
    }

    if( index > steps.length){
      //TODO THROW ERROR
    }
    else if( index == steps.length){
      console.log("Finish Next clicked - Exiting Wizard" );
      if(msId){
        //vo_name:
        var vname = document.getElementById("vertifyObjectName").value;
        console.log(vname);
        // TODO: CHECK IF VERTIFY OBJCET NAME EXISTS IN WORKSPACE
        // CREATE FUNCTION IN METEOR.TOOLS
        var sot = document.querySelector('input[name="truthRadio"]:checked');
        if(vname && sot.id){
          Meteor.call('match_setup.finishedit', msId, ws._id, steps[index -1], vname, sot.id,
           (err, res) => {
            if(err){
              //console.log(err);
              //TODO: improve with error Template
              errDiv.style.display = 'block';
              errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
              return;
            }
            else{
              //SUCCESS
              Meteor.tools.convertMatchSetuptoVertifyObj(ws._id, msId,
               (error, result) => {
                if(error){
                  //TODO: improve with error Template
                  errDiv.style.display = 'block';
                  errDiv.innerHTML = errDiv.innerHTML + '<li><span>Insert Error: </span>[' + error.error + error.reason + ' ] ' + error.details + '</li>';
                }
                else{
                  console.log("Vertify Object Creation successful");
                  FlowRouter.go('/setup/match');
                }
              });
            }
          });
        }else{
          //TODO: improve with error Template
          errDiv.style.display = 'block';
          errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[Missing Value] Please enter a name for your Vertify Object and select the system of truth.</li>';
        }
      }
    }
    else{
      msId = Session.get("setupId");
      switch(index){
        case 1: console.log("start next clicked - moving to select");
                var isnew = document.getElementById("radionew").checked;
                if(msId){
                  Meteor.call('match_setup.startedit', msId, ws._id, steps[index -1], isnew,
                   (err, res) => {
                    if(err){
                      //console.log(err);
                      //TODO: improve with error Template
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
                      return;
                    }
                    else{
                      Meteor.tools.proceedToNextStep(t, steps[index]);
                    }
                  });
                }else{
                  var newid = Meteor.call('match_setup.insert', tnt._id, ws._id, steps[index -1], isnew,
                   (err, res) => {
                    if(err){
                      //console.log(err);
                      //TODO: improve with error Template
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
                      return;
                    }
                    else{
                      Session.set("setupId", res);
                      Meteor.tools.proceedToNextStep(t, steps[index]);
                    }
                  });
                }
                break;
        case 2: console.log("select next clicked - moving to filter");
                if(msId){
                  currentMs = MatchSetup.findOne({"id": parseInt(msId), "workspace_id": ws._id });
                  console.log(currentMs);
                  if(currentMs){
                    if(currentMs.new_object){
                      var extobj1 = document.getElementById("extobj1").getAttribute("data-id");
                      var extobj2 = document.getElementById("extobj2").getAttribute("data-id");
                      console.log("extobj1: " + extobj1 + "| extobj2: " + extobj2);

                      if(extobj1 && extobj2){
                        if(extobj1 == extobj2){
                          errDiv.style.display = 'block';
                          errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span> Selected values are the same.</li>';
                          return;
                        }
                        var extobjids = [extobj1, extobj2];
                        Meteor.call('match_setup.selectedit', msId, ws._id, steps[index -1], extobjids,
                         (err, res) => {
                          if(err){
                            //console.log(err);
                            //TODO: improve with error Template
                            errDiv.style.display = 'block';
                            errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
                            return;
                          }
                          else{
                            Meteor.tools.proceedToNextStep(t, steps[index]);
                          }
                        });
                      }
                      else{
                        errDiv.style.display = 'block';
                        errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span> Missing Values. </li>';
                        return;
                      }
                    }else{
                      //TODO: existing object logic
                      //check that value 1 exists
                      //check that value 1 isn't already on the lists
                      console.log("Existing Object Logic called");
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span> Existing Objects are not currently supported. Please go back and select new object creation.</li>';
                      return;
                    }
                  }
                }
                break;
        case 3: console.log("filter next clicked - moving to match");
                if(msId){
                  var radioalls = document.getElementsByClassName("radioall");
                  allRecords1 = radioalls[0].checked;
                  allRecords2 = radioalls[1].checked;

                  var output = Meteor.call('match_setup.filteredit',
                     Session.get("setupId"), ws._id, steps[index -1], allRecords1, allRecords2, null, null,
                     (err, res) => {
                      if(err){
                        //console.log(err);
                        //TODO: improve with error Template
                        errDiv.style.display = 'block';
                        errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
                        return;
                      }
                      else{
                        Meteor.tools.proceedToNextStep(t, steps[index]);
                      }
                    });
                }
                break;
        case 4: console.log("match next clicked - moving to finish");
                if(msId){
                  var match_setup = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
                  if(match_setup){
                    var ids = match_setup.eo_ids;
                    var field1 = document.getElementById("field" + ids[0]).value;
                    var i1 = ids[0];
                    var field2 = document.getElementById("field" + ids[1]).value;
                    var i2 = ids[1];
                    var pm = document.getElementById("percentMatch").getAttribute("data-value");
                    console.log("fields");
                    console.log(field1);
                    console.log(field2);
                    if(!field1 && !(field1 instanceof String)){
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[ Validation Error ] Please select a value for Field 1</li>';
                      errors += 1;
                    }
                    if(!field2 && !(field2 instanceof String)){
                      errDiv.style.display = 'block';
                      errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[ Validation Error ] Please select a value for Field 2</li>';
                      errors += 1;
                    }

                    match_criteria = [{
                      field1: field1,
                      id1: i1,
                      field2: field2,
                      id2: i2,
                      match_percentage: parseInt(pm)
                    }];

                    if(errors > 0) return;
                    Meteor.call('match_setup.matchedit', msId, ws._id, steps[index -1], match_criteria,
                     (err, res) => {
                      if(err){
                        //console.log(err);
                        //TODO: improve with error Template
                        errDiv.style.display = 'block';
                        errDiv.innerHTML = errDiv.innerHTML + '<li><span>Error: </span>[' + err.error + err.reason + ' ] ' + err.details + '</li>';
                        return;
                      }
                      else{
                        Meteor.tools.proceedToNextStep(t, steps[index]);
                      }
                    });
                  }
                }
                break;
      }
    }
  },
  'click .back' : function(e,t){
    var steps = [ 'vwStart', 'vwSelect', 'vwFilter', 'vwMatch', 'vwFinish' ];
    var tab = Template.instance().currentTab.get();
    var index = null;
    for(i = 0; i < steps.length; i++){
      if(steps[i] === tab){
        index = i - 1;
      }
    }
    if( index < 0){
      console.log( "Back clicked" );
      FlowRouter.go('/setup/match');
    }
    else{
      switch(index){
        case 0: console.log("move to start");
                break;
        case 1: console.log("move to select");
                break;
        case 2: console.log("move to filter");
                break;
        case 3: console.log("move to match");
                break;
        default:console.log("defaulted");
      }

      t.currentTab.set( steps[index] );

      var tabs = $(".nav-pills li");
      tabs.removeClass("active");

      var currentTab = $("ul").find("[data-template='" + steps[index] + "']");
      currentTab.addClass("active");
    }
    //TODO: SET BACK BUTTON TEXT TO CANCEL
  },
});

Template.vwStart.helpers({
    vertify_objects(){
      var ws = Session.get('currentWs');
      if(ws){
        return VertifyObjects.find({"workspace_id": ws._id});
      }
      return;
    }
});

Template.vwStart.events({
  'change .radio' : function(e, t){
    var radio = e.target;
    var input = document.getElementById("objtext");
    var ddl = document.getElementById("objddlbtn");

    if(radio.value == "exist"){
      input.disabled = false;
      ddl.disabled = false;
    }
    else{
      input.disabled = true;
      ddl.disabled = true;
    }
  }
});

Template.vwSelect.helpers({
    external_objects(){
      var ws = Session.get('currentWs');
      if(ws){
        return ExternalObjects.find({"workspace_id": ws._id},{sort : {name: 1, "properties.name": 1} });
      }
      return;
    },
    getSystemName : function(sys_id){
      var ws = Session.get('currentWs');
      if(ws){
        return Systems.findOne(sys_id,{"workspace_id": ws._id}).name;
      }
    }
});

Template.vwSelect.events({
  'click .objddl1 li a' : function(e, t){
    var text = e.target.text;
    document.getElementById("extobj1").value = text.toString().trim();
    var eoId = $(e.target).closest('li').data("id");
    document.getElementById("extobj1").setAttribute("data-id", eoId);
    console.log("eoId: " + eoId);

  },
  'click .objddl2 li a' : function(e, t){
    var text = e.target.text;
    document.getElementById("extobj2").value = text.toString().trim();
    var eoId = $(e.target).closest('li').data("id");
    document.getElementById("extobj2").setAttribute("data-id", eoId);
    console.log("eoId: " + eoId);


    //TODO: remove element from other dropdownlist
    //var element document.getElementById((eoid + "obj1"));
    //element.parentNode.removeChild(element);
  },
});

Template.vwFilter.helpers({
  external_objects(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
      console.log(msObj);
      var ids = msObj.eo_ids;
      console.log(msObj.eo_ids);
      return ExternalObjects.find({"_id": { $in: ids }},{sort : {name: 1, "properties.$.name": 1} });
    }else{
      return;
    }
  },
});

Template.filterRecords.helpers({
  getSystemName : function(sys_id){
    var ws = Session.get('currentWs');
    if(ws){
      return Systems.findOne(sys_id, {"workspace_id": ws._id}).name;
    }
  }
});

Template.filterRecords.events({
  'change input': function(e, t){
    //TODO: change this event so it only happens on the radio buttons and not other inputs
    console.log(e.target);
    var el = e.target.value;
    var id = e.target.getAttribute("data-id");

    if(el === "recordFilter"){
      console.log("show filter");
      document.getElementById(("filterCriteria" + id)).style.display = "inline";
    }
    else if(el === "recordAll"){
      document.getElementById(("filterCriteria" + id)).style.display = "none";
    }
  },
  'click .objddl li a' : function(e, t){
    var text = e.target.text;
    var id = e.target.parentNode.parentNode.parentNode.getAttribute("data-id");
    document.getElementById(("extobjprop"+id)).value = text.toString().trim();
    var eopId = e.target.parentNode.getAttribute("data-id");
    document.getElementById(("extobjprop"+id)).setAttribute("data-id", eopId);
    console.log("eopId: " + eopId);
  },
});

Template.vwMatch.helpers({
  external_objects(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
      var ids = msObj.eo_ids;
      return ExternalObjects.find({"_id": { $in: ids }},{sort : {name: 1} });
    }else{
      return;
    }
  }
});

Template.vwMatch.events({
  'click .percentddl li a' : function(e,t){
    console.log("Object Event: " + e + " | Event Target: " + $(e.target));

    var val = e.target.parentNode.getAttribute('data-value');
    document.getElementById("percentMatch").setAttribute('data-value', val);
    document.getElementById("percentMatch").value = e.target.text;
  },
  'click .fieldddl li a' : function(e,t){
    console.log("Object Event: " + e + " | Event Target: " + $(e.target));

    var field = "field" + e.target.parentNode.parentNode.getAttribute("data-id");
    console.log("field name value: " + field);
    document.getElementById(field).value = e.target.text;
  },
});

Template.vwMatchObjects.helpers({
  eo_sorted_properties(_id){
    var external_object = ExternalObjects.findOne(_id,{fields: {properties: 1}});
    external_object.properties.sort(Meteor.tools.compare);
    return external_object;
  },
  getSystemName : function(sys_id){
    var ws = Session.get('currentWs');
    if(ws){
      return Systems.findOne(sys_id,{"workspace_id": ws._id}).name;
    }
  }
});

Template.vwFinish.helpers({
  match_setup(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
    }else{
      return;
    }
  },
  external_objects(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
      var ids = msObj.eo_ids;
      return ExternalObjects.find({"_id": { $in: ids }},{sort : {name: 1, "properties.name": 1} });
    }else{
      return;
    }
  },
  filter_options(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
      return msObj;
    }else{
      return;
    }
  },
  match_fields(){
    var ws = Session.get('currentWs');
    var msId = Session.get("setupId");
    if(ws && msId){
      var msObj = MatchSetup.findOne({"id": msId, "workspace_id": ws._id});
      return msObj.match_fields;
    }else{
      return;
    }
  },
  getObject1: function(eo_ids){
    if(eo_ids){
      var eo1 = eo_ids[0];
      return ExternalObjects.findOne(eo1).name;
    }
    else{
      return false;
    }
  },
  getObject1Id: function(eo_ids){
    if(eo_ids){
      return eo_ids[0];
    }
  },
  getObject2: function(eo_ids){
    if(eo_ids){
      var eo2 = eo_ids[1];
      return ExternalObjects.findOne(eo2).name;
    }
    else{
      return false;
    }
  },
  getObject2Id: function(eo_ids){
    if(eo_ids){
      return eo_ids[1];
    }
  },
  getSystemName : function(sys_id){
    var ws = Session.get('currentWs');
    if(ws){
      return Systems.findOne(sys_id, {"workspace_id": ws._id}).name;
    }
  },
  getSystemNameByEoId : function(i, eoids){
    var ws = Session.get('currentWs');
    if(ws){
      var eo = ExternalObjects.findOne(eoids[i], {"workspace_id": ws._id});
      return Systems.findOne(eo.system_id,{"workspace_id": ws._id}).name;
    }
  }
});
