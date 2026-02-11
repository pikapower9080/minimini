import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { Button, Heading, HStack, VStack } from "rsuite";

export default function Custom() {
  useEffect(() => {
    document.title = "Custom Puzzles - Glyph";
    document.getElementById("favicon-svg")?.setAttribute("href", `/icons/custom/favicon.svg`);
  }, []);

  return (
    <main className="custom">
      <VStack spacing={15}>
        <Heading level={2}>Custom Puzzles</Heading>
        <HStack justifyContent={"center"} width={"100%"}>
          <Link to="/custom/create">
            <Button startIcon={<PlusIcon />}>Create</Button>
          </Link>
        </HStack>
      </VStack>
    </main>
  );
}
