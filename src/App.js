import React, {Component} from 'react';
import * as firebase from 'firebase';
import UserPanel from './UserPanel';

class App extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            loggedIn: false
        };
    }

    componentWillMount() {
        this.auth = firebase.auth();
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({loggedIn: true});
            } else {
                this.setState({loggedIn: false});
            }
        });
    }

    componentDidMount() {
        // authenticate user to get access to the database
        const promise = this.auth.signInAnonymously();
        promise.catch(e => console.log(e.message));
    }

    render() {
        return (
            <div className="container">

                {this.state.loggedIn ? (
                    <div>
                        <UserPanel/>
                    </div>
                ) : (
                    <h2>Loading</h2>
                ) }

            </div>
        )
    }
}

export default App;