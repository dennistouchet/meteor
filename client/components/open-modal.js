
ModalHelper = {};

ModalHelper.openLoginModalFor = function(){
  Modal.show('loginmodal');
}

ModalHelper.openSysAddModalFor = function(){
  Modal.show('systemaddmodal');
}

ModalHelper.openSysEditModalFor = function(sys_id){
  Session.set('selectedSystem', sys_id);
  Modal.show('systemeditmodal');
}


ModalHelper.openWsAddModalFor = function(){
  Modal.show('wsaddmodal');
}

ModalHelper.openWsEditModalFor = function(ws_id){
  Session.set('selectedWorkspace', ws_id);
  Modal.show('wseditmodal');
}

ModalHelper.openMatchConfirmModalFor = function(id){
  Session.set('selectedVertifyObject', id);
  Modal.show('matchconfirmmodal');
}

ModalHelper.openAlignConfirmModalFor = function(id, arid){
  Session.set('selectedVertifyObject', id);
  Session.set('selectedAlignResultId', arid);
  Modal.show('alignconfirmmodal');
}

ModalHelper.openAnalysisConfirmModalFor = function(id, action){
  Session.set('analyzeVertifyObject', id);
  Session.set('analyzeAction', action);
  Modal.show('analyzeconfirmmodal');
}

ModalHelper.openFixConfirmModalFor = function(type){
  Session.set('fixType', type);
  Modal.show('fixconfirmmodal');
}
