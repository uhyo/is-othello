var Reflux=require('reflux');

var message=require('../actions/message'),
    client=require('../actions/client');

//board info
var board=Reflux.createStore({
    listenables:{
        "message": message
    },
    init:function(){
        this.state= {
            turn: null,
            mycolor: null,
            board: null,
            unmovable: null,
        };
    },
    getInitialState:function(){
        return this.state;
    },
    onMessage:function(obj){
        if(obj.command==="move"){
            //着手
            if(obj.position!=="PASS"){
                //パスのときもある
                this.state.board=move(this.state.turn,getPosition(obj.position), this.state.board);
            }
            //あれ
            this.state.turn=opposite(this.state.turn);
            //置けるかどうかの判定
            this.state.unmovable=false;
            if(!isMovable(this.state.turn, this.state.board)){
                //自分がおけない（パスしないと）
                this.state.unmovable=true;
            }
            this.trigger(this.state);
        }else if(obj.state==="PLAYING"){
            //初期化した感じ
            this.state.turn="BLACK";
            this.state.mycolor=obj.wb;
            this.state.board=initBoard();
            this.state.unmovable=false;
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
    //とった石カウント
    var count=0;
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
                    count++;
                }else{
                    break;
                }
            }
        }
    }
    if(count===0){
        //何もとれない。違法手
        return board;
    }
    //中心に石を置く
    board[y][x]=turn;
    return board;
}

//判定
function isMovable(turn,board){
    //turnさんがboardに置く所があるか判定
    var directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    for(var x=0;x<8;x++){
        for(var y=0;y<8;y++){
            if(board[y][x]!==""){
                //おけない
                continue;
            }
            if (isMovableAt(turn, board, x, y)){
                return true;
            }
        }
    }
    return false;
}

// ここに石を置けるか
function isMovableAt(turn, board, x, y){
    var directions=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    var o=opposite(turn);
    //ここに置けるか判定
    for(var k=0;k<8;k++){
        var [dx,dy]=directions[k];
        var cx=x, cy=y;
        //おいたらこの方向でとれるか判定
        var f2=false;
        while(1){
            cx+=dx, cy+=dy;
            if(isOut(cx,cy)){
                //むりだった
                break;
            }
            if(board[cy][cx]===turn && f2===true){
                //OK
                return true;
            }else if(board[cy][cx]===o){
                //いけそう
                f2=true;
            }else{
                //むりだった
                break;
            }
        }
    }
    return false;
}
// export!!!!! (ad-hoc)
board.isMovableAt = isMovableAt;
