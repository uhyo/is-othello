var React=require('react');
var Reflux=require('reflux');

var clientStore=require('../../stores/client'),
    boardStore =require('../../stores/board');

module.exports = React.createClass({
    displayName:"Board",
    mixins:[Reflux.connect(boardStore,"board")],
    render:function(){
        var board=this.state.board;
        return <table className="playing-board">
            <tbody>
                {board.board.map(function(row,i){
                    return <tr key={i}>
                        {row.map(function(cell,j){
                            if(cell===""){
                                return <td key={j} className="board-blank"/>;
                            }else if(cell==="BLACK"){
                                return <td key={j} className="board-black">●</td>;
                            }else if(cell==="WHITE"){
                                return <td key={j} className="board-white">●</td>;
                            }else{
                                //???
                                return <td key={j}>{cell}</td>;
                            }
                        })}
                    </tr>;
                })}
            </tbody>
        </table>;
    },
});

