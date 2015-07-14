var React=require('react');
var Reflux=require('reflux');

var connect=require('../../actions/connect');
var connectStore=require('../../stores/connect');

module.exports = React.createClass({
    displayName:"App",
    mixins:[Reflux.connect(connectStore,"connect")],
    componentDidMount:function(){
        connect();
    },
    render:function(){
        return (<p>
            {this.state.connect.connected ? "接続しました" : "接続してません"}
        </p>);
    }
});
