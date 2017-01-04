import React, {Component} from 'react';
import * as firebase from 'firebase';


class ChatBox extends Component {

    constructor(props, context) {
        super(props, context);
        this.updateMsg = this.updateMsg.bind(this);
        this.uploadImg = this.uploadImg.bind(this);
        this.send = this.send.bind(this);
        this.state = {
            message: '',
            messages: []
        };
    }

    componentWillMount() {
        // authenticate user to get access to the database
        this.auth = firebase.auth();
        this.uid = this.auth.currentUser.uid;

        // Firebase storage to upload image
        this.storage = firebase.storage();

        // Loading image when uploading file
        // this.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

        this.channel = this.props.channel;

        // sync
        this.messageRef = firebase.database().ref('channel/' + this.channel + '/messages');
        this.messageRef.on('value', (snapshot) => {
            const msg = snapshot.val();

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }
        });

    }

    componentDidMount() {
        // Remove channel when user disconnect
        const amOnline = firebase.database().ref('.info/connected');
        const channelRef = firebase.database().ref('channel/' + this.channel);
        amOnline.on('value', function (snapshot) {
            if (snapshot.val()) {
                channelRef.onDisconnect().remove();
                console.log('here');
            }
        });

        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                firebase.database().ref('channel/' + this.channel).remove();
            }
        });

    }

    componentWillUnmount() {
        // Remove previous messages
        if (this.auth.currentUser) {
            firebase.database().ref('channel/' + this.channel).remove();
        }
    }

    updateMsg(event) {
        this.setState({
            message: event.target.value
        })
    }

    send(event) {
        event.preventDefault();
        if (!this.state.message) {
            return
        }
        // construct the message
        const nextMsg = {
            fromID: this.uid,
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

    uploadImg(event) {
        var file = event.target.files[0];
        this.fileChooser.value = '';

        if (!file.type.match('image.*')) {
            alert('You can only share images.');
        }


        // Upload the image to Firebase Storage.
        this.storage.ref(this.uid + '/' + Date.now() + '/' + file.name)
            .put(file, {contentType: file.type})
            .then(snapshot => {
                // Get the file's Storage URI and update the chat message placeholder.
                // var filePath = snapshot.metadata.fullPath;
                // data.update({imageURL: this.storage.ref(filePath).toString()});

                var filePath = snapshot.metadata.downloadURLs[0];
                // data.update({imageURL: filePath});

                const image = {
                    fromID: this.uid,
                    imageURL: filePath,
                };

                this.messageRef.push(image);

            })
            .catch(e => {
                console.error('There was an error uploading a file to Firebase Storage:', e.message);
            });

    }

    displayMessage(message) {

        var content = '';
        if (message.text) {
            content = <p>{message.text}</p>
        } else if (message.imageURL) {
            let imageUri = message.imageURL;
            this.src = '';

            if (imageUri.startsWith('gs://')) {
                this.storage.refFromURL(imageUri).getMetadata().then(metadata => {
                    console.log(metadata.downloadURLs[0]);
                    this.src = metadata.downloadURLs[0];
                });
            } else {
                this.src = imageUri
            }

            content = <img className='img-responsive' src={this.src} alt='img'/>;
        }

        if (this.uid === message.fromID) {
            return (
                <div className="row msg_container base_sent">
                    <div className="messages msg_sent">
                        {content}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="row msg_container">
                    <div className="messages msg_receive">
                        {content}
                    </div>
                </div>
            )
        }
    }


    render() {
        // console.log('render');
        const messages = Object.keys(this.state.messages).map((key) => {
            // console.log(key);
            return (
                <div key={key}>
                    {this.displayMessage(this.state.messages[key])}
                </div>
            )
        });

        return (
            <div className="row col-xs-8 col-md-6 col-md-offset-3">
                <div className="col-xs-12 col-md-12">
                    <div className="panel panel-primary">
                        <div className="panel-heading top-bar">
                            <div className="col-md-12 col-xs-12">
                                <h3 className="panel-title"><i className="fa fa-comments-o"> </i>
                                    Talker</h3>
                            </div>
                        </div>
                        <div className="panel-body msg_container_base" id="chatbox">
                            {messages}
                        </div>

                        <div className="panel-footer">
                            <form onSubmit={this.send}>
                                <div className="form-group">
                                    <input className="form-control" type="text" placeholder="Write your message here..."
                                           onChange={this.updateMsg}
                                           ref={(input) => this.textInput = input}/>
                                </div>
                            </form>
                            <form id="image-form" action="#">
                                <input id="mediaCapture" type="file"
                                       accept="image/*,capture=camera"
                                       onChange={this.uploadImg} ref={(input) => this.fileChooser = input}/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ChatBox;