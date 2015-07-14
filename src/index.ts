///<reference path="./node.d.ts" />
import express=require('express');
import config=require('config');

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
        app.get("/",(req,res)=>{
            res.send("Hello");
        });
    }
}
