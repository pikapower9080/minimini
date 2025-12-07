import { Badge, Card, CardGroup, Heading, HStack, Image, Text } from "rsuite";
import "./css/Index.css";
import { Link } from "react-router";

export default function Index() {
  return (
    <>
      <div className="title-container">
        <Heading level={1}>Glyph</Heading>
        <Heading level={3}>Daily word games</Heading>
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
    </>
  );
}
