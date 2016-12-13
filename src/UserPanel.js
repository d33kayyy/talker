import React, {Component} from 'react';
import * as firebase from 'firebase';
import ChatBox from './ChatBox';


class UserPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            onlineUser: [],
            showChat: false,
            peer: ''
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillMount() {
        // authenticate user to get access to the database
        this.uid = firebase.auth().currentUser.uid;

        // Number of online users is the number of objects in the presence list.
        const listRef = firebase.database().ref('presence');
        // if (listRef) {
        listRef.on("value", (snap) => {
            const onlineUser = snap.val();
            if (onlineUser != null) {

                // remove current user
                var users = Object.keys(onlineUser);
                const index = users.indexOf(this.uid);

                if (index > -1) {
                    users.splice(index, 1);
                }

                this.setState({
                    onlineUser: users
                })

                if (users.length <1){
                    this.setState({
                        showChat: false
                    });
                }
            }
        });
    }

    handleClick(e) {
        this.setState({
            showChat: true,
            peer: e.target.value
        });
    }

    render() {
        if (this.state.onlineUser.length < 1) {
            return <h2>Cannot find any peer :(</h2>;
        }

        return (
            (this.state.showChat)
                ? <ChatBox peer={this.state.peer}/>
                : ( <div>
                        <h3>Online users</h3>
                        <ul>
                            {this.state.onlineUser.map(uid => (
                                <li key={uid}>
                                    <button value={uid} onClick={this.handleClick}>{uid}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                     )
        )
    }
}

export default UserPanel;