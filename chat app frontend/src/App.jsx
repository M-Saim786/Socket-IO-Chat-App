import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageBox, SystemMessage } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import "./App.css";
import { BiMessageRounded } from "react-icons/bi";
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import Login from './Login';

const socket = io('http://localhost:5000'); // Replace with your server URL

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingMsg, setTypingMsg] = useState("");
  const [Rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const chatEndRef = useRef(null);
  const [isClearable, setIsClearable] = useState(true)
  const previousRoomsRef = useRef([]); // UseRef to track previous selected rooms

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLogin(false);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('get-message', (message) => {
      console.log(message);
      setMessages(message)
      // setMessages(prevMsgs => Array.isArray(prevMsgs) ? [...prevMsgs, message] : [message]);
    });

    socket.on('user-typing', (res) => {
      setTyping(true);
      setTypingMsg(res);
    });

    socket.on("user-joined-room", (res) => {
      console.log(res);
      setMessages(prevMsgs => Array.isArray(prevMsgs) ? [...prevMsgs, { type: 'info', message: res }] : [{ type: 'info', message: res }]);
    });

    socket.on("user-leave-room", (res) => {
      console.log(res);
      setMessages(prevMsgs => Array.isArray(prevMsgs) ? [...prevMsgs, { type: 'info', message: res }] : [{ type: 'info', message: res }]);
    });

    socket.on("user-already-in-room", (res) => {
      console.log(res);
    });

    setTyping(false);
  }, []);

  useEffect(() => {
    getRooms();
  }, [isLogin]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", userId.name);
  };

  const userId = JSON.parse(localStorage.getItem("user"));
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return; // Ensure message is not empty
    socket.emit("chat-message", { roomId: roomId, sender: userId, message: message });
    setMessage('');
  };

  const getRooms = () => {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'http://localhost:5000/get-room',
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        const formatRoom = response.data.data.map((room) => ({
          ...room,
          value: room.name,
          label: room.name,
        }));
        setRooms(formatRoom);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCreate = async (inputValue) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"));
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
          getRooms();
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error('Error creating new room:', error);
    }
  };

  const handleChange = (room) => {
    const userId = JSON.parse(localStorage.getItem("user"));
    const previousRooms = previousRoomsRef.current;
    const newRooms = room ? [room._id] : [];

    const removedRooms = previousRooms.filter(room => !newRooms.includes(room._id));
    console.log('Rooms to leave:', removedRooms);

    if (removedRooms.length > 0) {
      removedRooms.forEach(room => {
        console.log(`Leaving room: ${room}`);
        socket.emit("leave-room", { roomId: room, user: userId });
      });
    }

    const addedRooms = newRooms.filter(room => !previousRooms.some(prevRoom => prevRoom._id === room));
    if (addedRooms.length > 0) {
      addedRooms.forEach(room => {
        console.log(`Joining room: ${room}`);
        socket.emit("join-room", { roomId: room, user: userId });
      });
    }

    previousRoomsRef.current = room ? [room._id] : [];
    setRoomId(newRooms.length > 0 ? newRooms[0] : "");
  };

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLogin(true)
  }

  return (
    <div className='mainBox'>
      {isLogin ? (
        <Login setIsLogin={setIsLogin} />
      ) : (
        <div className="relative h-[100vh] bg-gray-100 overflow-hidden ">
          <div className='flex justify-between px-4 pt-2'>
            <h1 className="text-2xl font-bold mb-4">iChat App</h1>

            <div>
              <span className='bg-blue-500 text-white py-2 rounded hover:bg-blue-600 px-3 cursor:pointer' onClick={logout}>Logout</span>
            </div>

          </div>
          <CreatableSelect
            isClearable={isClearable}
            options={Rooms}
            onChange={handleChange}
            onCreateOption={handleCreate}
          />
          <div className="border border-blue-500 h-full">
            <div className='border border-red-500 relative h-[430px] overflow-y-scroll overflow-y-auto bg-gray'>
              <div className="overflow-y-auto bg-gray border border-red-400 bottom-0">
                {messages?.map((msg, index) => (
                  <React.Fragment key={index}>
                    {msg?.type && msg?.type === 'info' ? (
                      <SystemMessage text={msg.message} />
                    ) : (
                      msg && <MessageBox
                        position={msg?.sender?.name !== userId?.name ? "left" : "right"}
                        type={"text"}
                        text={msg?.message}
                        title={msg?.sender?.name !== userId?.name && msg?.sender?.name}
                      />
                    )}
                  </React.Fragment>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
            <form onSubmit={sendMessage} className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-300">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder="Enter your message"
                className="w-full p-2 border border-gray-300 rounded"
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(e) }}
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
      )}
    </div>
  );
}

export default App;
