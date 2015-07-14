var Index;
try{
    Index=require('./src/index.js');
    console.log("WARNING: using debug build");
}catch(e){
    Index=require('./js/index.js');
}

var a=new Index();
a.start();
