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
                    if(obj.type==="game"){
                        var result = obj.wl==="WIN" ? "勝ち" : obj.wl==="LOSE" ? "負け" : obj.wl==="TIE" ? "引き分け" : obj.wl;
                        return <li key={i}>{i+1}戦目：<b>{result}</b> 自分の石：<b>{obj.mystones}</b> 相手の石：<b>{obj.opstones}</b> （{obj.reason}）</li>

                    }else if(obj.type==="text"){
                        return <li key={i}>{obj.value}</li>;
                    }else if(obj.type==="player"){
                        return <li key={i}>
                            プレイヤー<b>{obj.name}</b>: 勝ち数<b>{obj.win}</b>　負け数<b>{obj.lose}</b>　スコア<b>{obj.score}</b>
                        </li>;
                    }else{
                        return null;
                    }
                })
            }
        </ul>;
    },
});

