import { Template } from 'meteor/templating';
import { Navitems } from '../../../imports/collections/navitems.js';
import './nav.html';


Template.navigation.helpers({
  navitems() {
    return Navitems.find({});
  },
  user_name(){
    return "Shia LeBeouf";
  }
});

Template.navigation.events({
  'click' : function() {
      console.log("you clicked something in nav");
  },
  'click .dropdown-toggle': function(event){
      event.preventDefault();

      $(event.target).find('.dropdown-menu').toggle();
  },
  'click .nav li a': function(e){
    $('.nav a.active').not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    var childMenuHeight = 0;
    childMenu = e.target.parentNode.childNodes[2];
    if(childMenu){
      childMenuHeight = childMenu.clientHeight;
    }

    /*
    $(e.target).toggle(function(){
      $(e.target.parentNode.childNodes[2]).animate({height:childMenuHeight},200);
      },function(){
        $(e.target.parentNode.childNodes[2]).animate({height:0},200);
      });*/
  },
});