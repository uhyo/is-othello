var Reflux=require('reflux');

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
