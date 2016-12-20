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
        this.logout = this.logout.bind(this);
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

                // if (users.length < 1) {
                //     this.setState({
                //         showChat: false,
                //         searching: false
                //     });
                // }
            }
        });


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
                            this.gotChannel = true;
                            console.log(this.channel);

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
        }).then(() => {
            // Listener to participants change
            const channelUsersRef = firebase.database().ref('channel/' + this.channel + '/users');
            channelUsersRef.on('value', snap => {
                if (!snap.val()) {
                    this.setState({
                        showChat: false,
                        searching: false
                    });
                }
            });
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
                if (!snap.val()) {
                    this.setState({
                        showChat: false,
                        searching: false
                    });
                }
                if (snap.val() === 1) {
                    this.setState({
                        searching: true
                    });
                }
                if (snap.val() === 2) {
                    this.setState({
                        showChat: true,
                    });
                }
            });

            this.channel = snapshot.key;
        }).then(() => {
            const amOnline = firebase.database().ref('.info/connected');
            const channelRef = firebase.database().ref('channel/' + this.channel);
            amOnline.on('value', function (snapshot) {
                if (snapshot.val()) {
                    channelRef.onDisconnect().remove();
                }
            });
        });
    }

    logout() {
        // Remove user from online list
        const channelRef = firebase.database().ref('channel/' + this.channel);
        channelRef.remove();

        // Remove user from online list
        const userRef = firebase.database().ref('presence/' + this.uid);
        userRef.remove();

        // Firebase sign out
        const promise = firebase.auth().signOut();
        promise.catch(e => console.log(e.message));
    }

    render() {
        const logout_btn = <button className="btn btn-default pull-right" onClick={this.logout}>Logout</button>;
        var content = '';
        
        if (this.state.showChat) {
            content = <ChatBox channel={this.channel}/>;
        } else {
            if (this.state.searching) {
                content = (
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
                content = (
                    <div className="col-md-4 col-md-offset-4 text-center">
                        <button className="btn btn-info" onClick={this.selectChannel}>Search</button>
                    </div>
                );
            }
        }

        return <div>{content} {logout_btn}</div>
    }

}

export default UserPanel;