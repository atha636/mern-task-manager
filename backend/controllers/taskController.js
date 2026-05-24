const Task = require("../models/Task");

const createTask = async(req,res)=>{

    try{

        const {title,description,status} = req.body;

        if(!title || !description){

            return res.status(400).json({
                message:"Title and Description required"
            });
        }

        const task = await Task.create({

            title,
            description,
            status,

            user:req.user._id
        });

        res.status(201).json({

            success:true,
            message:"Task Created",
            task
        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

const getTasks = async(req,res)=>{

    try{

        const tasks = await Task.find({

            user:req.user._id

        }).sort({

            createdAt:-1
        });

        res.status(200).json({

            success:true,
            count:tasks.length,
            tasks
        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

const updateTask = async(req,res)=>{

    try{

        const task = await Task.findById(req.params.id);

        if(!task){

            return res.status(404).json({
                message:"Task not found"
            });
        }

        // ownership check
        if(task.user.toString() !== req.user._id.toString()){

            return res.status(401).json({
                message:"Not Authorized"
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true,
                runValidators:true
            }
        );

        res.status(200).json({

            success:true,

            message:"Task Updated",

            updatedTask
        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

const updateTaskStatus = async(req,res)=>{

    try{

        const task = await Task.findById(req.params.id);

        if(!task){

            return res.status(404).json({
                message:"Task not found"
            });
        }

        // ownership check
        if(task.user.toString() !== req.user._id.toString()){

            return res.status(401).json({
                message:"Not Authorized"
            });
        }

        task.status = req.body.status;

        await task.save();

        res.status(200).json({

            success:true,

            message:"Task Status Updated",

            task
        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

const deleteTask = async(req,res)=>{

    try{

        const task = await Task.findById(req.params.id);

        if(!task){

            return res.status(404).json({
                message:"Task not found"
            });
        }

        // ownership check
        if(task.user.toString() !== req.user._id.toString()){

            return res.status(401).json({
                message:"Not Authorized"
            });
        }

        await task.deleteOne();

        res.status(200).json({

            success:true,

            message:"Task Deleted"
        });

    }catch(error){

        res.status(500).json({
            message:error.message
        });
    }
};

module.exports = {

    createTask,

    getTasks,

    updateTask,
    updateTaskStatus,
    deleteTask
};