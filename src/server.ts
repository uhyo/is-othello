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
        var cls=this.clients.slice(0,2);
        var sess=new Session(this.clients[0], this.clients[1]);
        this.clients=this.clients.slice(2);
        this.sessions.push(sess);
        sess.once("end",()=>{
            //とりあえず1セッションおわったらクライアントとおさらばする
            var stat=cls.map((c)=>{
                return c.getScoreString()
            }).join(" ");
            cls.forEach((c)=>{
                c.send(`BYE ${stat}`);
                c.kill();
            });

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
        //時間切れ検知
        this.current_t.setCallback(()=>{
            this.timeup();
        });
        this.opposite_t.setCallback(()=>{
            this.timeup();
        });
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
                var byo=config.get("game.byoyomi");
                //もう時間が足りないようなら補充する
                if(tim<byo){
                    this.current_t.set(tim=byo);
                }
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

        //スコア
        if(cu==="WIN"){
            this.current.score(true);
            this.opposite.score(false);
        }else if(cu==="LOSE"){
            this.current.score(false);
            this.opposite.score(true);
        }

        this.current.send(`END ${cu} ${n} ${m} ${reason}`);
        this.opposite.send(`END ${op} ${m} ${n} ${reason}`);

        this.current_t.stop();
        this.opposite_t.stop();

        this.emit("end");
    }
    //タイムアップ
    private timeup():void{
        //即終了
        this.end(this.opposite, "TIMEUP");
    }
}

//タイマー
class Timer{
    private counting:boolean;
    private count:number;
    private c:number;
    private callback:Function;
    private timer:any;
    constructor(){
        this.counting=false;
    }
    set(count:number){
        this.count=count;
    }
    setCallback(callback:Function){
        this.callback=callback;
        if(this.counting){
            this.start();
        }
    }
    start():void{
        this.counting=true;
        this.c=Date.now();
        if(this.timer!=null){
            clearTimeout(this.timer);
        }
        var h=()=>{
            var now=Date.now();
            var sa=now-this.c;
            this.timer=null;
            if(sa>=this.count){
                //超過した
                if(this.callback!=null){
                    this.callback();
                }
            }else{
                let current=this.count-sa;
                this.timer=setTimeout(h,Math.min(current,10000));
            }
            var w=Math.min(this.count,10000);
        };
        h();
    }
    stop():number{
        if(this.timer!=null){
            clearTimeout(this.timer);
        }
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
    get():number{
        if(this.counting===false){
            return this.count;
        }else{
            var now=Date.now();
            var sa=now-this.c;
            return this.count-sa;
        }
    }
}


//クライアント
class Client extends events.EventEmitter{
    public name:string;
    public alive:boolean;
    //スコア
    private win:number;
    private lose:number;
    constructor(){
        super();
        this.win=0;
        this.lose=0;
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
    //スコアをセット
    score(win:boolean):void{
        if(win){
            this.win++;
        }else{
            this.lose++;
        }
    }
    //スコアを得る
    getScoreString():string{
        return `${this.name} ${this.win-this.lose} ${this.win} ${this.lose}`;
    }
    //終わりにしてもらう
    kill():void{
        this._kill();
        this.alive=false;
        this.emit("close");
    }
    protected _kill():void{
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
    protected _kill():void{
        this.socket.end();
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
