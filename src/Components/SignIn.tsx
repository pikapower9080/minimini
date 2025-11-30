import { useContext, useRef, useState } from "react";
import { Modal } from "rsuite";
import { pb } from "../main";
import { GlobalState } from "../lib/GlobalState";
import { Button, ButtonGroup, Form, Heading, VStack, PasswordInput, Text } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface SignInProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SignIn({ open, setOpen }: SignInProps) {
  const usernameRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);

  const [loading, setIsLoading] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState("");
  const [passwordValidation, setPasswordValidation] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useContext(GlobalState);

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

  async function onSubmit(input: any, isSignUp: boolean = false) {
    console.log(input);
    if (loading || !input) return;
    const username = input.username;
    const password = input.password;
    if (!username || !password) return;
    if (username.length < 3) {
      setUsernameValidation("Username must be between 3 and 16 characters");
    } else if (!/^[a-zA-Z0-9\-_.]{3,16}$/.test(username)) {
      setUsernameValidation("Username can only contain letters, numbers, hyphens, underscores, and periods");
    } else {
      setUsernameValidation("");
    }
    if (password.length < 6) {
      setPasswordValidation("Password must be between 6 and 71 characters");
    } else {
      setPasswordValidation("");
    }
    setIsLoading(true);
    const users = pb.collection("users");

    if (isSignUp) {
      const data = {
        username,
        friends: [],
        password,
        passwordConfirm: password
      };

      try {
        await users.create(data);
      } catch (err: any) {
        handleError(err);
        return;
      }
    }

    users
      .authWithPassword(username, password)
      .then(() => {
        setIsLoading(false);
        if (pb.authStore.isValid) {
          setError("");
          setUser(pb.authStore.record);
        }
        location.reload();
      })
      .catch((err) => {
        handleError(err);
      });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      centered
      overflow={false}
      size="fit-content"
    >
      <VStack spacing={5} className="modal-title">
        <Heading level={2}>Sign In</Heading>
        <Text>
          Compete with friends and track
          <br />
          your progress
        </Text>
      </VStack>
      <Form
        onSubmit={(e) => {
          onSubmit(e);
        }}
        noValidate
      >
        <Form.Group controlId="username">
          <Form.Control
            ref={usernameRef}
            name="username"
            placeholder="Username"
            required
            maxLength={16}
            pattern="^[a-zA-Z0-9\-_.]{3,16}$"
            onChange={(e) => {
              usernameRef.current = e;
            }}
          ></Form.Control>
        </Form.Group>
        <Text style={{ color: "red", fontSize: "0.8em" }}>{usernameValidation}</Text>
        <Form.Group controlId="password">
          <Form.Control
            accepter={PasswordInput}
            name="password"
            placeholder="Password"
            required
            maxLength={71}
            pattern="^(?=.*\S).{6,71}$"
            renderVisibilityIcon={(visible) =>
              visible ? <FontAwesomeIcon className="no-space" icon={faEyeSlash} /> : <FontAwesomeIcon className="no-space" icon={faEye} />
            }
            onChange={(e) => {
              passwordRef.current = e;
            }}
          ></Form.Control>
        </Form.Group>
        <Text style={{ color: "red", fontSize: "0.8em" }}>{passwordValidation}</Text>
        <Text style={{ color: "red", fontSize: "0.8em" }}>{error}</Text>
        <ButtonGroup vertical style={{ marginTop: 5 }}>
          <Button appearance="primary" type="submit" loading={loading} disabled={loading}>
            Sign In
          </Button>
          <Button
            onClick={() => {
              onSubmit(
                {
                  username: usernameRef.current,
                  password: passwordRef.current
                },
                true
              );
            }}
            disabled={loading}
          >
            Sign Up
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
