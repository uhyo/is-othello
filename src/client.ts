///<reference path="./node.d.ts" />
//Othello clients that handle ws

import config=require('config');

const enum State{
    INIT = 0,
    WAITING,
    GONE
}

export class Manager{
    private clients:Array<Client>;
    constructor(){
        this.clients=[];
    }
    public add(ws):Client{
        if(this.clients.length<config.get("connections.max")){
            let result=new Client(ws,(cl)=>{
                this.clients=this.clients.filter((o)=>{
                    return o!==cl
                });
            });
            this.clients.push(result);
            return result;
        }
        return null;
    }
}

export class Client{
    private state:State;
    constructor(private ws,private onend){
        this.state=State.INIT;
        this.init(ws);
    }
    private init(ws):void{
        //init ws
        ws.on('message',(message)=>{
            var obj;
            try{
                obj=JSON.parse(message);
            }catch(e){
                //は？？？？？
                ws.close();
                return;
            }
            console.log(obj);
        });
        ws.on('close',()=>{
            //end
            this.onend(this);
        });
    }
}
