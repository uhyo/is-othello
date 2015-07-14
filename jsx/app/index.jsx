var React=require('react');
var Reflux=require('reflux');

var connect=require('../../actions/connect');
var connectStore=require('../../stores/connect');

var Client=require('./client.jsx');

module.exports = React.createClass({
    displayName:"App",
    mixins:[Reflux.connect(connectStore,"connect")],
    componentDidMount:function(){
        connect();
    },
    render:function(){
        if(!this.state.connect.connected){
            return <p>サーバーに接続していません。</p>;
        }
        return <Client ws={this.state.connect.ws} />;
    }
});
