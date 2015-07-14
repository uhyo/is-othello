var Reflux=require('reflux');

var message=require('../actions/message'),
    connect=require('../actions/connect');

//client store
var client=Reflux.createStore({
    listenables:{
        "message": message,
        "established": connect.established,
        "unestablished": connect.unestablished
    },
    init:function(){
        this.state={
            state: "INIT",
            log: [],
            connected: false,
            ws: null
        };
    },
    getInitialState:function(){
        return this.state;
    },
    onEstablished:function(ws){
        this.state.connected=true;
        this.state.ws=ws;
        if(this.state.state==="INIT"){
            this.state.state="REGISTERING";
        }

        this.trigger(this.state);
    },
    onUnestablished:function(){
        this.state.connected=false;
        this.state.ws=null;
        this.trigger(this.state);
    },
    componentWillReceiveProps:function(nextProps){
        if(this.state.state==="INIT" && nextProps.connected===true){
            //接続した
            this.setState({
                state: "REGISTERING"
            });
        }
    },
    onMessage:function(obj){
        //serverからのメッセージ
        console.log(obj);
        if(obj.command==="ack"){
            //時間
            this.state.time=obj.time;
            this.trigger(this.state);
        }else if(obj.command==="end"){
            //終了した
            this.state.log=this.state.log.concat({
                type: "game",
                wl: obj.wl,
                mystones: obj.mystones,
                opstones: obj.opstones,
                reason: obj.reason
            });
            this.trigger(this.state);
        }else if(obj.command==="close"){
            //接続きられた
            this.state.state="CLOSED";
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
        }else if(obj.state==="END"){
            //おわり
            if(obj.error===true){
                //異常終了だ
                this.state.log=this.state.log.concat({
                    type: "text",
                    value: "対戦相手がどこかに行ったか、審判サーバーが異常終了したため終了しました。"
                });
            }else{
                this.state.log=this.state.log.concat({
                    type: "text",
                    value: "結果"
                }).concat(obj.result.map((obj)=>{
                    return {
                        type: "player",
                        name: obj.name,
                        score: obj.score,
                        win: obj.win,
                        lose: obj.lose
                    };
                }));
            }
            this.trigger(this.state);
        }
    }
});

client.init();

module.exports = client;
