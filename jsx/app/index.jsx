var React=require('react');
var Reflux=require('reflux');

var connect=require('../../actions/connect');
var clientStore=require('../../stores/client');

var Client=require('./client.jsx');

module.exports = React.createClass({
    displayName:"App",
    mixins:[Reflux.connect(clientStore,"client")],
    componentDidMount:function(){
        connect();
    },
    render:function(){
        var connected=this.state.client.connected;
        return <div>
            <Client ws={this.state.client.ws} connected={connected}/>
            {!connected ? <p>サーバーと接続されていません。</p> : null}
        </div>
    }
});
