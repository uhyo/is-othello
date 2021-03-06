//Othello clients that handle ws

import net=require('net');
const config = require('config');
const byline = require('byline');

const enum State{
    INIT = 0,
    WAITING,
    PLAYING,
    END
}

export class Manager{
    private clients:Array<Client>;
    constructor(){
        this.clients=[];
    }
    public add(ws: any): Client | null{
        if(this.clients.length<config.get("connections.max")){
            let result=new Client(ws,(cl: any)=>{
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
    constructor(private ws: any,private onend: any){
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
                    console.log("line: ",JSON.stringify(line));
                    this.processSrvCmd(line);
                }
                this.processQueue();
            });

            this.ready=true;
            this.processQueue();
        });
        this.connect.on("error",(e: any)=>{
            //connected to server
            console.error("e---",e);
        });
        this.connect.on("close",(err: any)=>{
            //connection end
            //サーバーとの接続がおわった
            this.connect.unref();
            this.connect=null;
            if(this.state!==State.END){
                this.addQueue({
                    from: "server",
                    command: "bye",
                    error: true
                });
            }
            this.addQueue({
                from: "server",
                command: "close"
            });
            this.processQueue();
        });
        /*this.ready=true;
        this.processQueue();*/
    }
    private init(ws: any):void{
        //init ws
        console.log("ws init");
        ws.on('message',(message: string)=>{
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
            //close accompanying connection
            if(this.connect){
                this.connect.end();
            }
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
    private wssend(obj: any):void{
        console.log("send",obj);
        this.ws.send(JSON.stringify(obj));
    }
    //write to othello server
    private write(str: string):void{
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
        }else if(command==="END"){
            obj.command="end";
            obj.wl=tokens[1];
            obj.mystones=parseInt(tokens[2]);
            obj.opstones=parseInt(tokens[3]);
            obj.reason=tokens[4];
        }else if(command==="BYE"){
            obj.command="bye";
            obj.result=[];
            //アレする
            if(line.trim()==="BYE"){
                //異常終了だ
                obj.error=true;
            }else{
                for(var i=1,l=tokens.length;i<l;i+=4){
                    obj.result.push({
                        name: tokens[i],
                        score: parseInt(tokens[i+1]),
                        win: parseInt(tokens[i+2]),
                        lose: parseInt(tokens[i+3])
                    });
                }
            }
        }else{
            obj=null;
        }
        if(obj){
            this.addQueue(obj);
        }
    }
    //----- process queue
    private addQueue(obj: any):void{
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
                }else if(obj.command==="move" || obj.command==="ack" || obj.command==="end"){
                    //MOVE/ACK command
                    this.wssend(obj);
                }else if(obj.command==="bye"){
                    //bye command
                    this.state=State.END;
                    this.wssend({
                        state: "END",
                        error: obj.error,
                        result: obj.result
                    });
                }else if(obj.command==="close"){
                    this.wssend(obj);
                    //おわり
                    this.ws.close();
                    this.end();
                }

            }
        }
        this.commandQueue=[];
    }
}
