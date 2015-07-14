var React=require('react/addons');
var Reflux=require('reflux');

var clientActions=require('../../actions/client');
var connectStore=require('../../stores/connect');
var clientStore=require('../../stores/client');
var boardStore=require('../../stores/board');

var PlayInfo=require('./playinfo'),
    Board=require('./board');

module.exports = React.createClass({
    displayName:"Client",
    mixins:[Reflux.connect(connectStore,"connect"),Reflux.connect(clientStore,"client"),Reflux.connect(boardStore,"board")],
    //
    handleName:function(name){
        //おなまえを入力してもらった
        clientActions.open({ws:this.props.ws, name});
    },
    render:function(){
        if(this.state.client.state==="REGISTERING"){
            return this.registering();
        }else if(this.state.client.state==="WAITING"){
            //対戦待ち
            return this.waiting();
        }else if(this.state.client.state==="PLAYING"){
            return this.playing();
        }
    },
    registering:function(){
        ///おなまえ　にゅうりょく
        return <InputName onOk={this.handleName} />;
    },
    waiting:function(){
        return <p>対戦相手が見つかるのを待っています。</p>;
    },
    playing:function(){
        return <div className="playing-app">
            <PlayInfo/>
            {this.state.board.board ? <Board ws={this.props.ws} board={this.state.board.board} turnPlayer={this.state.board.turn===this.state.board.mycolor} /> : null}
        </div>;
    }
});

var InputName=React.createClass({
    displayName:"InputName",
    mixins:[React.addons.LinkedStateMixin],
    getInitialState:function(){
        return {
            name:""
        }
    },
    handleOk:function(){
        this.props.onOk(this.state.name);
    },
    render:function(){
        return (
            <div className="input-name">
                <p>プレイヤー名を入力してください：</p>
                <p><input type="text" maxLength="64" valueLink={this.linkState('name')} /></p>
                <p><input type="submit" value="OK" onClick={this.handleOk} /></p>
            </div>);
    },
});
