// General comments:
// In the comments, a user refers to the client which is connected to the room
// Peer handles the user ids
// There has to be a peer server running in order for this to work

//Referencing socket
const socket = io('/');
//Getting the video grid to append video feeds to later
const videoGrid = document.querySelector('.video_chat_div')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3031' //Change this later
})
//Creating a video element for the connected user's video
const myVideo = document.createElement('video');
myVideo.classList.add("video");
//Muting it for the user so that they don't hear themselves
myVideo.muted = true
//
const peers = {}

//Chat Constants
const newMessageSubmitBtn = document.querySelector(".text_chat_submit_btn");
// const messageForm = document.getElementById('send-container')
// const messageContainer = document.getElementById('message-container')
const messagesDiv = document.querySelector(".text_chat_message_div");
const newMessageField = document.querySelector(".text_chat_input_field");

const allUsersList = document.querySelector(".text_chat_users_list");
//Getting the username and sending the join message
const username = prompt('what is your name?')
appendMessage('You joined', 0)

socket.on('chat-message', (message, username) => {
    newMessage(username, message);
})

const userArea = document.getElementById('userContainer')

//Getting the audio and video feeds of the user
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    //Calling the function to add the stream to the video grid
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)

        const video = document.createElement('video');
        video.classList.add("video");
        
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    //Listens to the user-connected event from the server.js -- Fires every time a user joins the room
    socket.on('user-connected', (userId, username, alist) => {
        //The timeout is to stop the route from being called before the video element is created
        //without it the new user's video does not get added to the grid since it happens too quickly
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000);
        refreshUserDiv(alist)
        appendMessage(`${username} has joined`, 0);
        // appendMessage(`${username} connected`)
    })
})


//Handles disconnects properly
socket.on('user-disconnected', (userId, username, alist) => {
    //Timeout to stop it from firing a blank
    setTimeout(() => {
        if  (peers[userId]) peers[userId].close()        
    }, 1000);
    refreshUserDiv(alist)
    // appendMessage(`${username} disconnected`, 1)
    appendMessage(`${username} has left `, 1);
})

//Handles the generation of user ids
myPeer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId, username, (callback) =>{
        refreshUserDiv(callback.list)
    })
})

//Handles connected a new user's video to existing users
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    video.classList.add("video");
    
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

//Adds the video stream to the grid
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//Appends messages
function appendMessage(message, type = 2) {
    const messageElement = document.createElement('p')
    let timestamp = getTimeStamp();
    messageElement.classList.add('text_chat_message_p');
    if (type == 0) {
        messageElement.classList.add('join_message');
    } else if (type == 1) {
        messageElement.classList.add('user_left_message'); //Change later
    }
    messageElement.innerHTML = message + ` ${timestamp}`;
    messagesDiv.append(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//Stops form from refreshing on sending a new message
newMessageSubmitBtn.onclick = (e) => {
    e.preventDefault()
    const message = newMessageField.value
    if (message == '') return
    newMessage("You ", message);
    // appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', message, username, ROOM_ID)
    newMessageField.value = ''
}

//Refreshes the user div
function refreshUserDiv(currentUsers) {
    // console.log(allUsersList);
    allUsersList.innerHTML = "";
    for(const [key, value] of Object.entries(currentUsers)) {
        // Creates the span for the new user
        let userListItem = document.createElement('li')
        //Adds the username and user id to the span
        userListItem.textContent = value.name
        userListItem.id = value.id
        userListItem.classList.add('user_list_item');
        //Adds the span to the user container element
        allUsersList.append(userListItem)
    }
}

function newMessage(username, message) {
    let newMessageWrapper = document.createElement("div");
    newMessageWrapper.classList.add("text_message_wrapper");

    let newMessageHeader = document.createElement("div");
    newMessageHeader.classList.add("text_message_header");
    
    let newMessageUser = document.createElement("span");
    newMessageUser.classList.add("text_message_user");

    let newMessageTime = document.createElement("span");
    newMessageTime.classList.add("text_message_time");

    let newMessage = document.createElement("p");
    newMessage.classList.add("text_message");

    let timestamp = getTimeStamp();
    newMessageUser.textContent = username;
    newMessageTime.textContent = timestamp;
    newMessage.textContent = message;
    
    newMessageHeader.appendChild(newMessageUser);
    newMessageHeader.appendChild(newMessageTime);

    newMessageWrapper.appendChild(newMessageHeader);
    newMessageWrapper.appendChild(newMessage);

    messagesDiv.appendChild(newMessageWrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

//Timestamps
function getTimeStamp() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}