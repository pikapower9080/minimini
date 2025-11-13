import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import Modal from "react-responsive-modal";
import { Button, Form, MaskedInput } from "rsuite";
import { pb, pb_url } from "../main";

export default function AddFriends({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <Modal
      center
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <div className="modal-title">
        <h2>Add Friends</h2>
      </div>
      <Form
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
        <Form.Group controlId="code">
          <Form.Control
            name="code"
            accepter={MaskedInput}
            mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
            placeholder="123456"
            keepCharPositions={true}
            guide={false}
          />
          {result && <Form.HelpText>{result}</Form.HelpText>}
        </Form.Group>
        <strong>Your friend code: {pb.authStore.record?.friend_code}</strong>
        <Button appearance="primary" type="submit" style={{ marginTop: "10px" }} loading={loading}>
          Done
        </Button>
      </Form>
    </Modal>
  );
}
