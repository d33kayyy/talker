import React, {Component} from 'react';
import * as firebase from 'firebase';
import UserPanel from './UserPanel';

class App extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            loggedIn: false,
            errorMsg: ''

        };

        this.handleClick = this.handleClick.bind(this);
        this.signUp = this.signUp.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentWillMount() {

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('app - uid = ' + firebase.auth().currentUser.uid);
                this.setState({loggedIn: true});

                // Add ourselves to presence list when online.
                const amOnline = firebase.database().ref('.info/connected');
                const userRef = firebase.database().ref('presence/' + firebase.auth().currentUser.uid);
                amOnline.on('value', function (snapshot) {
                    if (snapshot.val()) {
                        userRef.onDisconnect().remove();
                        userRef.set(true);
                    }
                });
            } else {
                console.log('false');
                this.setState({loggedIn: false});
            }
        });
    }

    handleClick() {
        const email = this.emailInput.value;
        const pwd = this.pwdInput.value;

        // login with email & password
        const promise = firebase.auth().signInWithEmailAndPassword(email, pwd);
        promise.catch(e => {
            this.setState({
                errorMsg: e.message
            })
        });
    }

    signUp() {
        const email = this.emailInput.value;
        const pwd = this.pwdInput.value;

        // create user and login
        const promise = firebase.auth().createUserWithEmailAndPassword(email, pwd);
        promise.catch(e => {
            this.setState({
                errorMsg: e.message
            })
        });
    }

    logout(){
        // firebase singout
        const promise = firebase.auth().signOut();
        promise.catch(e => console.log(e.message));

        // Remove user from online list
        const userRef = firebase.database().ref('presence/' + firebase.auth().currentUser.uid);
        userRef.remove();
    }


    render() {
        // error message
        let errorAlert = null;
        if (this.state.errorMsg) {
            errorAlert = <div className="alert alert-warning">{this.state.errorMsg}</div>;
        }

        return (
            <div className="container">

                {this.state.loggedIn ? (
                    <div>
                        <button className="btn btn-default" onClick={this.logout}>Logout</button>
                        <UserPanel uid={firebase.auth().currentUser.uid}/>
                    </div>
                ) : (
                    <div>
                        {errorAlert}

                        <input className="form-control" placeholder="Email" type='email' ref={(input) => this.emailInput = input}/>
                        <input className="form-control" placeholder="Password" type='password' ref={(input) => this.pwdInput = input}/>
                        <button className="btn btn-default" onClick={this.handleClick}>Login</button>
                        <button className="btn btn-default" onClick={this.signUp}>Signup</button>

                    </div>
                ) }

            </div>
        )
    }
}

export default App;