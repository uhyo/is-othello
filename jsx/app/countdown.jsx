var React=require('react');

module.exports = React.createClass({
    displayName:"CountDown",
    propTypes:{
        time: React.PropTypes.number,
        count: React.PropTypes.bool,
    },
    getDefaultProps:function(){
        return {
            suffix:""
        };
    },
    getInitialState:function(){
        return {
            time: this.props.time
        };
    },
    componentDidMount:function(){
        if(this.props.count){
            this.startCounting();
        }
    },
    componentWillUnmount:function(){
        if(this.props.count){
            this.stopCounting();
        }
    },
    componentWillReceiveProps:function(nextProps){
        if(this.counting && !nextProps.count){
            this.stopCounting();
        }else if(!this.counting && nextProps.count){
            this.startCounting();
        }
        this.setState({
            time: nextProps.time
        });
    },
    startCounting:function(){
        console.log("start");
        this.counting=true;
        if(window.requestAnimationFrame){
            var curr=Date.now();
            var f=()=>{
                var now=Date.now();
                var nt=this.state.time-(now-curr);
                curr=now;
                if(nt<0){
                    nt=0;
                }
                this.setState({
                    time: nt
                });
                this.a=window.requestAnimationFrame(f);
            };
            this.a=window.requestAnimationFrame(f);
        }
    },
    stopCounting:function(){
        console.log("stop");
        if(this.counting && this.a!=null){
            this.counting=false;
            window.cancelAnimationFrame(this.a);
            this.a=null;
        }
    },
    render:function(){
        return <span>{(this.state.time/1000).toFixed(2)+this.props.suffix}</span>;
    },
});
