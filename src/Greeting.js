import React, {Component} from 'react';
import * as firebase from 'firebase';
import ChatBox from './ChatBox';

class Greeting extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            loggedIn: false,
            loaded: false
        };
    }

    componentWillMount() {

        firebase.auth().onAuthStateChanged((user) => {
            console.log(this.state.loggedIn);
            if (user) {
                this.setState({loggedIn: true, loaded: true});
            } else {
                this.setState({loggedIn: false, loaded: true});
            }
        });

    }

    componentDidMount() {
        const auth = firebase.auth();
        const promise = auth.signInAnonymously();
        promise.catch(e => console.log(e.message));
    }

    renderForm() {
        return (
            <div className="container">
                <div className="col-md-4 col-md-offset-4">
                    <button className="btn" onClick={this.login}>Start</button>
                </div>
            </div>
        )
    }

    render() {
        if (!this.state.loggedIn) return <h1>Loading</h1> ;

        return (
            <div>
                {this.state.loggedIn ? (
                    <div>
                        <ChatBox/>
                    </div>
                ) : (
                      <h2>logging in </h2>
                ) }
            </div>
        );
    }
}

export default Greeting;