var Reflux=require('reflux');

//client store
var client=Reflux.createStore({
    init:function(){
        this.state=this.getInitialState();
    },
    getInitialState:function(){
        return {
            state: "REGISTERING"
        };
    },
});

client.init();

module.exports = client;
