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
                {board.board.map(function(row){
                    return <tr>
                        {row.map(function(cell){
                            if(cell===""){
                                return <td className="board-blank"/>;
                            }else if(cell==="BLACK"){
                                return <td className="board-black">●</td>;
                            }else if(cell==="WHITE"){
                                return <td classname="board-white">●</td>;
                            }else{
                                //???
                                return <td>{cell}</td>;
                            }
                        })}
                    </tr>;
                })}
            </tbody>
        </table>;
    },
});

