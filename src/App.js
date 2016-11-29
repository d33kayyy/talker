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

        this.login = this.login.bind(this);
        this.signUp = this.signUp.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentWillMount() {
        // Firebase services
        this.auth = firebase.auth();
        this.db = firebase.database();

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // Change state for UI
                this.setState({loggedIn: true});

                this.uid = firebase.auth().currentUser.uid;

                // Remove message when user quit
                const userMsgRef = this.db.ref('user-messages/' + this.uid);
        
                // Add ourselves to presence list when online.
                const amOnline = this.db.ref('.info/connected');
                const userRef = this.db.ref('presence/' + this.uid);

                amOnline.on('value', function (snapshot) {
                    if (snapshot.val()) {
                        userRef.onDisconnect().remove();
                        userRef.set(true);

                        userMsgRef.onDisconnect().remove();
                    }
                });

            } else {
                console.log('false');
                this.setState({loggedIn: false});
            }
        });
    }

    login() {
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

    logout() {

        // Remove user from online list
        const userRef = this.db.ref('presence/' + this.uid);
        userRef.remove();

        // Remove messages
        const userMsgRef = this.db.ref('user-messages/' + this.uid);
        userMsgRef.remove();

        // Firebase sign out
        const promise = firebase.auth().signOut();
        promise.catch(e => console.log(e.message));
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
                        <UserPanel />
                    </div>
                ) : (
                    <div>
                        {errorAlert}

                        <input className="form-control" placeholder="Email" type='email' ref={(input) => this.emailInput = input}/>
                        <input className="form-control" placeholder="Password" type='password' ref={(input) => this.pwdInput = input}/>
                        <button className="btn btn-default" onClick={this.login}>Login</button>
                        <button className="btn btn-default" onClick={this.signUp}>Signup</button>

                    </div>
                ) }

            </div>
        )
    }
}

export default App;