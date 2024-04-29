import { MdDeleteForever } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { auth, app } from "./firebase";
import "./App.css";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut // Add signOut import
} from "firebase/auth";
import {
  getFirestore,
  onSnapshot,
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
      scrollToBottom();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") {
      return;
    }

    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      sendMessage();
    }
  };

  const deleteMessage = async (messageId) => {
    await deleteDoc(doc(db, "messages", messageId));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-800 py-10 min-h-screen">
      <div className="w-full max-w-xl">
        {user ? (
          <>
            <div className="d-flex flex-column align-items-center text-center">
              <div className="text-white mb-2 text-2xl font-bold">
                Logged in as <span id="username">😄{user.displayName}</span>
              </div>
              <button
                id="logoutButton"
                className="bg-white text-gray-800 px-4 py-2 rounded-lg"
                onClick={handleLogout} // Add onClick event for logout
              >
                Logout
              </button>
            </div>
            <div className="mt-3 h-96 overflow-y-auto rounded-lg border p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.data.uid === user.uid ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`flex flex-row p-3 gap-3 rounded-lg border ${
                      msg.data.uid === user.uid
                        ? "border-blue-500 text-white bg-blue-500"
                        : "border-gray-300 text-gray-800 bg-gray-300"
                    }`}
                  >
                    <img
                      className="w-10 h-10 rounded-full"
                      src={msg.data.photoURL}
                      alt="User"
                    />
                    <span>{msg.data.text}</span>
                    {msg.data.uid === user.uid && (
                      <button
                        className="ml-auto text-red-500 hover:text-red-600 focus:outline-none"
                        onClick={() => deleteMessage(msg.id)}
                      >
                        <MdDeleteForever className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center mt-2">
              <textarea
                className="form-textarea w-full rounded-lg p-2 mr-2"
                placeholder="Type message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-white text-center">
            <h2>Welcome to the Chat App</h2>
            <p>Please log in with your Google account to start chatting.</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
