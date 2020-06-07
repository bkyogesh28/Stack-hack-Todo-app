const mongoose=require('mongoose')
const validate=require('validator')
mongoose.connect(process.env.dbconnection,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
},()=>{
    console.log("Mongodb connected!!")
})

