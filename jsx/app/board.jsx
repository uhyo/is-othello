var React=require('react');
var Reflux=require('reflux');
var classnames=require('classnames');

var clientStore=require('../../stores/client'),
    boardStore =require('../../stores/board');

module.exports = React.createClass({
    displayName:"Board",
    mixins:[Reflux.connect(boardStore,"board")],
    getInitialState:function(){
        return {
            select:null,
        };
    },
    handleMouseEnter:function(e){
        var t=e.target, x=parseInt(t.dataset.posx), y=parseInt(t.dataset.posy);
        if(isFinite(x) && isFinite(y)){
            this.setState({
                select: {x,y}
            });
        }else{
            this.setState({
                select: null
            });
        }
    },
    handleMouseLeave:function(e){
        this.setState({
            select: null
        });
    },
    handleClick:function(e){
        var t=e.target, x=parseInt(t.dataset.posx), y=parseInt(t.dataset.posy);
        if(isFinite(x) && isFinite(y)){
            //click event
            if(this.state.board.board[y][x]!==""){
                //救済
                return;
            }
            console.log(x,y);
        }
    },
    render:function(){
        var board=this.state.board;
        var select = this.state.select || {x:-1, y:-1};
        return <table className="playing-board" onMouseLeave={this.handleMouseLeave}>
            <tbody>
                {board.board.map((row,x)=>{
                    return <tr key={x}>
                        {row.map((cell,y)=>{
                            var cx=classnames({
                                "board-selected": select.x===x && select.y===y,
                                "board-blank": cell==="",
                                "board-black": cell==="BLACK",
                                "board-white": cell==="WHITE"
                            });
                            var props={
                                key: y,
                                className: cx,
                                "data-posx":x,
                                "data-posy":y,
                                onMouseEnter:this.handleMouseEnter,
                                onClick:this.handleClick
                            };
                            if(cell===""){
                                return <td {...props} />;
                            }else if(cell==="BLACK" || cell==="WHITE"){
                                return <td {...props}>●</td>;
                            }else{
                                //???
                                return <td {...props}>{cell}</td>;
                            }
                        })}
                    </tr>;
                })}
            </tbody>
        </table>;
    },
});

