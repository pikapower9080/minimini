import { Badge, Button, Card, CardGroup, Heading, HStack, Image, Text, Center } from "rsuite";
import { Link } from "react-router";
import { useContext, useState } from "react";

import Account from "@/Components/Account";
import { GlobalState } from "@/lib/GlobalState";
import Friends from "@/Components/Friends";
import SignIn from "@/Components/SignIn";
import AccountButtons from "@/Components/AccountButtons";

export default function Index() {
  const [modalState, setModalState] = useState<"account" | "friends" | "sign-in" | null>(null);
  const { user, setUser } = useContext(GlobalState);

  return (
    <main className="index">
      <Account open={modalState === "account"} setOpen={() => setModalState(null)} />
      <Friends open={modalState === "friends"} setOpen={() => setModalState(null)} />
      <SignIn open={modalState === "sign-in"} setOpen={() => setModalState(null)} />

      <div className="title-container">
        <Heading level={1}>Glyph</Heading>
        <Heading level={3}>Daily word games</Heading>
        <Center>
          <AccountButtons setModalState={setModalState} appearance="default" justified={false} />
        </Center>
      </div>
      <CardGroup columns={2} className="game-cards" spacing={10}>
        <Link to={"/mini"}>
          <Card shaded>
            <Image src={"/icons/pwa-192x192.png"} width={"100%"} height={50} fit="contain"></Image>
            <Card.Header>
              <Text size="lg" weight="bold">
                The Mini
              </Text>
            </Card.Header>
            <Card.Body>Crack clues to cross words</Card.Body>
          </Card>
        </Link>
        <Link to={"/cascades"}>
          <Card shaded>
            <Card.Header>
              <HStack width={"100%"} justifyContent={"center"}>
                <Text size="lg" weight="bold">
                  Cascades
                </Text>
                <Badge content="New"></Badge>
              </HStack>
            </Card.Header>
            <Card.Body>Form words from falling letters</Card.Body>
          </Card>
        </Link>
      </CardGroup>
    </main>
  );
}
