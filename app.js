

"use strict";

const express = require("express");
const multer = require("multer");
const fs = require('fs').promises;
const cors = require('cors');
const app = express();
const PORT_NUM = 8080;
const ERROR_CODE = 400;
const FILE_PATH = "/img/";
const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: '**************.rds.amazonaws.com',
  database: '**************',
  password: '**************',
  port: **************,
})

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
app.use(express.static("public"));
app.use(cors({origin: 'null'}));

function
(string) {
    const {userQuery} = req.params;
    const validTags = ["javascript", "html", "css"];
    if(!validTags.includes(userQuery)){
      return res.status(400).json({err: "Valid tags only, please!"});
    }
}

app.post("/api/login", async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let password = req.body.password;
    let user = req.body.email;
    await pool.query('BEGIN TRANSACTION');
    const queryText = 'SELECT * FROM user_info where user_email = $1 AND user_password = $2';
    let login = await pool.query(queryText, [user, password]);
    await pool.query('COMMIT');
    if (login.rowCount != 1) {
      res.json({"name": null, "status": false, "info": "login fail, incorrect username or password"});
    } else {
      res.json({"name": user, "status": true, "info": "Login Successed"});
    }
  } catch (err) {
    res.type('text');
    res.status(ERROR_CODE).send("Something went wrong on the server: " + err);
  }
});

app.post("/api/change-password", async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;
    let user = req.body.email;
    if (newPassword !== confirmPassword) {
      res.json({"name": null, "status": false, "info": "login fail, password doesn't match"});
    } else if (newPassword.length <= 5) {
      res.json({"name": null, "status": false, "info": "password is too short, below 6 chars"});
    } else if (newPassword.length > 20) {
      res.json({"name": null, "status": false, "info": "password is too long, exceed 20 chars"});
    } else {
      await pool.query('BEGIN TRANSACTION');
      console.log("s1");
      const queryText = 'SELECT * FROM user_info where user_email = $1 and user_password = $2';
      let userNameCheck = await pool.query(queryText, [user, oldPassword]);
      console.log("s2");
      if (userNameCheck.rowCount != 1) {
        await pool.query('COMMIT');
        res.json({"name": null, "status": false, "info": "Change User Password Fail, wrong password"});
      } else {
        const changePassword = 'UPDATE user_info SET user_password = $2 WHERE user_email = $1';
        await pool.query(changePassword, [user, newPassword]);
        await pool.query('COMMIT');
        res.json({"name": user, "status": true, "info": "User Password Has Changed"});
      }
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    res.type('text');
    res.status(ERROR_CODE).send("Something went wrong on the server: " + err);
  }
});

app.post("/api/registor", async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let user = req.body.email;
    if (password !== confirmPassword) {
      res.json({"name": null, "status": false, "info": "login fail, password doesn't match"});
    } else if (password.length <= 5) {
      res.json({"name": null, "status": false, "info": "password is too short, below 6 chars"});
    } else if (password.length > 20) {
      res.json({"name": null, "status": false, "info": "password is too long, exceed 20 chars"});
    } else {
      await pool.query('BEGIN TRANSACTION');
      const queryText = 'SELECT * FROM user_info where user_email = $1';
      let userNameCheck = await pool.query(queryText, [user]);
      if (userNameCheck.rowCount != 0) {
        await pool.query('COMMIT');
        res.json({"name": null, "status": false, "info": "Create Account Fail, username has been taken"});
      } else {
        const createAccount = 'INSERT INTO user_info(user_email, user_password) VALUES ($1, $2)';
        await pool.query(createAccount, [user, password]);
        await pool.query('COMMIT');
        res.json({"name": user, "status": true, "info": "Account Created"});
      }
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    res.type('text');
    res.status(ERROR_CODE).send("Something went wrong on the server: " + err);
  }
});



const PORT = process.env.port || PORT_NUM;
app.listen(PORT);
