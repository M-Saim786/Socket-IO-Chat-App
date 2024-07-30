import axios from 'axios';
import React, { useState } from 'react'
import { BiMessageRounded } from "react-icons/bi";

function Login({ setIsLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");




    const signUpUser = () => {
        let data = JSON.stringify({
            "name": name,
            "email": email,
            "password": password,
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:5000/user/signUp',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));
                setIsLogin(false);
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data.message)
            });
    };

    const loginUser = () => {
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
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data));
                setIsLogin(false);
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data.message)

            });
    };

    const [SignUp, setSignUp] = useState(false)

    return (
        <div className='loginBox p-3 flex flex-col items-center justify-center '>
            <div className='flex item-center justify-center py-2'>
                <h1 className=''>iChat App</h1>
                <BiMessageRounded size={40} className='mt-3 ml-2' />
            </div>
            <div>
                <h2 className='my-4 text-2xl'>{SignUp ? "SignUp" : "Login"} Here..</h2>
            </div>
            <div>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 text-left">Name</label>
                    <input type="text" id="name" name="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">Email</label>
                    <input type="email" id="email" name="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
                    <input type="password" id="password" name="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <hr />
                <div className='my-4 cursor-pointer'>
                    <h2>Don't have account <span className='font-bold' onClick={() => setSignUp(!SignUp)} >Sign Up</span></h2>
                </div>

                <button onClick={() => SignUp ? signUpUser() : loginUser()} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">{SignUp ? "SignUp" : "Login"}</button>
            </div>
        </div>
    )
}

export default Login