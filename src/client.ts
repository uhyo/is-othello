///<reference path="./node.d.ts" />
//Othello clients that handle ws

import net=require('net');
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
    private connect:any;    //server-Othello Server connection
    private commandQueue:Array<any>;
    private ended:boolean=false;
    private ready:boolean=false;
    constructor(private ws,private onend){
        this.state=State.INIT;
        this.commandQueue=[];
        this.initSrv();
        this.init(ws);
    }
    private initSrv():void{
        /*
        this.connect=net.connect({
            host: config.get("othelloserver.host"),
            port: config.get("otherlloserver.port")
        });
        this.connect.on("connect",()=>{
            //connected to server
            this.ready=true;
            this.processQueue();
        });
        this.connect.on("close",(err)=>{
            //connection end
            this.ws.close();
            this.end();
        });
        */
        this.ready=true;
        this.processQueue();

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
                this.end();
                return;
            }
            this.addQueue(obj);
        });
        ws.on('close',()=>{
            //end
            this.end();
        });
    }
    private end():void{
        if(this.ended)return;
        this.ended=true;
        this.ready=false;
        this.onend(this);
    }
    //write to ws client
    private wssend(obj):void{
        this.ws.send(JSON.stringify(obj));
    }
    //write to othello server
    private write(str):void{
        if(this.connect){
            this.connect.write(str+"\n");
        }
    }
    //----- process queue
    private addQueue(obj):void{
        this.commandQueue.push(obj);
        this.processQueue();
    }
    private processQueue():void{
        if(this.ready===false){
            //wait
            return;
        }
        for(let i=0,l=this.commandQueue.length;i<l;i++){
            let obj=this.commandQueue[i];
            //process
            if(obj.command==="open"){
                //OPEN command
                if(this.state!==State.INIT){
                    continue;
                }
                if("string"!==typeof obj.name){
                    continue;
                }
                let name=obj.name.replace(/\s/,"");
                this.write("OPEN "+name+"\n");
                //状態移行
                this.state=State.WAITING;
                this.wssend({
                    state: "WAITING"
                });
            }
        }
        this.commandQueue=[];
    }
}
