var Reflux=require('reflux');

//server-message handling
var message=require('./message');

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
        connect.established(ws);
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
        //ha
        var obj;
        try{
            obj=JSON.parse(e.data);
        }catch(e){
            console.error("Failed to parse:",e.data);
        }
        if("function"===typeof ws.ondata){
            ws.ondata(obj);
        }
    };
    //hack send
    ws.sendObj=function(obj){
        ws.send(JSON.stringify(obj));
    };

    ws.ondata=function(obj){
        //ws
        message(obj);
    };
});

module.exports = connect;
