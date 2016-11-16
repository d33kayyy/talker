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
            messages: [],
            isLoggedIn: false
        };

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);

    }

    componentDidMount() {
        firebase.database().ref('messages').on('value', (snapshot) => {
            const msg = snapshot.val();
            console.log(Object.keys(msg));


            // var newData = this.state.messages.concat(msg);
            // console.log(newData);

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }

        })
    }

    updateMsg(event) {
        this.setState({
            message: event.target.value
        })
    }

    send(event) {
        console.log('send: ' + this.state.message);

        const nextMsg = {
            // id: this.state.messages.length,
            text: this.state.message
        };

        firebase.database().ref('messages').push(nextMsg);

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

        console.log(firebase.auth().currentUser)
    }

    logout(event) {
        const auth = firebase.auth();
        auth.signOut();

        this.setState({
            isLoggedIn: false
        })
    }

    renderChat() {
        const messages = Object.keys(this.state.messages).map((key) => {
            console.log(key);
            return (
                <li key={key}>
                    {/*{(firebase.auth().currentUser.uid === this.state.messages[key].fromID)} ? You : Anonymous -*/}
                    {this.state.messages[key].text}
                </li>
            )
        });

        return (
            <div className="container">
                <div className="col-md-2 col-md-offset-2">
                    <button className="btn" onClick={this.logout}>Logout</button>
                </div>

                <div className="col-md-4">
                    <input className="form-control" type="text" placeholder="Message" onChange={this.updateMsg}/>
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