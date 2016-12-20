import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as firebase from 'firebase';


// Initialize Firebase
var config = {
    // apiKey: "AIzaSyDucSFmf7ISfPOaE-WZXAv4biMULPo3zxY",
    // authDomain: "talker-37ce2.firebaseapp.com",
    // databaseURL: "https://talker-37ce2.firebaseio.com",
    // storageBucket: "talker-37ce2.appspot.com",
    // messagingSenderId: "635070252811"

    apiKey: "AIzaSyCdZ0EKNzN5v8VEJly2KykdOzZ0eQjCwwQ",
    authDomain: "talkerproject-934bc.firebaseapp.com",
    databaseURL: "https://talkerproject-934bc.firebaseio.com",
    storageBucket: "talkerproject-934bc.appspot.com",
    messagingSenderId: "366757086342"
};
firebase.initializeApp(config);


ReactDOM.render(
    <App />,
    document.getElementById('root')
);
