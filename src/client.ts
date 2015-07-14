///<reference path="./node.d.ts" />
//Othello clients that handle ws

import net=require('net');
import config=require('config');
import byline=require('byline');

const enum State{
    INIT = 0,
    WAITING,
    PLAYING,
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
    private read:any;
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
        this.connect=net.connect({
            host: config.get("othelloserver.host"),
            port: config.get("othelloserver.port")
        });
        this.connect.setEncoding('utf8');
        this.connect.on("connect",()=>{
            //connected to server
            //read from server
            this.read=byline(this.connect);
            this.read.on("readable",()=>{
                var line;
                while(null != (line = this.read.read())){
                    console.log("line: ",line);
                    this.processSrvCmd(line);
                }
                this.processQueue();
            });

            this.ready=true;
            this.processQueue();
        });
        this.connect.on("error",(e)=>{
            //connected to server
            console.error("e---",e);
        });
        this.connect.on("close",(err)=>{
            //connection end
            this.ws.close();
            this.end();
        });
        /*this.ready=true;
        this.processQueue();*/
    }
    private init(ws):void{
        //init ws
        console.log("ws init");
        ws.on('message',(message)=>{
            console.log("ws ",message);
            var obj;
            try{
                obj=JSON.parse(message);
            }catch(e){
                //は？？？？？
                ws.close();
                this.end();
                return;
            }
            obj.from="client";
            this.addQueue(obj);
            this.processQueue();
        });
        ws.on('close',()=>{
            //end
            this.end();
        });
    }
    private end():void{
        if(this.ended)return;
        console.log("ws end");
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
    //-------------------
    private processSrvCmd(line:string):void{
        var tokens=line.split(/\s+/);
        var obj:any={
            from:"server"
        };
        var command=tokens[0];
        if(command==="START"){
            //startだ
            obj.command="start";
            obj.wb=tokens[1];
            obj.opponent=tokens[2];
            obj.time=parseInt(tokens[3]);
        }else if(command==="MOVE"){
            obj.command="move";
            obj.position=tokens[1];
        }else if(command==="ACK"){
            obj.command="ack";
            obj.time=parseInt(tokens[1]);
        }
        if(obj){
            this.addQueue(obj);
        }
    }
    //----- process queue
    private addQueue(obj):void{
        console.log(obj);
        this.commandQueue.push(obj);
    }
    private processQueue():void{
        if(this.ready===false){
            //wait
            return;
        }
        for(let i=0,l=this.commandQueue.length;i<l;i++){
            let obj=this.commandQueue[i];
            //process
            if(obj.from==="client"){
                if(obj.command==="open"){
                    //OPEN command
                    if(this.state!==State.INIT){
                        continue;
                    }
                    if("string"!==typeof obj.name){
                        continue;
                    }
                    let name=obj.name.replace(/\s/,"");
                    this.write("OPEN "+name);
                    //状態移行
                    this.state=State.WAITING;
                    this.wssend({
                        state: "WAITING"
                    });
                }else if(obj.command==="move"){
                    //MOVE command
                    if("string"!==typeof obj.position){
                        continue;
                    }
                    let position=obj.position.replace(/\s/,"");
                    this.write("MOVE "+position);
                }
            }else if(obj.from==="server"){
                if(obj.command==="start"){
                    //START command from server
                    this.state=State.PLAYING;
                    this.wssend({
                        state: "PLAYING",
                        wb: obj.wb,
                        opponent: obj.opponent,
                        time: obj.time
                    });
                }else if(obj.command==="move" || obj.command==="ack"){
                    //MOVE/ACK command
                    this.wssend(obj);
                }
            }
        }
        this.commandQueue=[];
    }
}
