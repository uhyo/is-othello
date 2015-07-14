var React=require('react');
var Reflux=require('reflux');

var CountDown=require('./countdown.jsx');

module.exports = React.createClass({
    displayName:"PlayInfo",
    propTypes:{
        opponent: React.PropTypes.string,
        mycolor: React.PropTypes.string,
        turn: React.PropTypes.string,
        time: React.PropTypes.number
    },
    render:function(){
        var myturn=this.props.mycolor===this.props.turn;
        return <div className="playing-info">
            <p><b>{this.props.opponent}</b>と対戦中</p>
            <p>あなたは<b>{this.colorString(this.props.mycolor)}</b>です。</p>
            <p>{myturn ? "あなたの手番です。" : "待機中です。"}</p>
            <p>残り時間　<CountDown count={myturn} time={this.props.time} suffix="秒" /></p>
        </div>;
    },
    colorString:function(c){
        return c==="BLACK" ? "黒" : c==="WHITE" ? "白" : "?";
    }
});
