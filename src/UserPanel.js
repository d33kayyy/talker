import React, {Component} from 'react';
import * as firebase from 'firebase';
import ChatBox from './ChatBox';


class UserPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            onlineUser: [],
            showChat: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.channel = '';
        this.gotChannel = false;

        // authenticate user to get access to the database
        this.auth = firebase.auth();
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

                if (users.length < 1) {
                    this.setState({
                        showChat: false
                    });
                }
            }
        });

        // Select channel
        this.channelRef = firebase.database().ref('channel');
        this.channelRef.on("value", (snap) => {
            var numChannel = snap.numChildren();

            if (numChannel === 0) {
                this.createChannel();
            } else {
                var channels = snap.val();

                if (channels != null) {

                    snap.forEach(child => {
                        // childData will be the actual contents of the child
                        var childData = child.val();
                        if (childData.users === 1) {
                            firebase.database().ref('channel/' + child.key).set({users: 2});
                            this.channel = child.key;
                            console.log(this.channel);
                            this.gotChannel = true;

                            this.setState({
                                showChat: true,
                            });

                            return true;
                        }
                    });

                    if (this.gotChannel === false) {
                        this.createChannel();
                    }
                }
            }
        });
    }

    createChannel() {
        this.channelRef.push(true).then(snapshot => {
            // console.log(snap.key);

            // Count number of user in this channel
            firebase.database().ref('channel/' + snapshot.key).set({users: 1})
                .then(data => {
                    const myChannelRef = firebase.database().ref('channel/' + snapshot.key + '/users');
                    myChannelRef.on('value', snap => {
                        console.log('users = ' + snap.val());
                        if (snap.val() === 2) {
                            this.setState({
                                showChat: true,
                            });
                        }
                    });
                    // myChannelRef.onDisconnect().remove();
                });
            this.channel = snapshot.key;

        });
    }

    componentWillUnmount() {
        alert('UserPanel unmounting');
        // Remove previous messages
        if (this.auth.currentUser) {
            firebase.database().ref('channel/' + this.channel).remove();
        }
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
                ? <ChatBox channel={this.channel}/>
                : ( <div>
                    <h2> Searching</h2>
                    {/* 
                     <h3>Online users</h3>
                     <ul>
                     {this.state.onlineUser.map(uid => (
                     <li key={uid}>
                     <button value={uid} onClick={this.handleClick}>{uid}</button>
                     </li>
                     ))}
                     </ul>
                     */}


                </div>
            )
        )
    }
}

export default UserPanel;