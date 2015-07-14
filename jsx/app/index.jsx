var React=require('react');

var connect=require('../../actions/connect');

module.exports = React.createClass({
    displayName:"App",
    componentDidMount:function(){
        connect();
    },
    render:function(){
        return (<p>
            Hi
        </p>);
    }
});
