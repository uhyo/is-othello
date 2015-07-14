var React=require('react');
var Reflux=require('reflux');

var clientStore=require('../../stores/client'),
    boardStore =require('../../stores/board');

module.exports = React.createClass({
    displayName:"PlayInfo",
    mixins:[Reflux.connect(clientStore,"client"),Reflux.connect(boardStore,"board")],
    render:function(){
        var board=this.state.board;
        return <div className="playing-info">
            <p><b>{this.state.client.opponent}</b>と対戦中</p>
            <p>あなたは<b>{this.colorString(board.mycolor)}</b>です。</p>
            <p>{board.mycolor===board.turn ? "あなたの手番です。" : "待機中です。"}</p>
        </div>;
    },
    colorString:function(c){
        return c==="BLACK" ? "黒" : c==="WHITE" ? "白" : "?";
    }
});
