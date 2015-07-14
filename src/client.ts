///<reference path="./node.d.ts" />
//Othello clients

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
    public add():Client{
        if(this.clients.length<config.get("connections.max")){
            let result=new Client();
            this.clients.push(result);
            return result;
        }
        return null;
    }
}

export class Client{
    private state:State;
    constructor(){
        this.state=State.INIT;
    }
}
