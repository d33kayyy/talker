import React from 'react';
import ReactDOM from 'react-dom';
import ChatBox from './ChatBox';
import './index.css';
import * as firebase from 'firebase';


// Initialize Firebase
var config = {
    apiKey: "AIzaSyAndKwBqYycvtO4UYPwPF0DSkxNsNIesAw",
    authDomain: "talker-test.firebaseapp.com",
    databaseURL: "https://talker-test.firebaseio.com",
    storageBucket: "talker-test.appspot.com",
    messagingSenderId: "234185217177"
};
firebase.initializeApp(config);

// // Get elements
// const txtEmail = document.getElementById('txtEmail');
// const txtPassword = document.getElementById('txtPassword');
// const btnLogin = document.getElementById('btnLogin');
// const btnSignUp = document.getElementById('btnSignUp');
// const btnLogout = document.getElementById('btnLogout');
//
// // Add login event
//
// btnLogin.addEventListener('click', e => {
//     // Get email and password
//     const email = txtEmail.value;
//     const pass = txtPassword.value;
const auth = firebase.auth();
//
//     // Sign-in
// const promise = auth.signInWithEmailAndPassword('dk1721996@gmail.com', '123456');
const promise = auth.signInWithEmailAndPassword('Giabao2608@gmail.com', 'giabao0212');

// const promise = auth.createUserWithEmailAndPassword('dk1721996@gmail.com', '123456');
promise.catch(e => console.log(e.message));
// });

ReactDOM.render(
    <ChatBox />,
    document.getElementById('root')
);
