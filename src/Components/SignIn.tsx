import { useContext, useRef, useState } from "react";
import Modal from "react-responsive-modal";
import { pb } from "../main";
import { GlobalState } from "../lib/GlobalState";

interface SignInProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SignIn({ open, setOpen }: SignInProps) {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState("");
  const [passwordValidation, setPasswordValidation] = useState("");
  const [error, setError] = useState("");

  const { user, setUser } = useContext(GlobalState);

  function handleError(err: any) {
    setIsLoading(false);
    if (err.message.includes("autocancelled")) {
      setError("Something went wrong.");
    } else if (err.message.includes("Failed to authenticate.")) {
      setError("Incorrect username or password.");
    } else if (err.message.includes("Failed to create record.")) {
      setError("Username already taken.");
    } else {
      setError(err.message);
    }
    return;
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      showCloseIcon={false}
      center
    >
      <h2 style={{ marginBottom: 0 }}>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <p>Connect with friends and sync your progress</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const username = usernameRef.current as HTMLInputElement;
          const password = passwordRef.current as HTMLInputElement;
          if (!username || !password) return;
          if (!username.checkValidity()) {
            if (username.value.length < 3) {
              setUsernameValidation("Username must be between 3 and 16 characters");
            } else if (!/^[a-zA-Z0-9\-_.]{3,16}$/.test(username.value)) {
              setUsernameValidation("Username can only contain letters, numbers, hyphens, underscores, and periods");
            }
            return;
          } else {
            setUsernameValidation("");
          }
          if (!password.checkValidity()) {
            if (password.value.length < 6) {
              setPasswordValidation("Password must be between 6 and 71 characters");
            }
            return;
          } else {
            setPasswordValidation("");
          }
          setIsLoading(true);
          const users = pb.collection("users");

          if (isSignUp) {
            const data = {
              username: username.value,
              friends: [],
              password: password.value,
              passwordConfirm: password.value
            };

            try {
              await users.create(data);
            } catch (err: any) {
              handleError(err);
              return;
            }
          }

          users
            .authWithPassword(username.value, password.value)
            .then(() => {
              setIsLoading(false);
              if (pb.authStore.isValid) {
                setOpen(false);
                setError("");
                setUser(pb.authStore.record);
              }
              location.reload();
            })
            .catch((err) => {
              handleError(err);
            });
        }}
        noValidate
      >
        <input
          type="text"
          placeholder="Username"
          name="username"
          required
          maxLength={16}
          ref={usernameRef}
          pattern="^[a-zA-Z0-9\-_.]{3,16}$"
          className="top-input"
        />
        <label style={{ color: "red", fontSize: "0.8em" }}>{usernameValidation}</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          required
          maxLength={71}
          ref={passwordRef}
          pattern="^(?=.*\S).{6,71}$"
          className="bottom-input"
        />
        <label style={{ color: "red", fontSize: "0.8em" }}>{passwordValidation}</label>
        <label style={{ color: "red", fontSize: "0.8em" }}>{error}</label>
        <button type="submit" style={{ marginTop: "16px" }}>
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
        <a
          onClick={() => {
            setIsSignUp(!isSignUp);
          }}
          className="action-link"
          style={{ marginTop: 5 }}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </a>
      </form>
    </Modal>
  );
}
