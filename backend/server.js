import express from 'express'
import { MongoClient } from 'mongodb';
import userRoutes from './routes/userRoutes.js'
import cors from 'cors'
const app=express();

const port=4200;
app.listen(port,()=>{console.log(`Server started at port: ${port}`)})

MongoClient
    .connect('mongodb://127.0.0.1:27017')
    .then(dbref => {
        const dbObj = dbref.db('athubdb')
        const tasksCollectionObj = dbObj.collection('tasksCollection');
        const usersCollectionObj = dbObj.collection('usersCollection');
        app.set('tasksCollectionObj', tasksCollectionObj);
        app.set('usersCollectionObj', usersCollectionObj);
        console.log('db connected successfully')
    })
    .catch(err => {
        console.log('error in connecting db', err)
    })

app.use(cors);
app.use(express.json())

app.use('/app/users',userRoutes)
// app.use('/app/tasks',todoRoutes);






















//add todo
app.post('/add-todo',(req,res)=>{
    const todosCollectionObj=req.app.get('todosCollectionObj');
    const newTodo = req.body
    todosCollectionObj.insertOne(newTodo)
        .then(dbres => {
            res.status(201).send('Todo Added')
        })
        .catch(err => { console.log('err in adding todo from server is', err) })
})

//get completed todos
app.get('/completed-todos', (req, res) => {
    const todosCollectionObj = req.app.get('todosCollectionObj')
    todosCollectionObj.find({completed:'true'}).toArray()
        .then(completedTodos => {
            res.send(completedTodos)
        })
        .catch(er=>console.log(er,'->er in call for completed todos'))
})

//get pending todos
app.get('/pending-todos', (req, res) => {
    const todosCollectionObj = req.app.get('todosCollectionObj')
    todosCollectionObj.find({completed:'false'}).toArray()
        .then(pendingTodos => {
            res.send(pendingTodos)
        })
        .catch(er=>console.log(er,'->er in call for pending todos'))
})

//delete todo
app.delete('/delete-todo/:id', (req, res) => {
    const todosCollectionObj = req.app.get('todosCollectionObj')
    const todoId = req.params.id;
    const objectId = new ObjectId(todoId);
    todosCollectionObj.deleteOne({ _id: objectId })
        .then(result => {
            if (result.deletedCount === 1) {
                res.send('todo deleted successfully');
            } else {
                res.status(404).send('todo not found');
            }
        })
        .catch(err => {
            console.error('Error in deleting todo from the server:', err);
            res.status(500).send('Internal Server Error');
        });
})

//toggle 'completed' in todo (update request)
app.put('/toggle-todo/:id',(req,res)=>{
    const todosCollectionObj=req.app.get('todosCollectionObj');
    const todoId=req.params.id;
    const objectId=new ObjectId(todoId);
    todosCollectionObj.updateOne({_id:objectId},{ $set: { completed: req.body.completed === 'false' ? 'true' : 'false' } })
    .then(dbres=>{
        res.send(dbres);
    })
    .catch(er=>{
        console.log(er,'->er in getting one todo');
    })
})

//edit todo
app.put('/edit-todo/:id',(req,res)=>{
    const todosCollectionObj=req.app.get('todosCollectionObj');
    const todoId=req.params.id;
    const objectId = new ObjectId(todoId);
    const body=req.body;
    todosCollectionObj.updateOne({_id:objectId},{$set:{...body}})
    .then(result=>{
        console.log(result,'todo edited');
    })
    .catch(er=>{
        console.log(er,'todo edit error');
    })
})

//add due-date to todo
app.put('/add-due-date/:id',(req,res)=>{
    const todosCollectionObj=req.app.get('todosCollectionObj');
    const todoId=req.params.id;
    const objectId=new ObjectId(todoId);
    const body=req.body;
    todosCollectionObj.updateOne({_id:objectId}, { $set: { dueDate: body.dueDate } })
    .then(result=>res.send('due-date-added from server'))
    .catch(er=>res.send(er,'add-due-date error from server'))
})

