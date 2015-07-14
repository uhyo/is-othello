var Reflux=require('reflux');

var message=require('../actions/message');

//client store
var client=Reflux.createStore({
    listenables:{
        "message": message
    },
    init:function(){
        this.state=this.getInitialState();
    },
    getInitialState:function(){
        return {
            state: "REGISTERING"
        };
    },
    onMessage:function(obj){
        //serverからのメッセージ
        if(obj.state==="WAITING"){
            this.state.state="WAITING";
            this.trigger(this.state);
        }else if(obj.state==="PLAYING"){
            //playingになった
            this.state.state="PLAYING";
            this.state.opponent=obj.opponent;
            this.trigger(this.state);
        }
    }
});

client.init();

module.exports = client;
