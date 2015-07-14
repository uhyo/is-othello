var config=require('config');

var Index;
try{
    Index=require('./src/index.js');
    console.log("WARNING: using debug build");
}catch(e){
    Index=require('./js/index.js');
}

var a=new Index();
a.start();

console.log("The server is now waiting. Visit http://localhost:"+config.get("http.port")+"/ to play Othello.");
console.log("If you want to edit config: config/default.yaml");
