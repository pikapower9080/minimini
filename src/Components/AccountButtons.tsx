import { CircleUserRoundIcon, LogInIcon, UsersIcon } from "lucide-react";
import { useContext } from "react";
import { Button, ButtonGroup } from "rsuite";
import { GlobalState } from "../lib/GlobalState";

export default function AccountButtons({
  setModalState,
  appearance,
  justified
}: {
  setModalState: any;
  appearance: "default" | "primary" | "subtle" | "ghost" | "link";
  justified: boolean;
}) {
  const { user } = useContext(GlobalState);

  return (
    <ButtonGroup className="account-buttons" justified={justified}>
      {user ? (
        <>
          {" "}
          <Button
            appearance={appearance}
            onClick={() => {
              setModalState("account");
            }}
            style={{
              flexGrow: 1
            }}
            startIcon={<CircleUserRoundIcon />}
          >
            Account
          </Button>
          <Button
            appearance={appearance}
            onClick={() => {
              setModalState("friends");
            }}
            style={{ flexGrow: 1 }}
            startIcon={<UsersIcon />}
          >
            Friends
          </Button>
        </>
      ) : (
        <Button
          appearance={appearance}
          onClick={() => {
            setModalState("sign-in");
          }}
          startIcon={<LogInIcon />}
        >
          Sign in
        </Button>
      )}
    </ButtonGroup>
  );
}
