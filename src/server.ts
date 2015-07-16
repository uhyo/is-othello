///<reference path="./node.d.ts" />
//Othello protocol server

import events=require('events');
import net=require('net');

import byline=require('byline');
import config=require('config');

import board=require('./board');

class Server{
    private sessions:Array<Session>;
    private clients:Array<Client>;
    constructor(){
        this.sessions=[];
        this.clients=[];
    }
    //クライアントがきた
    add(c:Client):void{
        var handler=()=>{
            //利用可能なクライアント
            this.clients.push(c);
            if(this.clients.length>=2){
                //対戦可能
                this.newSession();
            }
        };
        c.once("ready",handler);
    }
    private newSession():void{
        var sess=new Session(this.clients[0], this.clients[1]);
        this.clients=this.clients.slice(2);
        this.sessions.push(sess);
        sess.once("end",()=>{
            this.sessions=this.sessions.filter((obj)=>{
                return obj!==sess;
            });
        });
    }
}

//ある2人の対戦
class Session extends events.EventEmitter{
    private game:Game;
    private black:Client;
    private white:Client;
    private count:number;
    constructor(private client1:Client, private client2:Client){
        super();
        this.count=0;

        //どちらが黒か最初はランダムに決定する
        var b=Math.random()<0.5;
        if(b){
            this.black=this.client1, this.white=this.client2;
        }else{
            this.black=this.client2, this.white=this.client1;
        }
        this.init();
    }
    private init():void{
        //とりあえず1戦する
        this.game=new Game();
        this.game.setPlayer("BLACK",this.black);
        this.game.setPlayer("WHITE",this.white);
        this.game.start();
        this.game.once("end",()=>{
            //1ゲーム終わった
            this.count++;
            if(this.count>=config.get("game.count")){
                //おわり
                this.emit("end");
            }else{
                //交代して
                var c=this.black;
                this.black=this.white;
                this.white=c;
                this.init();
            }
        });
    }
}

//1ゲーム
class Game extends events.EventEmitter{
    private current:Client;
    private opposite:Client;
    private board:board.Board;
    private current_t:Timer;
    private opposite_t:Timer;
    private turn:string;
    private pass_count:number;
    private playing:boolean;
    constructor(){
        super();
        this.playing=false;
    }
    setPlayer(color:string,cl:Client):void{
        if(color==="BLACK"){
            this.current=cl;
        }else if(color==="WHITE"){
            this.opposite=cl;
        }else{
            throw new Error("Invalid color: "+color);
        }
    }
    start():void{
        //ゲームを開始
        this.board=new board.Board();
        this.board.init();
        var time:number=config.get("game.time");
        this.current_t=new Timer();
        this.current_t.set(time);
        this.opposite_t=new Timer();
        this.opposite_t.set(time);
        //状態初期化
        this.playing=true;
        this.turn="BLACK";
        this.pass_count=0;
        //
        //コマンド
        this.current_t.start();
        this.current.send("START BLACK "+this.opposite.name+" "+time);
        this.opposite.send("START WHITE "+this.current.name+" "+time);
        //コマンド処理
        this.events(this.current);
        this.events(this.opposite);
    }
    private events(client:Client){
        client.removeAllListeners("command");
        client.removeAllListeners("close");
        client.on("command",(tokens:Array<string>)=>{
            if(this.playing==false){
                return;
            }
            //コマンドが送られてきたとき
            if(tokens[0]==="MOVE"){
                //動く
                //自分の番か確認
                if(client!==this.current){
                    //不正だ！！！！！
                    this.end(this.opposite,"INVALID_COMMAND");
                    return;
                }
                let position=tokens[1];
                //動かしてみる
                this.board.move(this.turn,position);
                if(this.board.error){
                    //この動きはだめだった
                    this.end(this.opposite,"INVALID_MOVE");
                    return;
                }
                if(position==="PASS"){
                    //パスだぞーーーーー
                    if(++this.pass_count >=2){
                        //おわり！！！！！！！！！！！！！！！
                        this.end(null,"DOUBLE_PASS");
                        return;
                    }
                }
                //OK!!!!!!!
                //ackする
                var tim=this.current_t.stop();
                client.send(`ACK ${tim}`);
                //相手に知らせる
                this.opposite.send(`MOVE ${position}`);
                //手番交代
                this.change();
            }
        });
        client.on("end",()=>{
            //クライアントがどこかへ行ってしまった！！！！？！？！？！？！？！？！？！？！？！１１１１１１１１１
            if(this.playing===true && this.current==client){
                //わたしを待っていたので終わらせる
                this.end(this.opposite,"GONE");
            }
        });
    }
    //手番交代処理
    private change():void{
        var ct=this.current, op=this.opposite,
            ctt=this.current_t, opt=this.opposite_t;
        this.current=op, this.opposite=ct;
        this.current_t=opt, this.opposite_t=ctt;
        this.turn=this.board.getOpposite(this.turn);

        if(this.current.alive!==true){
            //しかし既に相手はいなかった！！！！！！
            this.end(this.opposite,"GONE");
            return;
        }
        //開始
        this.current_t.start();
    }
    //終わりの判定(winnerが指定されている場合はそちらの勝ち）
    private end(winner:Client,reason:string):void{
        var {black,white} = this.board.count();
        var turn=this.turn;
        var win= black>white ? "BLACK" : white>black ? "WHITE" : "TIE";

        var cu:string, op:string,
            n:number, m:number;
        //勝敗を伝える
        if(win==="TIE"){
            cu=op="TIE";
            n=m=black;
        }else if(turn==="BLACK"){
            cu= win==="BLACK" ? "WIN" : "LOSE";
            op= win==="WHITE" ? "WIN" : "LOSE";
            n=black, m=white;
        }else{
            cu= win==="WHITE" ? "WIN" : "LOSE";
            op= win==="BLACK" ? "WIN" : "LOSE";
            n=white, m=black;
        }
        if(winner!=null){
            cu= winner===this.current ? "WIN" : "LOSE";
            op= winner===this.current ? "LOSE" : "WIN";
        }

        this.current.send(`END ${cu} ${n} ${m} ${reason}`);
        this.opposite.send(`END ${op} ${m} ${n} ${reason}`);

        this.emit("end");
    }
}

//タイマー
class Timer{
    private counting:boolean;
    private count:number;
    private c:number;
    constructor(){
        this.counting=false;
    }
    set(count:number){
        this.count=count;
    }
    start():void{
        this.counting=true;
        this.c=Date.now();
    }
    stop():number{
        if(this.counting===false){
            return this.count;
        }
        this.counting=false;
        var now=Date.now();
        var sa=now-this.c;
        var current=this.count-sa;
        if(current<0){
            current=0;
        }
        this.count=current;
        return current;
    }
}


//クライアント
class Client extends events.EventEmitter{
    public name:string;
    public alive:boolean;
    constructor(){
        super();
    }
    protected processLine(line:string):void{
        var tokens=line.trim().split(/\s/);
        //わりこみ処理入る
        if(tokens[0]==="OPEN"){
            //これは自前で処理する
            this.process(tokens);
            return;
        }
        this.emit("command",tokens);
    }
    protected process(tokens:Array<string>):void{
        if(tokens[0]==="OPEN"){
            //OPENコマンドを自前で処理
            this.name=tokens[1].slice(0,config.get("client.name.max"));
            this.emit("ready");
        }
    }
    send(command:string):void{
        /* ABSTRACT METHOD */
    }
}
//TCPできた
export class TCPClient extends Client{
    private read:any;
    constructor(private socket:any){
        super();
        socket.setEncoding("utf8");
        this.read=byline(socket);
        this.initEvents();
        this.alive=true;
    }
    private initEvents():void{
        //receive command from client
        this.read.on("readable",()=>{
            var line;
            while(null != (line = this.read.read())){
                //line きたぞ
                this.processLine(line);
            }
        });
        this.socket.on("close",()=>{
            //it is closed
            this.alive=false;
            this.emit("close");
        });
    }
    send(command:string):void{
        if(this.alive){
            this.socket.write(command.trim()+"\n");
        }
    }
}

//フロントエンド
export class Front{
    private srv:any;
    private s:Server;
    constructor(){
        this.s=new Server();
        this.init();
    }
    private init():void{
        var srv=this.srv=net.createServer();
        srv.on("connection",((c)=>{
            //connection
            var cl=new TCPClient(c);
            this.s.add(cl);
        }));
        srv.listen(config.get("othelloserver.port"));
    }
}
