import React, {Component} from 'react';
import * as firebase from 'firebase';

// class ChatList extends React.Component {
//     render() {
//         return (
//             <ul>
//                 {this.props.messages.map(message => (
//                     <li key={message.key}>{message.text}</li>
//                 ))}
//             </ul>
//         );
//     }
// }

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

    componentDidMount() {
        const auth = firebase.auth();
        const promise = auth.signInAnonymously();
        promise.catch(e => console.log(e.message));

        // sync
        firebase.database().ref('messages').on('value', (snapshot) => {
            const msg = snapshot.val();

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }
        });
    }

    updateMsg(event) {
        this.setState({
            message: event.target.value
        })
    }

    send(event) {

        // construct the message
        const nextMsg = {
            fromID: firebase.auth().currentUser.uid,
            text: this.state.message
        };

        // create a new node (push the message) on Firebase
        const promise = firebase.database().ref('messages').push(nextMsg);
        promise.catch(e => console.log(e.message));

        console.log('send: ' + this.state.message);

        // Clear text input
        this.textInput.value = '';
        this.setState({
            message: ''
        })
    }

    displayUser(message) {
        var name = '';

        if (firebase.auth().currentUser && firebase.auth().currentUser.uid === message.fromID) {
            name = 'You';
        } else {
            name = 'Anonymous';
        }

        return (
            <span><strong>{name}</strong>: {message.text}</span>
        )
    }

    renderChat() {
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
                <div className="col-md-4">
                    <input className="form-control" type="text" placeholder="Message"
                           onChange={this.updateMsg}
                           ref={(input) => this.textInput = input}/>

                    <button className="btn" onClick={this.send} disabled={!this.state.message}>Send</button>

                    <ul>
                        {messages}
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        return (
            this.renderChat()
        )
    }
}

export default ChatBox;