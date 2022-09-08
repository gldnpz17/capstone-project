import React from "react";
import "../styles/Authentication.css"

function Authentication() {
    return(
        <div className="cover-auth">
            <h1>Security Code</h1>
            <p>Enter security code from the authentication system</p>
            <input type="text" placeholder="6-digit Authentication Code"/>

            <div className="auth-btn">
                Submit
            </div>
        </div>
    );
}

export default Authentication;