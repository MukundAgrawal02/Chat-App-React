// import "./App.css";
// import {
//   GoogleAuthProvider,
//   onAuthStateChanged,
//   signInWithPopup,
// } from "firebase/auth";
// import {
//   doc,
//   setDoc,
//   getFirestore,
//   getDoc,
//   onSnapshot,
//   collection,
//   addDoc,
//   orderBy,
//   query,
//   serverTimestamp,
// } from "firebase/firestore";
// import { auth, app } from "./firebase";
// import { useEffect, useState } from "react";
// const db = getFirestore(app);
// function App() {
//   const [user, setUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   useEffect(() => {
//     const q = query(collection(db, "messages"), orderBy("timestamp"));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       setMessages(
//         snapshot.docs.map((doc) => ({
//           id: doc.id,
//           data: doc.data(),
//         }))
//         );
//     });
//     return unsubscribe
//   }, []);

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//       } else {
//         setUser(null);
//       }
//     });
//   }, []);

//   const sendMessage = async () => {
//     await addDoc(collection(db, "messages"), {
//       uid: user.uid,
//       photoURL: user.photoURL,
//       displayName: user.displayName,
//       text: newMessage,
//       timestamp: serverTimestamp()
//     });
//     setNewMessage("")
//   }

//   const handleGoogleLogin = async () => {
//     const porvider = new GoogleAuthProvider();
//     try {
//       const result = await signInWithPopup(auth, porvider);
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   return (
//     <div className="App">
//       {user ? (
//         <>
//           <div>Logged in as {user.displayName}</div>
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             />
//           <button onClick={sendMessage}>Send Message</button>
//           <button onClick={() => auth.signOut()}>Logout</button>
//           {messages.map((msg) => (
//             <div
//             className={`messages ${
//               msg.data.uid === user.uid ? "current" : "other"
//             }`}
//             key={msg.id}
//             >
//               <img src={msg.data.photoURL} alt="user-photo" />
//               {msg.data.text}
//             </div>
//           ))}
//         </>
//       ) : (
//         <button onClick={handleGoogleLogin}>Login</button>
//         )}
//     </div>
//   );
// }

// export default App;

import { useState, useEffect } from "react";
import { auth, app } from "./firebase";
import "./App.css";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  onSnapshot,
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
// import { auth, app } from '../firebase'

const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
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

  const sendMessage = async () => {
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
  return (
    <div className="flex justify-center bg-gray-800 py-10 min-h-screen">
      {user ? (
        <div>
          <div> Logged in as {user.displayName}</div>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className=" bg-white rounded-[10px] hover:bg-blue-400 p-3"
            onClick={sendMessage}
          >
            Send Message
          </button>
          <button
            className="mb-8 bg-white rounded-[10px] p-3"
            onClick={() => auth.signOut()}
          >
            Logout
          </button>

          <div className="flex flex-col gap-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message flex ${
                  msg.data.uid === user.uid ? "justify-end" : "justify-start  "
                }`}
              >
                <div
                  className={`message flex flex-row p-3 gap-3 rounded-[20px] items-center ${
                    msg.data.uid === user.uid
                      ? " text-white bg-blue-500"
                      : " bg-white "
                  }`}
                >
                  <img
                    className="w-10 h-10 rounded-full"
                    src={msg.data.photoURL}
                  />
                  {msg.data.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={handleGoogleLogin}>Login with Google</button>
      )}
    </div>
  );
}

export default App;
