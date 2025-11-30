import { useEffect, useState } from "react";
import { Modal } from "rsuite";
import { Button, Form, HStack, VStack, List, Text, Heading, PinInput, Avatar } from "rsuite";
import { pb, pb_url } from "../main";
import type { UserRecord } from "../lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";

import "../css/Friends.css";

export default function Friends({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [friends, setFriends] = useState<UserRecord[]>([]);

  async function fetchFriends() {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) return;
    try {
      const friends: UserRecord[] = await pb.collection("users").getFullList({
        fields: "id,username,friend_code,avatar",
        sort: "username:lower",
        filter: `id != "${pb.authStore.record.id}"`
      });
      setFriends(friends);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchFriends();
  }, [open]);

  return (
    <Modal
      centered
      size="fit-content"
      overflow={false}
      open={open}
      onClose={() => {
        setOpen(false);
        setResult(null);
      }}
    >
      <VStack spacing={10}>
        <Modal.Title className="modal-title">
          <FontAwesomeIcon icon={faUsers} /> Friends
        </Modal.Title>
        <VStack spacing={friends.length > 0 ? 10 : 0}>
          <List bordered={friends.length > 0} className="friends-list" hover>
            {friends.map((friend) => {
              return (
                <List.Item key={friend.id}>
                  <HStack justifyContent="space-between" spacing={10}>
                    <Avatar
                      src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${friend.username}&backgroundColor=0a5b83&shapeColor=1c799f`}
                      minWidth={25}
                      width={25}
                      height={25}
                    />
                    <Text className="friend-list-name" title={friend.username}>
                      {friend.username}
                    </Text>
                    <Text className="friend-list-code" muted>
                      {friend.friend_code}
                    </Text>
                    <Button
                      className="friend-list-remove"
                      size="xs"
                      onClick={async () => {
                        if (!pb.authStore.isValid || !pb.authStore.record) return;
                        await pb.collection("users").update(pb.authStore.record.id, {
                          "friends-": [friend.id]
                        });
                        await fetchFriends();
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} className="no-space" />
                    </Button>
                  </HStack>
                </List.Item>
              );
            })}
          </List>
          <Form
            className="add-friend-form"
            onSubmit={async (e) => {
              if (!e || !e.code || e.code.length < 6) return;
              setLoading(true);
              try {
                if (!pb.authStore.isValid || !pb.authStore.record?.id) return;
                const response = await fetch(pb_url + "/api/friends/from_code/" + e.code, {
                  method: "GET"
                });
                const json = await response.json();
                console.log(json);
                if (json.id) {
                  if (json.id === pb.authStore.record?.id) {
                    setResult("You can't add yourself as a friend");
                    return;
                  }
                  await pb.collection("users").update(pb.authStore.record.id, {
                    "friends+": [json.id]
                  });
                  setResult(`Added ${json.username} as a friend`);
                  fetchFriends();
                } else {
                  setResult(json.error ?? "An unexpected error occurred");
                }
              } catch (err) {
                console.error(err);
                setResult("An unexpected error occurred");
              } finally {
                setLoading(false);
              }
            }}
          >
            <VStack spacing={10}>
              <Text weight="bold" className="block centered">
                Your friend code: {pb.authStore.record?.friend_code}
              </Text>
              <Form.Group controlId="code">
                <Form.Control className="friend-code-input" name="code" accepter={PinInput} length={6} size="sm" />
                {result && (
                  <Text className="block centered" style={{ marginTop: 5 }}>
                    {result}
                  </Text>
                )}
              </Form.Group>
              <Button className="auto-center" appearance="primary" type="submit" loading={loading}>
                Add Friend
              </Button>
            </VStack>
          </Form>
        </VStack>
      </VStack>
    </Modal>
  );
}
