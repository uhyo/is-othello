var React=require('react/addons');
var Reflux=require('reflux');

var clientActions=require('../../actions/client');
var connectStore=require('../../stores/connect');
var clientStore=require('../../stores/client');

module.exports = React.createClass({
    displayName:"Client",
    mixins:[Reflux.connect(connectStore,"connect"),Reflux.connect(clientStore,"client")],
    //
    handleName:function(name){
        //おなまえを入力してもらった
        clientActions.open({ws:this.props.ws, name});
    },
    render:function(){
        if(this.state.client.state==="REGISTERING"){
            return this.registering();
        }
    },
    registering:function(){
        ///おなまえ　にゅうりょく
        return <InputName onOk={this.handleName} />;
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
