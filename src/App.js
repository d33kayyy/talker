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
    }

    componentWillMount() {
        // Firebase services
        this.auth = firebase.auth();
        this.db = firebase.database();

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                // Change state for UI
                this.setState({
                    loggedIn: true,
                    errorMsg: ''
                });

                this.uid = firebase.auth().currentUser.uid;

                // Add ourselves to presence list when online.
                const amOnline = this.db.ref('.info/connected');
                const userRef = this.db.ref('presence/' + this.uid);

                amOnline.on('value', function (snapshot) {
                    if (snapshot.val()) {
                        userRef.onDisconnect().remove();
                        userRef.set(true);
                        console.log('at App');
                    }
                });

            } else {
                // console.log('false');
                this.setState({loggedIn: false});
            }
        });
    }

    login(e) {
        const email = this.emailInput.value;
        const pwd = this.pwdInput.value;

        // login with email & password
        const promise = firebase.auth().signInWithEmailAndPassword(email, pwd);
        promise.catch(e => {
            this.setState({
                errorMsg: e.message
            })
        });
        e.preventDefault();
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

    render() {
        // error message
        let errorAlert = null;
        if (this.state.errorMsg) {
            errorAlert = <div className="alert alert-warning">{this.state.errorMsg}</div>;
        }

        return (
            <div className="container">

                {this.state.loggedIn ? (<UserPanel />) :
                    (
                        <div className="row">
                            <div className="col-md-12">
                                {errorAlert}
                                <div className="row">
                                    <div className='col-md-2 col-md-offset-4'>
                                        <img src={'talk-1.png'} alt="boohoo" className="img-responsive"/>
                                    </div>{/*
                                    */}<div className='col-md-2'>
                                        <h1>Talker</h1>
                                    </div>
                                </div>
                                
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="panel-heading">
                                            <h3 className="panel-title">Sign In</h3>
                                        </div>
                                        <div className="panel-body">

                                            <form onSubmit={this.login}>

                                                <div className="form-group">
                                                    <input className="form-control" placeholder="Email" type='email'
                                                           ref={(input) => this.emailInput = input}/>
                                                </div>
                                                <div className="form-group">
                                                    <input className="form-control" placeholder="Password"
                                                           type='password'
                                                           ref={(input) => this.pwdInput = input}/>
                                                </div>

                                                <button className="btn btn-default pull-left" type='submit'>Login
                                                </button>

                                            </form>
                                            <button className="btn btn-default pull-right" onClick={this.signUp}>
                                                Signup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) }
            </div>
        )
    }
}

export default App;