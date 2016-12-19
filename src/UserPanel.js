import React, {Component} from 'react';
import * as firebase from 'firebase';
import ChatBox from './ChatBox';


class UserPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            onlineUser: [],
            showChat: false,
            searching: false
        };
        // this.handleClick = this.handleClick.bind(this);
        this.channel = '';
        this.gotChannel = false;

        this.selectChannel = this.selectChannel.bind(this);
    }

    componentWillMount() {
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
                });

                if (users.length < 1) {
                    this.setState({
                        showChat: false,
                        searching: false
                    });
                }
            }
        });

        // this.selectChannel();
    }

    selectChannel() {
        // Select channel
        this.channelRef = firebase.database().ref('channel');
        this.channelRef.once("value", (snap) => {
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
        this.setState({
            searching: true
        });
    }

    createChannel() {
        this.channelRef.push({users: 1}).then(snapshot => {
            const myChannelRef = firebase.database().ref('channel/' + snapshot.key + '/users');
            myChannelRef.on('value', snap => {
                console.log('users = ' + snap.val());
                if (snap.val() === 2) {
                    this.setState({
                        showChat: true,
                    });
                } else {
                    console.log('showChat = ' + this.state.showChat);
                    if (this.state.showChat) {
                        this.setState({
                            showChat: false,
                            searching: false
                        });
                    }
                }
            });

            this.channel = snapshot.key;
        });
    }

    render() {
        console.log('RENDER' + this.channel);

        if (this.state.showChat) {
            return <ChatBox channel={this.channel}/>;
        } else {
            if (this.state.searching) {
                return (
                    <div className="col-md-4 col-md-offset-4 text-center">
                        <h2>Searching...</h2>
                        <div className='progress'>
                            <div className='progress-bar progress-bar-info progress-bar-striped active'
                                 role='progressbar'
                                 aria-valuenow='100'
                                 aria-valuemin='0'
                                 aria-valuemax='100'
                                 style={{width: '100%'}}>
                            </div>
                        </div>
                    </div>
                );

            } else {
                return (
                    <div className="col-md-4 col-md-offset-4 text-center">
                        <button className="btn btn-info" onClick={this.selectChannel}>Search</button>
                    </div>
                );
            }
        }

    }
}

export default UserPanel;