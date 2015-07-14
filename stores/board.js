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
        if(obj.command==="move"){
            //着手
            this.state.board=move(this.state.turn,getPosition(obj.position), this.state.board);
            //あれ
            this.state.turn=opposite(this.state.turn);
            this.trigger(this.state);
        }else if(obj.state==="PLAYING"){
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

function opposite(current){
    if(current==="BLACK"){
        return "WHITE";
    }else if(current==="WHITE"){
        return "BLACK";
    }else{
        return current;
    }
}

function getPosition(str){
    var x={"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7}[str[0]], y=str[1]-1;
    return {x,y};
}

function isOut(x,y){
    return x<0 || 7<x || y<0 || 7<y;
}

//破壊的
function move(turn,{x,y},board){
    var o=opposite(turn);
    //中心に石を置く
    board[y][x]=turn;
    //8方向にアレする
    var directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    for(var i=0;i<8;i++){
        var [dx,dy]=directions[i];
        var cx=x, cy=y;
        var state=0;
        while(1){
            cx+=dx, cy+=dy;
            if(state===0){
                //探索
                if(isOut(cx,cy)){
                    //なかった
                    break;
                }
                if(board[cy][cx]===turn){
                    //あった
                    state=1;
                    cx=x, cy=y;
                    continue;
                }else if(board[cy][cx]!==o){
                    //なかった
                    break;
                }
            }else{
                //裏返す
                if(board[cy][cx]===o){
                    board[cy][cx]=turn;
                }else{
                    break;
                }
            }
        }
    }
    return board;
}
