var React=require('react');

var App=require('./app/index.jsx');

document.addEventListener("DOMContentLoaded",function(e){
    var a=React.createElement(App,{});
    React.render(a,document.body);
},false);
