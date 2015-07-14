var React=require('react');

module.exports = React.createClass({
    displayName:"Log",
    propTypes:{
        log: React.PropTypes.arrayOf(React.PropTypes.shape({
            wl: React.PropTypes.string,
            mystones: React.PropTypes.number,
            opstones: React.PropTypes.number,
            reason: React.PropTypes.string
        })).isRequired
    },
    render:function(){
        return <ul className="playing-log">
            {
                this.props.log.map((obj,i)=>{
                    var result = obj.wl==="WIN" ? "勝ち" : obj.wl==="LOSE" ? "負け" : obj.wl==="TIE" ? "引き分け" : obj.wl;
                    return <li key={i}>{i+1}戦目：<b>{result}</b> 自分の石：<b>{obj.mystones}</b> 相手の石：<b>{obj.opstones}</b> （{obj.reason}）</li>
                })
            }
        </ul>;
    },
});

