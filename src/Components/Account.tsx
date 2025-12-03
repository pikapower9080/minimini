import { useContext, useMemo, useState } from "react";
import { Form, Modal } from "rsuite";
import { pb } from "../main";
import { Avatar, Button, ButtonGroup, Heading, HStack, Text, useDialog, VStack } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { GlobalState } from "../lib/GlobalState";
import type { RecordAuthResponse } from "pocketbase";
import posthog from "posthog-js";
import { getDefaultAvatar } from "../lib/avatars";

const EditUsernameDialog = ({ payload, onClose }: { payload: string; onClose: (newUser: RecordAuthResponse | null) => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newUsername, setNewUsername] = useState(payload || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernamePattern = /^[a-zA-Z0-9\-_.]{3,16}$/;

  function handleClose(returnValue: RecordAuthResponse | null) {
    setIsOpen(false);
    setTimeout(() => {
      onClose(returnValue);
    }, 300);
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleClose(null);
      }}
      size="xs"
    >
      <Modal.Title>Change Username</Modal.Title>
      <Form
        onSubmit={(input) => {
          if (loading) return;
          if (!pb.authStore.record) return;
          if (!usernamePattern.test(newUsername)) {
            setError("Username can only contain letters, numbers, hyphens, underscores, and periods");
            return;
          } else {
            setError(null);
            const record = new FormData();
            record.set("username", newUsername);
            pb.collection("users")
              .update(pb.authStore.record.id, record)
              .then(() => {
                pb.collection("users")
                  .authRefresh()
                  .then((newUser) => {
                    setLoading(false);
                    handleClose(newUser);
                  })
                  .catch((err) => {
                    setLoading(false);
                    setError(err.message);
                  });
              })
              .catch((err) => {
                setLoading(false);
                if (err.message.includes("Failed to update record.")) {
                  setError("Username already taken.");
                } else {
                  setError(err.message);
                }
              });
            setLoading(true);
          }
        }}
      >
        <Modal.Body>
          <Form.Group controlId="username">
            <Form.Label>New Username</Form.Label>
            <Form.Control
              name="username"
              value={newUsername}
              onChange={(value) => {
                setNewUsername(value);
              }}
              placeholder="Enter new username"
              maxLength={16}
              required
            />
            {error && <Form.Text>{error}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              handleClose(null);
            }}
          >
            Cancel
          </Button>
          <Button appearance="primary" type="submit" loading={loading}>
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default function Account({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const dialog = useDialog();

  const { user, setUser } = useContext(GlobalState);

  const defaultAvatar = useMemo(() => getDefaultAvatar(user.username), [user]);

  if (user) {
    return (
      <Modal
        centered
        size="fit-content"
        overflow={false}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VStack spacing={10}>
            <HStack spacing={10} border={"1px solid var(--rs-border-primary)"} padding={10} borderRadius={"var(--rs-radius-sm)"}>
              <Avatar src={defaultAvatar} />
              <VStack spacing={0}>
                <Heading level={3} textAlign={"left"}>
                  {user.username}
                </Heading>
                <Text textAlign={"left"}>Solving since {new Date(user.created).toLocaleDateString("en-US")}</Text>
              </VStack>
            </HStack>
            <ButtonGroup vertical block>
              <Button
                startIcon={<FontAwesomeIcon icon={faPencil} />}
                onClick={async () => {
                  const newUser: RecordAuthResponse | null = await dialog.open(EditUsernameDialog, user.username);
                  if (newUser) {
                    posthog.capture("change_username", {
                      user_id: user.id,
                      old_username: user.username,
                      new_username: newUser.record.username
                    });
                    setUser(newUser.record);
                  }
                }}
              >
                Change Username
              </Button>
              <Button
                startIcon={<FontAwesomeIcon icon={faTrash} />}
                onClick={async () => {
                  const response = await dialog.confirm(
                    "Are you sure you want to delete your account? All progress will be permanently erased."
                  );
                  if (response) {
                    posthog.capture("delete_account", { user_id: user.id, username: user.username });
                    await pb.collection("users").delete(user.id);
                    pb.authStore.clear();
                    setUser(null);
                    setOpen(false);
                  }
                }}
              >
                Delete Account
              </Button>
            </ButtonGroup>
            <Button
              block
              startIcon={<FontAwesomeIcon icon={faDoorOpen} />}
              onClick={() => {
                pb.authStore.clear();
                setUser(null);
                setOpen(false);
              }}
            >
              Sign Out
            </Button>
          </VStack>
        </Modal.Body>
      </Modal>
    );
  } else {
    return <></>;
  }
}
