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
        this.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif'

        // sync
        this.messageRef = firebase.database().ref('user-messages/' + this.uid + '/' + this.props.peer);
        this.messageRef.on('value', (snapshot) => {
            const msg = snapshot.val();

            if (msg != null) {
                this.setState({
                    messages: msg
                })
            }
        });
        this.peerMessageRef = firebase.database().ref('user-messages/' + this.props.peer + '/' + this.uid);

    }

    componentWillUnmount() {
        // Remove previous messages
        if (this.auth.currentUser) {
            const userMsgRef = firebase.database().ref('user-messages/' + this.uid);
            userMsgRef.remove();
        }
    }

    updateMsg(event) {
        this.setState({
            message: event.target.value
        })
    }

    send(event) {

        // construct the message
        const nextMsg = {
            fromID: this.uid,
            text: this.state.message
        };

        // create a new node (push the message) on Firebase
        const promise = this.messageRef.push(nextMsg);
        promise.catch(e => console.log(e.message));


        const promise2 = this.peerMessageRef.push(nextMsg);
        promise2.catch(e => console.log(e.message));

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

        const image = {
            fromID: this.uid,
            imageUrl: this.LOADING_IMAGE_URL,
        };

        this.messageRef.push(image).then(data => {
            // Upload the image to Firebase Storage.
            this.storage.ref(this.uid + '/' + Date.now() + '/' + file.name)
                .put(file, {contentType: file.type})
                .then(snapshot => {
                    // Get the file's Storage URI and update the chat message placeholder.
                    // var filePath = snapshot.metadata.fullPath;
                    // data.update({imageUrl: this.storage.ref(filePath).toString()});

                    var filePath = snapshot.metadata.downloadURLs[0];
                    data.update({imageUrl: filePath});

                    // push new image to peer chat
                    const promise2 = this.peerMessageRef.push({
                        fromID: this.uid,
                        imageUrl: filePath,
                    });
                    promise2.catch(e => console.log(e.message));
                })
                .catch(e => {
                    console.error('There was an error uploading a file to Firebase Storage:', e.message);
                });
        });
    }

    displayMessage(message) {
        let name = '';

        if (this.uid === message.fromID) {
            name = 'You';
        } else {
            name = 'Anonymous';
        }

        var content = '';
        if (message.text) {
            content = message.text
        } else if (message.imageUrl) {
            let imageUri = message.imageUrl;
            var src = '';

            if (imageUri.startsWith('gs://')) {
                this.storage.refFromURL(imageUri).getMetadata().then(metadata => {
                    // console.log(metadata.downloadURLs[0])
                    src = metadata.downloadURLs[0];
                });
            } else {
                src = imageUri
            }

            // console.log(src);
            content = <img className='img-responsive' src={src} alt='img'/>;
        }


        return (
            <div><strong>{name}</strong>: {content}</div>
        )
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
            <div className="col-md-offset-3 col-md-6">
                <form onSubmit={this.send}>
                    <div className="input-group">
                        <input className="form-control" type="text" placeholder="Message"
                               onChange={this.updateMsg}
                               ref={(input) => this.textInput = input}/>
                        <span className="input-group-btn">
                        <input className="btn" type="submit" disabled={!this.state.message} value='Send'/>
                        </span>
                    </div>
                </form>
                <form id="image-form" action="#">
                    <input id="mediaCapture" type="file" accept="image/*,capture=camera"
                           onChange={this.uploadImg} ref={(input) => this.fileChooser = input}/>
                </form>
                <ul>
                    {messages}
                </ul>
            </div>
        )
    }
}

export default ChatBox;