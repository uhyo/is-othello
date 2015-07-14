var Reflux=require('reflux');

var message=require('./message');

var open=Reflux.createAction({
});

open.listen(function({ws,name}){
    //nameでサーバーに接続
    ws.sendObj({
        command: "open",
        name: name
    });
});

exports.open=open;

//move action {x,y}
var move=Reflux.createAction();

move.listen(function(ws,{x,y}){
    //x,yに着手(0~7)
    //オセロの表記に変換
    var position="ABCDEFGH"[x]+(y+1);
    ws.sendObj({
        command:"move",
        position: position
    });
    //自分用に流す
    message({
        command: "move",
        position: position
    });
});

exports.move=move;
