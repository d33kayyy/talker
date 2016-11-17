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

// TODO: Login/Logout bug

class ChatBox extends Component {

    constructor(props, context) {
        super(props, context);
        this.updateMsg = this.updateMsg.bind(this);
        this.send = this.send.bind(this);
        this.state = {
            message: '',
            messages: [],
            isLoggedIn: false
        };

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);

    }

    // componentDidMount() {
    //     firebase.database().ref('messages').on('value', (snapshot) => {
    //         const msg = snapshot.val();
    //         // console.log(Object.keys(msg));
    //
    //
    //         // var newData = this.state.messages.concat(msg);
    //         // console.log(newData);
    //
    //         if (msg != null) {
    //             this.setState({
    //                 messages: msg
    //             })
    //         }
    //
    //     })
    // }

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
    }

    renderForm() {
        return (
            <div className="container">
                <div className="col-md-4 col-md-offset-4">
                    <button className="btn" onClick={this.login}>Login Anonymously</button>
                </div>
            </div>
        )
    }

    login(event) {
        const auth = firebase.auth();
        const promise = auth.signInAnonymously();
        promise.catch(e => console.log(e.message));

        this.setState({
            isLoggedIn: true
        });

        firebase.database().ref('messages').on('value', (snapshot) => {
            const msg = snapshot.val();

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }

        });

        console.log(firebase.auth().currentUser)
    }

    logout(event) {
        const auth = firebase.auth();
        auth.signOut();

        this.setState({
            isLoggedIn: false
        })
    }

    displayUser(uid) {

        if (firebase.auth().currentUser && firebase.auth().currentUser.uid === uid) {
            return <span>You</span>;
        } else {
            return <span>Anonymous</span>;
        }
    }

    renderChat() {
        const messages = Object.keys(this.state.messages).map((key) => {
            // console.log(key);
            return (
                <li key={key}>
                    {this.displayUser(this.state.messages[key].fromID)}: {this.state.messages[key].text}
                </li>
            )
        });

        return (
            <div className="container">
                <div className="col-md-2 col-md-offset-2">
                    <button className="btn" onClick={this.logout}>Logout</button>
                </div>

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
            (this.state.isLoggedIn) ? this.renderChat() : this.renderForm()
        )
    }
}

export default ChatBox;