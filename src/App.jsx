import { useState } from "react";
import validator from "validator";
import axios from "axios";
import "./css/App.css";

const server = axios.create({
  baseURL: "http://localhost:3001/",
});

const App = () => {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [message, setMessage] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setMessage("");
    if (!validator.isEmail(email)) {
      return;
    }
    setLoading(true);
    if (!otpGenerated) {
      try {
        const res = await server.post("/otp", { to: email });
        if (res.status != 200) {
          console.log("Some problem occured while sending OTP: \n", res);
          setMessage(
            "Some problem occured while sending OTP\n" + res?.data?.message
          );
        }
        if (res.status == 200) {
          setOtpGenerated(true);
        }
      } catch (error) {
        console.log(error);
        setMessage("Some problem occured while sending OTP\n" + error?.message);
      }
      setLoading(false);
      return;
    }

    try {
      // INSECURE: Getting stored OTP from server and comparing in client
      // DO NOT DO THIS IN PRODUCTION - this is for learning about security vulnerabilities
      const res = await server.post("/otp/verify", { from: email });
      if (res.status === 200 && res.data.storedOtp) {
        // Compare OTP on client side (insecure - visible in Network tab)
        console.log('Stored OTP from server:', res.data.storedOtp); // Deliberately logging for educational purposes
        if (otp === res.data.storedOtp) {
          setMessage("OTP Verified Successfully");
          setOtpGenerated(false);
        } else {
          setMessage("Invalid OTP");
        }
      } else {
        console.log("Some problem occurred while verifying OTP: \n", res);
        setMessage("Some problem occurred while verifying OTP");
      }
      setOTP("");
    } catch (error) {
      console.log(error);
      setMessage("Some problem occurred while verifying OTP\n" + error?.message);
    }
    setOTP("");
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>OTP Validation</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="inputBox">
          <p>Enter Email:</p>
          <input
            className={!validEmail ? "wrongInput" : ""}
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validator.isEmail(email)
                ? setValidEmail(true)
                : setValidEmail(false);
            }}
            required
          />
        </div>
        <div className="inputBox">
          {otpGenerated && (
            <>
              <p>Enter OTP:</p>
              <input
                type="password"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                required
              />
            </>
          )}
        </div>
        <button type="submit">{loading ? "Loading..." : "Submit"}</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default App;
