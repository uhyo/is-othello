var Reflux=require('reflux');

var connect=require('../actions/connect');

var connection=Reflux.createStore({
    listenables:{
        "established": connect.established,
        "unestablished": connect.unestablished
    },
    getInitialState:function(){
        return {
            connected: false,
            ws: null,
        };
    },
    onEstablished:function(ws){
        this.trigger({
            connected: true,
            ws: ws
        });
    },
    onUnestablished:function(){
        this.trigger({
            connected: false,
            ws: null
        });
    },

});

module.exports = connection;
