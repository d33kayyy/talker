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
        }
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
                    <div className="form-group">
                        <input className="form-control" placeholder="E-mail" name="email" type="text"/>
                    </div>
                    <div className="form-group">
                        <input className="form-control" placeholder="Password" name="password"
                               type="password"/>
                    </div>
                    <input className="btn btn-lg btn-success btn-block" type="submit" value="Login"/>
                </div>
            </div>
        )
    }

    renderChat() {
        const messages = Object.keys(this.state.messages).map((key) => {
            console.log(key);
            return (
                <li key={key}>{this.state.messages[key].text}</li>
            )
        });

        return (
            <div>

                <input type="text" placeholder="Message" onChange={this.updateMsg}/>
                <button onClick={this.send}>Send</button>

                <ul>
                    {messages}
                </ul>
            </div>
        )
    }

    render() {
        return (
            // (firebase.auth().currentUser) ?
            this.renderChat()
            // : this.renderForm()
        )
    }
}

export default ChatBox;