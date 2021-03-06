import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Workspaces } from './workspace.js';
import { Systems } from './system.js';
import { VertifyObjects } from './vertify_object.js';

export const ExternalObjects = new Mongo.Collection('external_objects');
export const ExternalObjectProperties = new Mongo.Collection('external_object_properties');

Meteor.methods({
  'external_objects.insert'(ws_id, sys_id, n) {
    check(ws_id, String);
    check(sys_id, String);
    check(n, String);
    //check user is logged
    /*
    if(! this.userId) {
      throw new Meteor.Error(500, 'not-authorized');
    }
    */
    var thisws = Workspaces.findOne(ws_id);
    var t_id = thisws.tenant_id;
    var objectExists = ExternalObjects.findOne({"system_id": sys_id, "name": n})
    if(objectExists){
      throw new Meteor.Error(500, "Duplicate Object", "There was an error inserting the External Object. The object already exists in the system.");
    }

    //TODO: remove once mock data isn't needed
    //Random record count
    var rcdcnt = Math.floor((Math.random() * 100000) + 1000);

    // Call Task to get external objects properties
    //TODO: Add isDevelopment check to this when tasks are complete on Elixir side
    //TODO: MOVE THIS CALL INTO MOCK LOADING PROGRESS for match data simulation
    var proplist = Meteor.tools.getExternalObjectProperties(ws_id, sys_id);
    proplist.forEach(function(prop){
      ExternalObjectProperties.schema.validate(prop);
    });

    var system = Systems.findOne(sys_id,{"workspace_id": ws_id});

    var sysExtObj = null;
    system.external_objects.forEach(function(eo){
      if(eo.name == n){
        sysExtObj = eo;
      }
    });

    if(sysExtObj == null){
      console.log("No external object: " + n + "found in system: " + sys_id);
      throw new Meteor.Error(500, "Missing Value", "No external object: " + n + "found in system: " + sys_id);
    }


    var newExternalObject = {
      tenant_id: t_id,
      modified: new Date(),
      created: new Date(),
      name: n,
      system_id: sys_id,
      workspace_id: ws_id,
      collectschema: false,
      collect: false,
      record_count: rcdcnt,
      percentage: 0,
      //TODO: clean up with Spread Operator
      type: sysExtObj.object_type,
      is_dynamic: sysExtObj.is_dynamic,
      description: sysExtObj.description,
      supports_discovery: sysExtObj.supports_discovery,
      supports_query: sysExtObj.supports_query,
      supports_pagination: sysExtObj.supports_pagination,
      supports_add: sysExtObj.supports_add,
      supports_update: sysExtObj.supports_update,
      supports_count: sysExtObj.supports_count,
      supports_delete: sysExtObj.supports_delete,
      supports_last_modified_query: sysExtObj.supports_last_modified_query,
      last_modified_property_name: sysExtObj.last_modified_property_name,
      key_properties: sysExtObj.key_properties,
      ignore_properties: sysExtObj.ignore_properties,
      read_only_properties: sysExtObj.read_only_properties,
      ignore_properties_if_null: sysExtObj.ignore_properties_if_null

      ,properties: proplist
    };

    return ExternalObjects.insert(newExternalObject);
  },
  'external_objects.remove'(currentid, ws_id){
    check(currentid, String)
    check(ws_id, String);
    //TODO: Add userid security
    //TODO: verify object doesn't exist in map/align
    var objectCount = VertifyObjects.find({"workspace_id": ws_id}).count();
    if(objectCount > 0){
      throw new Meteor.Error(500, "Existing Dependencies", "There was an error deleting the External Object. All Vertify Objects must be deleted from a system before it can be removed.");
    }

    var current = ExternalObjects.findOne(currentid);

    ExternalObjects.remove(current._id);
  },
  'external_objects.updateLoading'(eo_id, percent){
    check(eo_id, String);
    check(percent, Number);
    var current = ExternalObjects.findOne(eo_id);

    if(current){
      ExternalObjects.update(current._id,
          { $set:
              { percentage: percent }
          }
        );
    }
    else{
      throw new Meteor.Error(500, "External Object not Found", "The object with id: " +  eo_id + " could not be found.");
    }
  },
  'external_objects.removeAll'(ws_id){
    check(ws_id, String);
    return ExternalObjects.remove({"workspace_id": ws_id});
  }
});


ExternalObjectProperties.schema = new SimpleSchema({
  name:
    { type: String },
  is_custom:
    { type: Boolean },
  is_array:
    { type: Boolean },
  external_type:
    { type: String
    ,  optional: true },
  type:
    { type: String },
  is_key:
    { type: Boolean }
});


ExternalObjects.schema = new SimpleSchema({
  tenant_id:
    { type: String},
  modified:
    { type: Date },
  created:
    { type: Date },
  is_deleted:
    { type: Boolean
    , optional: true
    , defaultValue: false },
  name:
    { type: String },
  system_id:
    { type: String },
  workspace_id:
    { type: String },
  collectschema:
    { type: Boolean },
  collect:
    { type: Boolean },
  last_query:
    { type: Date
    , optional: true },
  page_size:
    { type: Number
    , optional: true },
  request_size:
    {type: Number
    , optional: true },
  record_count:
    { type: Number
    , optional: true
    , defaultValue: 100 },
  percentage:{
    type: Number
  , defaultValue: 0},
  type:
    { type: String
    , optional: true  },
  is_custom:
    { type: Boolean
    , optional: true },
  level:
    { type: String
    , optional: true },
  is_hidden:
    { type: Boolean
    , optional: true },
  is_dynamic:
    { type: Boolean
    , optional: true },
  description:
    { type: String
    , optional: true },
  supports_discovery:
    { type: Boolean
    , optional: true },
  supports_query:
    { type: Boolean
    , optional: true },
  supports_pagination:
    { type: Boolean
    , optional: true },
  supports_add:
    { type: Boolean
    , optional: true },
  supports_update:
    { type: Boolean
    , optional: true },
  supports_count:
    { type: Boolean
    , optional: true },
  supports_delete:
    { type: Boolean
    , optional: true },
  supports_last_modified_query:
    { type: Boolean
    , optional: true },
  last_modified_property_name:
    { type: String
    , optional: true },
  key_properties:
    { type: [String]
    , optional: true },
  ignore_properties:
    { type: [Object]
      , blackbox: true
    , optional: true },
  read_only_properties:
    { type: [String]
    , optional: true },
  ignore_properties_if_null:
    { type: [String]
    , optional: true },
  collect_filters:
    { type: String
    , optional: true },
  properties:
    { type:  [ExternalObjectProperties.schema ]
    , optional: true },
  generic_integer_1:
    { type: Number
    , optional: true },
  generic_integer_2:
    { type: Number
    , optional: true },
  generic_integer_3:
    { type: Number
    , optional: true },
  generic_string_1:
    { type: String
    , optional: true },
  generic_string_2:
    { type: String
    , optional: true },
  generic_string_3:
    { type: String
    , optional: true }
});
