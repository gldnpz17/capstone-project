import React from "react";
import "../styles/LoginForm.css"

function LoginForm() {
    return(
        <div className="cover-login">
            <h1>Login</h1>
            <input type="text" placeholder="username"/>
            <input type="password" placeholder="password"/>

            <div className="invalid-user">
            <p>Invalid Username or Password!</p>
            </div>

            <div className="login-btn">
                Login
            </div>
        </div>
    );
}

export default LoginForm;