///<reference path="./node.d.ts" />
import path=require('path');
import express=require('express');
import config=require('config');

import st=require('st');
import ect=require('ect');

export = Index;
class Index{
    private app:any;
    constructor(){
    }
    public start():void{
        this.app=express();
        this.initRoute(this.app);
        this.app.listen(config.get("http.port"));
    }

    private initRoute(app):void{
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
        app.get("/",(req,res)=>{
            res.render("index");
        });
    }
}
