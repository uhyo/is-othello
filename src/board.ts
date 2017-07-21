//オセロ盤

export class Board{
    private data:Array<Array<string>>;
    //盤が異常
    public error:boolean;
    constructor(){
        this.error=false;
    }
    init():void{
        //盤を初期化
        var d: Array<Array<string>>=this.data=[];
        for(var y=0;y<8;y++){
            if(y===3){
                d[y]=["","","","WHITE","BLACK","","",""];
            }else if(y===4){
                d[y]=["","","","BLACK","WHITE","","",""];
            }else{
                d[y]=["","","","","","","",""];
            }
        }
    }
    move(turn:string,position:string):void{
        if(position==="PASS"){
            //パスなら仕方ない
            return;
        }
        var {x,y}=this.getPosition(position);
        if(isNaN(x) || isNaN(y)){
            //変な場所だ
            this.error=true;
            return;
        }
        if(this.isOut({x,y})){
            //変な場所だ
            this.error=true;
            return;
        }
        //置けることは置けそうだが……
        var board=this.data;
        if(board[y][x]!==""){
            //すでにおいてある
            this.error=true;
            return;
        }
        var count=0;
        var directions=[[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1]];
        var opp=this.getOpposite(turn);
        //8方向にアレする
        for(var i=0;i<8;i++){
            let d=directions[i];
            let cx=x, cy=y;
            let state=false;
            while(true){
                cx+=d[0], cy+=d[1];
                if(state===false){
                    if(this.isOut({x:cx,y:cy})){
                        //だめだった
                        break;
                    }
                    let b=board[cy][cx];
                    if(b===opp){
                        //よさそう
                        state=true;
                    }else{
                        //だめだった
                        break;
                    }
                }else{
                    if(this.isOut({x:cx,y:cy})){
                        //だめだった
                        state=false;
                        break;
                    }
                    let b=board[cy][cx];
                    if(b===turn){
                        //よさそう
                        break;
                    }else if(b!==opp){
                        //だめだった
                        state=false;
                        break;
                    }
                }
            }
            if(state===true){
                //とれそう
                cx=x, cy=y;
                while(true){
                    cx+=d[0], cy+=d[1];
                    if(board[cy][cx]===opp){
                        //とる
                        board[cy][cx]=turn;
                        count++;
                    }else{
                        break;
                    }
                }
            }
        }
        if(count===0){
            //とれなかった
            this.error=true;
        }else{
            //置く
            board[y][x]=turn;
        }
    }
    //かぞえる
    count():{black:number;white:number}{
        var black=0, white=0;
        var board=this.data;
        for(var y=0;y<8;y++){
            for(let x=0;x<8;x++){
                let b=board[y][x];
                if(b==="BLACK"){
                    black++;
                }else if(b==="WHITE"){
                    white++;
                }
            }
        }
        return {black,white};
    }
    private getPosition(position:string):{x:number;y:number}{
        var x=position.charCodeAt(0)-65,    //'A'
            y=parseInt(position[1])-1;
        if(isNaN(x) || isNaN(y)){
            return {x:Number.NaN, y:Number.NaN};
        }
        if(this.isOut({x,y})){
            return {x:Number.NaN, y:Number.NaN};
        }
        return {x,y};
    }
    getOpposite(turn:string):string{
        if(turn==="BLACK"){
            return "WHITE";
        }else if(turn==="WHITE"){
            return "BLACK";
        }else{
            return turn;
        }
    }
    private isOut({x,y}: {x: number; y: number}):boolean{
        return x<0 || 7<x || y<0 || 7<y;
    }
}
