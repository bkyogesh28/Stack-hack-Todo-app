const mongoose=require('mongoose')
const task=mongoose.model('savetask',{
    title:{
        type:String,
        required:true,
        trim:true
    },
    prio:{
        type:Number,
        
    },
    description:{
        type:String,
        required:true,
        trim:true
    }
})
module.exports=task