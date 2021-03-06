const setupRoutes = FlowRouter.group({
  prefix: '/setup',
  name: 'setup',
  triggersEnter: [() => {
    window.scrollTo(0, 0);
  }],
});

const dataRoutes = FlowRouter.group({
  prefix: '/data',
  name: 'data',
  triggersEnter: [()=> {
    window.scrollTo(0,0);
  }],
});

FlowRouter.route('/', {
  name: 'dashboard',
  action() {
      BlazeLayout.render('main', {main: 'dashboard'});
  }
});

FlowRouter.route('/dashboard', {
  name: 'dashboard',
  action() {
      BlazeLayout.render('main', {main: 'dashboard'});
  }
});

FlowRouter.route('/loginmain', {
  name: 'loginmain',
  action() {
      BlazeLayout.render('main', {main: 'loginmain'});
  }
});

FlowRouter.route('/admin', {
  name: 'admin',
  action() {
      BlazeLayout.render('main', {main: 'admin'});
  }
});

FlowRouter.route('/admin/agents', {
  name: 'agents',
  action() {
      BlazeLayout.render('main', {main: 'agents'});
  }
});

FlowRouter.route('/admin/groups', {
  name: 'groups',
  action() {
      BlazeLayout.render('main', {main: 'groups'});
  }
});

FlowRouter.route('/admin/users', {
  name: 'users',
  action() {
      BlazeLayout.render('main', {main: 'users'});
  }
});

FlowRouter.route('/admin/tenants', {
  name: 'tenants',
  action() {
      BlazeLayout.render('main', {main: 'tenants'});
  }
});

FlowRouter.route('/admin/workspaces', {
  name: 'workspaces',
  action() {
      BlazeLayout.render('main', {main: 'workspaces'});
  }
});

dataRoutes.route('/', {
  name: 'data',
  action() {
      BlazeLayout.render('main', {main: 'data'});
  }
});

dataRoutes.route('/analyze', {
  name: 'analyze',
  action() {
      BlazeLayout.render('main', {main: 'analyze'});
  }
});

dataRoutes.route('/fix', {
  name: 'fix',
  action() {
      BlazeLayout.render('main', {main: 'fix'});
  }
});

dataRoutes.route('/fix/details', {
  name: 'fixdetails',
  action() {
      BlazeLayout.render('main', {main: 'fixdetails'});
  }
});

dataRoutes.route('/fix/records', {
  name: 'fixrecords',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'fixrecords'});
  }
});

dataRoutes.route('/schedule', {
  name: 'schedule',
  action() {
      BlazeLayout.render('main', {main: 'schedule'});
  }
});

dataRoutes.route('/search', {
  name: 'search',
  action() {
      BlazeLayout.render('main', {main: 'search'});
  }
});

dataRoutes.route('/sync', {
  name: 'sync',
  action() {
      BlazeLayout.render('main', {main: 'sync'});
  }
});

setupRoutes.route('/', {
  name: 'setup',
  action() {
      BlazeLayout.render('main', {main: 'setup'});
  }
});

setupRoutes.route('/align', {
  name: 'align',
  action() {
      BlazeLayout.render('main', {main: 'align'});
  }
});

setupRoutes.route('/align/process', {
  name: 'alignprocess',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'alignprocess'});
  }
});

setupRoutes.route('/align/results', {
  name: 'alignresults',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'alignresults'});
  }
});

setupRoutes.route('/align/fieldeditor', {
  name: 'fieldeditor',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'fieldeditor'});
  }
});

setupRoutes.route('/collect', {
  name: 'collect',
  action() {
      BlazeLayout.render('main', {main: 'collect'});
  }
});

setupRoutes.route('/connect', {
  name: 'connect',
  action() {
      BlazeLayout.render('main', {main: 'connect'});
  }
});

setupRoutes.route('/create', {
  name: 'create',
  action() {
      BlazeLayout.render('main', {main: 'create'});
  }
});

setupRoutes.route('/match', {
  name: 'match',
  action() {
      BlazeLayout.render('main', {main: 'match'});
  }
});

setupRoutes.route('/match/vertifywizard', {
  name: 'vertifywizard',
  action() {
      BlazeLayout.render('main', {main: 'vertifywizard'});
  }
});

setupRoutes.route('/match/process', {
  name: 'matchprocess',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'matchprocess'});
  }
});

setupRoutes.route('/match/loading', {
  name: 'loading',
  action: function(queryParams) {
      console.log("QueryParams:",queryParams);
      BlazeLayout.render('main', {main: 'matchloading'});
  }
});

setupRoutes.route('/match/results', {
  name: 'results',
  action() {
      BlazeLayout.render('main', {main: 'matchresults'});
  }
});

FlowRouter.route('/test', {
  name: 'test',
  action() {
      BlazeLayout.render('main', {main: 'test'});
  }
});

FlowRouter.route('/test2', {
  name: 'test2',
  action() {
      BlazeLayout.render('main', {main: 'test2'});
  }
});

FlowRouter.route('/test3', {
  name: 'test3',
  action() {
      BlazeLayout.render('main', {main: 'test3'});
  }
});

FlowRouter.route('/unauthorized', {
  action() {
      BlazeLayout.render('main', {main: 'unauthorized'});
  }
});

FlowRouter.notFound = {
  action() {
      BlazeLayout.render('main', {main: 'notfound'});
  }
};
