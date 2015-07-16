declare var __dirname:string;
declare module "net"{
    var _m:any;
    export = _m;
}
declare module "path"{
    var _m:any;
    export = _m;
}
declare module "events"{
    export class EventEmitter{
        on(event_name:string,handler:Function):void;
        once(event_name:string,handler:Function):void;
        emit(event_name:string,...args:Array<any>):void;
        removeListener(event_name:string,handler:Function):void;
        removeAllListeners(event_name?:string):void;
    }
}
declare module "express"{
    var _m:any;
    export = _m;
}
declare module "config"{
    var _m:any;
    export = _m;
}
declare module "st"{
    var _m:any;
    export = _m;
}
declare module "ect"{
    var _m:any;
    export = _m;
}
declare module "express-ws"{
    var _m:any;
    export = _m;
}
declare module "byline"{
    var _m:any;
    export = _m;
}

