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
                            if(cell===""){
                                return <td key={y} className={cx} data-posx={x} data-posy={y} onMouseEnter={this.handleMouseEnter} />;
                            }else if(cell==="BLACK" || cell==="WHITE"){
                                return <td key={y} className={cx} data-posx={x} data-posy={y} onMouseEnter={this.handleMouseEnter}>●</td>;
                            }else{
                                //???
                                return <td key={j} classname={cx} data-posx={x} data-posy={y} onMouseEnter={this.handleMouseEnter}>{cell}</td>;
                            }
                        })}
                    </tr>;
                })}
            </tbody>
        </table>;
    },
});

