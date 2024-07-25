import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
// import ChatComponent from './Mesages';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import "./App.css"
import { BiMessageRounded } from "react-icons/bi";

import CreatableSelect from 'react-select/creatable';
import { RiVoiceprintFill } from "react-icons/ri";
import axios from 'axios';


const socket = io('http://localhost:5000'); // Replace with your server URL

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userJoined, setUserJoined] = useState(false);
  const [typing, setTyping] = useState(false)
  const [typingMsg, setTypingMsg] = useState("")
  useEffect(() => {
    // Handle initial connection (optional)
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    socket.on("cast-user-joined", (mess) => {
      console.log(mess)
    })

    socket.on('get-message', (message) => {
      console.log(message)
      setMessages(message)
      // setMessages((prevMsgs)=>[...prevMsgs, message])
    }); // Send message with username

    socket.on('user-typing', (res) => {
      console.log(res)
      setTyping(true)
      setTypingMsg(res)
      // setMessages(message)
      // setMessages((prevMsgs)=>[...prevMsgs, message])
    })
    setTyping(false)
  }, []);
  console.log(messages)

  // const handleJoin = (e) => {
  //   e.preventDefault();
  //   if (Name.trim()) {
  //     socket.emit('user-joined', Name);
  //     socket.on("welcome", (res) => {
  //       console.log(res)
  //     })

  //     setUserJoined(true); // Set user joined to true after emitting the event
  //   }
  // };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", Name)
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', { Name, message }); // Send message with username
      setMessage('');
    }
  };

  const [isLogin, setIsLogin] = useState(true);

  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const loginUser = () => {
    console.log(name)
    console.log(email)
    console.log(password)
    let data = JSON.stringify({
      "name": name,
      "email": email,
      "password": password,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:5000/user/login',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.data))
        setIsLogin(false)
      })
      .catch((error) => {
        console.log(error);
      });

  }

  const [Rooms, setRooms] = useState([])

  const getRooms = () => {

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:5000/get-room',
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        console.log(response.data);
        const formatRoom = response.data.data.map((room) => ({
          ...room,
          value: room.name,
          label: room.name,
        }))
        console.log(formatRoom)
        setRooms(formatRoom)

      })
      .catch((error) => {
        console.log(error);
      });


  }

  useEffect(() => {
    getRooms()
  }, [])
  // ------------ create Room ------------
  const handleCreate = async (inputValue) => {
    try {
      console.log(inputValue)
      const userId = JSON.parse(localStorage.getItem("user"))
      console.log(userId)
      let data = JSON.stringify({
        "name": inputValue,
        "userId": userId?._id
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:5000/create-room',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          console.log(response.data)
          getRooms()
        })
        .catch((error) => {
          console.log(error);
        });

      // Update the state to include the newly created room
      // setRooms([...Rooms, { value: newRoom._id, label: newRoom.name }]);
    } catch (error) {
      console.error('Error creating new room:', error);
    }
  };



  const handleChange = (room) => {
    const userId = JSON.parse(localStorage.getItem("user"))

    let data = JSON.stringify({
      "roomId": room?._id,
      "userId": userId?._id
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://localhost:5000/join-room',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        socket.emit("join-room", { roomId: room?._id, user: userId?.name })

      })
      .catch((error) => {
        console.log(error);
      });

    // console.log(name)
    // socket.emit("user-joined", Name)
  }


  return (
    <div className='mainBox'>
      {
        isLogin ? <>
          <div className='loginBox p-3 flex flex-col items-center justify-center '>
            <div className='flex item-center justify-center  py-2'>
              <h1 className=''>
                iChat App
              </h1>
              <BiMessageRounded size={40} className='mt-3 ml-2' />
            </div>
            <div>
              <h2 className='my-4 text-2xl'>
                Login Here..
              </h2>
            </div>

            <div>
              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2 text-left">Name</label>
                <input type="text" id="name" name="name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
              </div>
              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2 text-left">Email</label>
                <input type="email" id="email" name="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div class="mb-6">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
                <input type="password" id="password" name="password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}

                />
              </div>
              <button onClick={() => loginUser()}>
                Login
              </button>
            </div>
          </div>
        </> :

          <div className="relative h-[100vh]  bg-gray-100 overflow-hidden">
            <h1 className="text-2xl font-bold mb-4">iChat App</h1>
            <CreatableSelect
              isClearable
              options={Rooms}
              onChange={handleChange}
              onCreateOption={handleCreate}
            />
            <div className="border border-blue-500 h-full  ">
              <div className='border border-red-500 relative h-[430px]'>

                <div className="overflow-y-auto  ">
                  {messages.map((msg, index) => (
                    <MessageBox
                      key={index}
                      position={msg.Name !== Name ? "left" : "right"}
                      type={"text"}
                      text={msg.message}
                    />
                  ))}
                </div>
                <div className='absolute bottom-0 '>
                  <span className='flex items-center'>
                    {typing && <>
                      <RiVoiceprintFill className='mr-1' />{typingMsg}
                    </>}
                  </span>
                </div>
              </div>

              <form onSubmit={sendMessage} className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-300">
                <input
                  type="text"
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Enter your message"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

      }
    </div>
  );
}

export default App;

