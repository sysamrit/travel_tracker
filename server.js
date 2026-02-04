const express=require('express');
const dotenv=require('dotenv').config();
const port=process.env.PORT || 3300
const {db}=require('./db/db');
const cors=require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const path =require('path');

const app=express();

//middlewares
app.use(express.urlencoded());
app.use(express.json());
app.use(cors('*'));
app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

db.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('SQL connection failed:', err);
    return;
  }
  console.log('PostgreSQL connected successfully');

  // Set up keep-alive query every hour
  setInterval(() => {
    db.query('SELECT 1', (err) => {
      if (err) {
        console.error('Keep-alive query failed:', err);
      } else {
        console.log('Connection staying alive...');
      }
    });
  }, 3600000);
});

app.get('/travel_details',(req,res)=>{
    res.sendFile(path.join(__dirname,'./public/travel.html'));
})

app.get('/travel_remarks',(req,res)=>{
    res.sendFile(path.join(__dirname,'./public/travel_remarks.html'));
})

app.use('/api/v1/tt',require('./router/traveltrackerRouter'));
require('./router/traveltrackercronsRouter').initSchedulers();

app.listen(port,()=>{
    console.log(`Server running http://localhost:${port}`)
});