import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
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


ReactDOM.render(
    <App />,
    document.getElementById('root')
);
