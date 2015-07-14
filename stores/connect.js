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
        };
    },
    onEstablished:function(){
        this.trigger({
            connected: true
        });
    },
    onUnestablished:function(){
        this.trigger({
            connected: false
        });
    },

});

module.exports = connection;
