var Reflux=require('reflux');

//connect to server.
var connect= Reflux.createAction({
    children: ["established","unestablished"]
});

connect.listen(function(params){
    //connect to server
    var p=location.pathname;
    if(!/\/$/.test(p)){
        p+="/";
    }
    var ws=new WebSocket(location.protocol.replace("http","ws")+"//"+location.host+p+"ws");
    ws.onopen=function(e){
        console.log("WebSocket connection is open");
        connect.established();
    };
    ws.onerror=function(e){
        console.error("WebSocket error",e);
    };
    ws.onclose=function(e){
        console.log("WebSocket connection closed by the server");
        connect.unestablished();
    };
    ws.onmessage=function(e){
        console.log("Message from server: ",e.data);
    };
});

module.exports = connect;
