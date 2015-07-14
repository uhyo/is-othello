var Reflux=require('reflux');

var message=require('../actions/message');

//client store
var client=Reflux.createStore({
    listenables:{
        "message": message
    },
    init:function(){
        this.state={
            state: "REGISTERING"
        };
    },
    getInitialState:function(){
        return this.state;
    },
    onMessage:function(obj){
        //serverからのメッセージ
        if(obj.command==="ack"){
            //時間
            this.state.time=obj.time;
            this.trigger(this.state);
        }else if(obj.state==="WAITING"){
            this.state.state="WAITING";
            this.trigger(this.state);
        }else if(obj.state==="PLAYING"){
            //playingになった
            this.state.state="PLAYING";
            this.state.opponent=obj.opponent;
            this.state.time=obj.time;
            this.trigger(this.state);
        }
    }
});

client.init();

module.exports = client;
