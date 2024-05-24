window.onload = function() {

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCF9-o7siYOpJ9dlT17L4Kr9CRheVlparE",
        authDomain: "chatapp-dbf9c.firebaseapp.com",
        databaseURL: "https://chatapp-dbf9c-default-rtdb.firebaseio.com",
        projectId: "chatapp-dbf9c",
        storageBucket: "chatapp-dbf9c.appspot.com",
        messagingSenderId: "249266023881",
        appId: "1:249266023881:web:e92142232fea0ba162cc18",
        measurementId: "G-CT7P62QXKJ"
      };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();


    class CHATROOM{

      // Home Page has 'Create' OR 'JOIN' Room Options
      home(){
        document.body.innerHTML = '';
        this.create_title();
        this.create_join_form();
      }

      // chat() is used to create the chat page
      chat(){
        this.create_title();
        this.create_chat();
      }
      
      // create_title() is used to create the title
      create_title(){
        var title_container = document.createElement('div');
        title_container.setAttribute('id', 'title_container');
        var title_inner_container = document.createElement('div');
        title_inner_container.setAttribute('id', 'title_inner_container');
  
        var title = document.createElement('h1');
        title.setAttribute('id', 'title');
        title.textContent = 'CHATROOM';
  
        title_inner_container.append(title);
        title_container.append(title_inner_container);
        document.body.append(title_container);
      }

      create_join_form(){

        var parent = this;
        
        var input_container = document.createElement('div');
        input_container.setAttribute('id', 'input_container');
  
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'name_input');
        input.setAttribute('placeholder', 'Enter Name');

        var button_container = document.createElement('div');
        button_container.setAttribute('id', 'button_container');
  
        var create_button_container = document.createElement('div');
        create_button_container.setAttribute('id', 'create_button_container');
  
        var create_button = document.createElement('button');
        create_button.setAttribute('id', 'create_button');
        create_button.innerHTML = 'Create <i class="fas fa-sign-in-alt"></i>';

        var join_button_container = document.createElement('div');
        join_button_container.setAttribute('id', 'join_button_container');
  
        var join_button = document.createElement('button');
        join_button.setAttribute('id', 'join_button');
        join_button.innerHTML = 'Join <i class="fas fa-sign-in-alt"></i>';
    
        create_button.onclick = function(){
            var user = document.getElementById('name_input').value;
            if(user){
                var roomId = Math.random().toString(36).substr(2, 9);
                parent.save_roomId(roomId);
                parent.save_name(user);
                button_container.style.display = 'none';

                // Creates the Room
                db.ref(parent.get_roomId()).once('value', function() {
                    db.ref(parent.get_roomId()).set({
                        users:[],
                        messages: {}
                    });
                  });

                parent.addUserToRoom();
                parent.chat();
                alert(`Room created with ID: ${roomId}`); // ooha: change to Vs code notification
            }
            else{
                displayWarningMessage('Please Enter Name','button_container');
            }
            
        };

        join_button.onclick = function() {
            // Hide the buttons
            var user = document.getElementById('name_input').value;
            if(user){
                parent.save_name(user);
                button_container.style.display = 'none';
                // Create the join form
                var join_form_container = document.createElement('div');
                join_form_container.setAttribute('id', 'join_form_container');
        
                var input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('id', 'room_id_input');
                input.setAttribute('placeholder', 'Enter Room ID');
        
                var join_form_button = document.createElement('button');
                join_form_button.setAttribute('id', 'join_form_button');
                join_form_button.innerHTML = 'Join <i class="fas fa-sign-in-alt"></i>';
        
                join_form_button.onclick = function() {
                    var roomId = document.getElementById('room_id_input').value;
                    var warningMessage = document.getElementById('warning_message');
                
                    if (warningMessage) {
                        warningMessage.remove();
                    }
                
                    if (roomId) {
                        // Reference to the room ID in Firebase
                        parent.save_roomId(roomId);
                        var roomRef = firebase.database().ref(parent.get_roomId());
                        
                        roomRef.once('value').then(function(snapshot) {
                            if (snapshot.exists()) {
                                parent.addUserToRoom();
                                parent.chat();
                            } else {
                                displayWarningMessage('Please enter a valid Room ID.', 'join_form_container');
                            }
                        }).catch(function(error) {
                            console.error('Error checking room ID:', error);
                            displayWarningMessage('An error occurred while checking the Room ID. Please try again.','join_form_container');
                        });
                    } else {
                        displayWarningMessage('Please enter a Room ID.','join_form_container');
                    }
                };

                join_form_container.appendChild(input);
                join_form_container.appendChild(join_form_button);
                document.body.appendChild(join_form_container);
            }else{
                displayWarningMessage('Please Enter Name','button_container');
            }
        };

        function displayWarningMessage(message,id) {
            var warningMessage = document.createElement('div');
            warningMessage.setAttribute('id', 'warning_message');
            warningMessage.style.color = 'red';
            warningMessage.textContent = message;
            document.getElementById(id).appendChild(warningMessage);
        }
        
        // Append everything to the body
        input_container.append(input);
        join_button_container.append(join_button);
        create_button_container.append(create_button);
        button_container.append(input_container, create_button_container, join_button_container);
        document.body.append(button_container);
      }

      // create_load() creates a loading circle that is used in the chat container
      create_load(container_id){
        var parent = this;
  
        var container = document.getElementById(container_id);
        container.innerHTML = '';
  
        var loader_container = document.createElement('div');
        loader_container.setAttribute('class', 'loader_container');
  
        var loader = document.createElement('div');
        loader.setAttribute('class', 'loader');
  
        loader_container.append(loader);
        container.append(loader_container);
  
      }

      // create_chat() creates the chat container and stuff
      create_chat(){
        // Again! You need to have (parent = this)
        var parent = this;
        // GET THAT CHATROOM HEADER OUTTA HERE
        var title_container = document.getElementById('title_container');
        var title = document.getElementById('title');
        title_container.classList.add('chat_title_container');
        // Make the title smaller by making it 'chat_title'
        title.classList.add('chat_title');
  
        var chat_container = document.createElement('div');
        chat_container.setAttribute('id', 'chat_container');
  
        var chat_inner_container = document.createElement('div');
        chat_inner_container.setAttribute('id', 'chat_inner_container');
  
        var chat_content_container = document.createElement('div');
        chat_content_container.setAttribute('id', 'chat_content_container');
  
        var chat_input_container = document.createElement('div');
        chat_input_container.setAttribute('id', 'chat_input_container');
  
        var chat_input_send = document.createElement('button');
        chat_input_send.setAttribute('id', 'chat_input_send');
        chat_input_send.setAttribute('disabled', true);
        chat_input_send.innerHTML = `<i class="far fa-paper-plane"></i>`;
  
        var chat_input = document.createElement('input');
        chat_input.setAttribute('id', 'chat_input');
        // Only a max message length of 1000
        chat_input.setAttribute('maxlength', 1000);
        // Get the name of the user
        chat_input.placeholder = `${parent.get_name()}. Say something...`;
        chat_input.onkeyup  = function(){
          if(chat_input.value.length > 0){
            chat_input_send.removeAttribute('disabled');
            chat_input_send.classList.add('enabled');
            chat_input_send.onclick = function(){
              chat_input_send.setAttribute('disabled', true);
              chat_input_send.classList.remove('enabled');
              if(chat_input.value.length <= 0){
                return;
              }
              // Enable the loading circle in the 'chat_content_container'
              parent.create_load('chat_content_container');
              // Send the message. Pass in the chat_input.value
              parent.send_message(chat_input.value);
              // Clear the chat input box
              chat_input.value = '';
              // Focus on the input just after
              chat_input.focus();
            };
          }else{
            chat_input_send.classList.remove('enabled');
          }
        };
  
        var chat_logout_container = document.createElement('div');
        chat_logout_container.setAttribute('id', 'chat_logout_container');
  
        var chat_logout = document.createElement('button');
        chat_logout.setAttribute('id', 'chat_logout');
        chat_logout.textContent = `${parent.get_name()} • logout`;
        // "Logout" is really just deleting the name from the localStorage
        chat_logout.onclick = function(){
        
          //Remove User from users list if logged out  
          parent.removeUserFromRoom(parent.get_name());

          parent.deleteRoom();

          localStorage.clear();
          // Go back to home page
          parent.home();
        };
  
        chat_logout_container.append(chat_logout);
        chat_input_container.append(chat_input, chat_input_send);
        chat_inner_container.append(chat_content_container, chat_input_container, chat_logout_container);
        chat_container.append(chat_inner_container);
        document.body.append(chat_container);
        // After creating the chat. We immediatly create a loading circle in the 'chat_content_container'
        parent.create_load('chat_content_container');
        // then we "refresh" and get the chat data from Firebase
        parent.refresh_chat();
      }
     
    deleteRoom() {
        var parent = this;
        var roomRef = firebase.database().ref(parent.get_roomId());
    
        roomRef.once('value').then(function(snapshot) {
            var roomData = snapshot.val();
            if (roomData && roomData.users === undefined) {
                roomRef.remove()
                    .then(function() {
                        console.log('Room deleted successfully.');
                    })
                    .catch(function(error) {
                        console.error('Error deleting room:', error);
                    });
            } else {
                console.log('Room not empty or does not exist.');
            }
        }).catch(function(error) {
            console.error('Error retrieving room data:', error);
        });
    }

      // Save name to local storage
      save_name(name){
        localStorage.setItem('name', name);
      }

      // Save room Id local storage
      save_roomId(roomId){
        localStorage.setItem('roomId',roomId);
      }

    // Add user to db
    addUserToRoom() {
        var parent = this;
        var usersRef = firebase.database().ref(parent.get_roomId() + '/users');
    
        usersRef.once('value').then(function(snapshot) {
            var name = parent.get_name();
            var users = snapshot.val() || [];
            if (!users.includes(name)) {
                users.push(name);
                usersRef.set(users)
                    .then(function() {
                        console.log('User added successfully.');
                    })
                    .catch(function(error) {
                        console.error('Error adding user:', error);
                    });
            } else {
                displayWarningMessage('User Already exists', 'join_input_container');
            }
        }).catch(function(error) {
            console.error('Error retrieving users:', error);
        });
    }

    // Remove user from room
    removeUserFromRoom(user) {
        var parent = this;
        var usersRef = firebase.database().ref(parent.get_roomId() + '/users');
    
        usersRef.once('value').then(function(snapshot) {
            var users = snapshot.val() || [];
            var userIndex = users.indexOf(user);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
                usersRef.set(users)
                    .then(function() {
                        console.log('User removed successfully.');
                    })
                    .catch(function(error) {
                        console.error('Error removing user:', error);
                    });
            } else {
                console.log('User not found in the list.');
            }
        }).catch(function(error) {
            console.error('Error retrieving users:', error);
        });
    }

      // Sends message/saves the message to firebase database
    send_message(message){
    var parent = this;
    if(parent.get_name() === null && message === null){
        return;
    }
    // Get the firebase database value
    db.ref(parent.get_roomId()+ '/messages/').once('value', function(message_object) {
        var index = parseFloat(message_object.numChildren()) + 1;
        db.ref(parent.get_roomId() + '/messages/' + `message_${index}`).set({
        name: parent.get_name(),
        message: message,
        index: index
        })
        .then(function(){
        parent.refresh_chat();
        });
    });
    }

    // Get the name from localstorage
    get_name(){
        if(localStorage.getItem('name') !== null){
            return localStorage.getItem('name');
        }else{
            this.home();
            return null;
        }
    }

    // Get the room Id from localstorage
    get_roomId(){
        if(localStorage.getItem('roomId') !== null){
            return localStorage.getItem('roomId');
            }else{
            this.home();
            return null;
        }
    }

    // Refresh chat gets the message/chat data from firebase
    refresh_chat(){
        var parent = this;
        var chat_content_container = document.getElementById('chat_content_container');
  
        // Get the chats from firebase
        db.ref(parent.get_roomId()+'/messages').on('value', function(messages_object) {
          // When we get the data clear chat_content_container
          chat_content_container.innerHTML = '';
          // if there are no messages in the chat. Retrun . Don't load anything
          if(messages_object.numChildren() === 0){
            return;
          }
  
          // convert the message object values to an array.
          var messages = Object.values(messages_object.val());
          var guide = []; // this will be our guide to organizing the messages
          var unordered = [];// unordered messages
          var ordered = []; // we're going to order these messages
  
          for (var i, i = 0; i < messages.length; i++) {
            // The guide is simply an array from 0 to the messages.length
            guide.push(i+1);
            // unordered is the [message, index_of_the_message]
            unordered.push([messages[i], messages[i].index]);
          }
  
          guide.forEach(function(key) {
            var found = false;
            unordered = unordered.filter(function(item) {
              if(!found && item[1] === key) {
                // Now push the ordered messages to ordered array
                ordered.push(item[0]);
                found = true;
                return false;
              }else{
                return true;
              }
            });
          });
  
          // Now we're done. Simply display the ordered messages
          ordered.forEach(function(data) {
            var name = data.name;
            var message = data.message;
  
            var message_container = document.createElement('div');
            message_container.setAttribute('class', 'message_container');
  
            var message_inner_container = document.createElement('div');
            message_inner_container.setAttribute('class', 'message_inner_container');
  
            var message_user_container = document.createElement('div');
            message_user_container.setAttribute('class', 'message_user_container');
  
            var message_user = document.createElement('p');
            message_user.setAttribute('class', 'message_user');
            message_user.textContent = `${name}`;
  
            var message_content_container = document.createElement('div');
            message_content_container.setAttribute('class', 'message_content_container');
  
            var message_content = document.createElement('p');
            message_content.setAttribute('class', 'message_content');
            message_content.textContent = `${message}`;
  
            message_user_container.append(message_user);
            message_content_container.append(message_content);
            message_inner_container.append(message_user_container, message_content_container);
            message_container.append(message_inner_container);
  
            chat_content_container.append(message_container);
          });
          // Go to the recent message at the bottom of the container
          chat_content_container.scrollTop = chat_content_container.scrollHeight;
      });
      }
    }
    // So we've "built" our app. Let's make it work!!
    var app = new CHATROOM();
    // If we have a name stored in localStorage.
    // Then use that name. Otherwise , if not.
    // Go to home.
    if(app.get_name() !== null){
      app.chat();
    }
  };
