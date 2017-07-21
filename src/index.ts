import path=require('path');
import express=require('express');
const config = require('config');

const st = require('st');
const ect = require('ect');
const expressWs = require('express-ws');

import client=require('./client');
import server=require('./server');

class Index{
    private app: express.Express;
    private clients:client.Manager;
    private front:server.Front | null;
    constructor(){
    }
    public start():void{
        //サーバー側
        if(config.get("othelloserver.enabled")===true){
            //サーバーも用意する
            this.front=new server.Front();
        }else{
            this.front=null;
        }

        //クライアント側
        this.clients=new client.Manager();
        this.app=express();
        expressWs(this.app);
        this.initRoute(this.app);
        this.app.listen(config.get("http.port"));

    }

    private initRoute(app: express.Express):void{
        //rendering engine
        var views=path.resolve(__dirname,"..","views");
        var ectRenderer=ect({
            root:views,
            ext:".ect"
        });
        this.app.set("views",views);
        this.app.set("view engine","ect");
        this.app.engine("ect",ectRenderer.render);
        //static file
        app.use(st({
            path: path.resolve(__dirname,"..","dist"),
            url: "/static",
            index: false
        }));
        ////////// top page
        app.get("/",(req,res)=>{
            res.render("index");
        });
        ////////// ws
        (app as any).ws("/ws",(ws: any,req: any)=>{
            var cl=this.clients.add(ws);
            if(cl==null){
                //入らなかった
                ws.send(JSON.stringify({
                    error: "Server is full"
                }));
                ws.close();
            }
        });
    }
}
export = Index;
