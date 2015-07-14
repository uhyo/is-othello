var React=require('react');
var Reflux=require('reflux');
var classnames=require('classnames');

var clientActions=require('../../actions/client');

module.exports = React.createClass({
    displayName:"Board",
    mixins:[],
    getInitialState:function(){
        return {
            select:null,
        };
    },
    componentWillUpdate:function(nextProps,nextState){
        if(nextProps.turnPlayer && nextProps.unmovable){
            //自分のターンだが動けないのでパスを発行する
            clientActions.pass(nextProps.ws);
        }
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
            if(this.props.board[y][x]!==""){
                //救済
                return;
            }
            clientActions.move(this.props.ws,{x,y});
        }
    },
    render:function(){
        var board=this.props.board;
        var select = this.state.select || {x:-1, y:-1};
        return <table className="playing-board" onMouseLeave={this.handleMouseLeave}>
            <tbody>
                {board.map((row,y)=>{
                    return <tr key={y}>
                        {row.map((cell,x)=>{
                            var cx=classnames({
                                "board-selected": select.x===x && select.y===y,
                                "board-blank": cell==="",
                                "board-black": cell==="BLACK",
                                "board-white": cell==="WHITE"
                            });
                            var props={
                                key: x,
                                className: cx,
                                "data-posx":x,
                                "data-posy":y,
                                onMouseEnter:this.handleMouseEnter,
                                onClick:this.props.turnPlayer===true ? this.handleClick : null
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

