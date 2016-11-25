import React, {Component} from 'react';
import * as firebase from 'firebase';


class ChatBox extends Component {

    constructor(props, context) {
        super(props, context);
        this.updateMsg = this.updateMsg.bind(this);
        this.send = this.send.bind(this);
        this.state = {
            message: '',
            messages: []
        };
    }

    componentWillMount() {
        // authenticate user to get access to the database
        this.auth = firebase.auth();

        // sync
        this.messageRef = firebase.database().ref('messages');
        this.messageRef.on('value', (snapshot) => {
            const msg = snapshot.val();

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }
        });

    }

    componentWillUpdate() {
        // Add ourselves to presence list when online.
        const amOnline = firebase.database().ref('.info/connected');
        const userRef = firebase.database().ref('presence/' + this.auth.currentUser.uid);
        amOnline.on('value', function (snapshot) {
            if (snapshot.val()) {
                userRef.onDisconnect().remove();
                userRef.set(true);
            }
        });

        // Number of online users is the number of objects in the presence list.
        const listRef = firebase.database().ref('presence');
        listRef.on("value", function (snap) {
            console.log("# of online users = " + snap.numChildren());
        });
    }

    componentWillUnmount() {
        this.messageRef.off();
    }

    updateMsg(event) {
        this.setState({
            message: event.target.value
        })
    }

    send(event) {

        // construct the message
        const nextMsg = {
            fromID: this.auth.currentUser.uid,
            text: this.state.message
        };

        // create a new node (push the message) on Firebase
        const promise = this.messageRef.push(nextMsg);
        promise.catch(e => console.log(e.message));

        console.log('send: ' + this.state.message);

        // Clear text input
        this.textInput.value = '';
        this.setState({
            message: ''
        });

        event.preventDefault();
    }

    displayUser(message) {
        var name = '';

        if (this.auth.currentUser && this.auth.currentUser.uid === message.fromID) {
            name = 'You';
        } else {
            name = 'Anonymous';
        }

        return (
            <span><strong>{name}</strong>: {message.text}</span>
        )
    }

    render() {
        console.log('render');
        const messages = Object.keys(this.state.messages).map((key) => {
            // console.log(key);
            return (
                <li key={key}>
                    {this.displayUser(this.state.messages[key])}
                </li>
            )
        });

        return (
            <div className="container">
                <div className="col-md-offset-3 col-md-6">
                    <form onSubmit={this.send}>
                        <input className="form-control" type="text" placeholder="Message"
                               onChange={this.updateMsg}
                               ref={(input) => this.textInput = input}/>

                        <input className="btn" type="submit" disabled={!this.state.message} value='Send'/>
                    </form>
                    <ul>
                        {messages}
                    </ul>
                </div>
            </div>
        )
    }
}

export default ChatBox;