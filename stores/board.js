var Reflux=require('reflux');

var message=require('../actions/message');

//board info
var board=Reflux.createStore({
    listenables:{
        "message": message
    },
    init:function(){
        this.state= {
            turn: null,
            mycolor: null,
            board: initBoard(),
            time: null
        };
    },
    getInitialState:function(){
        return this.state;
    },
    onMessage:function(obj){
        if(obj.state==="PLAYING"){
            //初期化した感じ
            this.state.turn="BLACK";
            this.state.mycolor=obj.wb;
            this.state.time=obj.time;
            this.trigger(this.state);
        }
    }
});

module.exports = board;

function initBoard(){
    var result=[];
    for(var i=0;i<8;i++){
        if(i===3){
            result.push(["","","","WHITE","BLACK","","",""]);
        }else if(i===4){
            result.push(["","","","BLACK","WHITE","","",""]);
        }else{
            result.push(["","","","","","","",""]);
        }
    }
    return result;
}
