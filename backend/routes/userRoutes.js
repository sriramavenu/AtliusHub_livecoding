import express from 'express'
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router=express.Router();

router.post('/signup',asyncHandler(async(req,res)=>{
    const collectionObj=req.app.get('usersCollectionObj');
    console.log(collectionObj,'coll')
    const newUser = req.body;
    const userExists = await collectionObj.findOne({username:newUser.username});
    //console.log(userExists,"userexists");
    if(userExists!=null){
        res.status(400);
        res.send({message:'user already exists'})
        //throw new Error('User already exists!');
    }
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password,10);
    const user = await collectionObj.insertOne(newUser);
    if(user){
        res.status(201).send({message: "user created",userData:newUser});
    }
}))


router.post('/login', asyncHandler(async(req,res) => {
    const collectionObj=req.app.get('usersCollectionObj');
    const userCred = req.body;
    console.log(collectionObj,'coll');
    const userOfDb= await collectionObj.findOne({username:userCred.username});
    console.log(userOfDb,"userOfDb");
    if(userOfDb===null){
        res.status(200).send({message:"Invalid username!"});
    }else{
        let isEqual = await bcrypt.compare(userCred.password,userOfDb.password);
        //console.log(isEqual,"isEqual");
        if(isEqual===false){
            res.status(200).send({message:"Wrong password!"});
        }else{
            let token=jwt.sign({username:userOfDb.username},'pqrstu',{expiresIn:'1h'});
            res.status(201).send({message:"login successful",token:token,userData:userOfDb});
        }
    }
}))


export default router;