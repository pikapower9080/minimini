import type { MiniCrossword } from "@/lib/types";
import { pb } from "@/main";
import { useEffect, useState, type SetStateAction } from "react";
import { Box, Card, Center, Col, Grid, Heading, HStack, Row, VStack } from "rsuite";

function ShapePreview({ svg, setShape }: { svg: string; setShape: SetStateAction<MiniCrossword> }) {
  return (
    <Card
      padding={5}
      width={130}
      height={130}
      onClick={() => {
        setShape(svg);
      }}
    >
      <Box className="shape-preview" width={"100%"} dangerouslySetInnerHTML={{ __html: svg }}></Box>
    </Card>
  );
}

export default function Shapes({ setShape }: { setShape: SetStateAction<MiniCrossword> }) {
  const [shapes, setShapes] = useState<string[]>([]);

  useEffect(() => {
    pb.collection("shapes")
      .getFullList({ sort: "+sort_order" })
      .then((records) => {
        const svgs = records.map((record) => record.data.body[0].board as string);
        setShapes(svgs);
        console.log(svgs);
      });
  }, []);

  return (
    <>
      <VStack spacing={10} width={"100%"}>
        <Heading level={2}>Choose a Shape</Heading>
        <Grid>
          <Row width={"100%"}>
            {shapes.map((svg, index) => (
              <ShapePreview key={index} svg={svg} setShape={setShape} />
            ))}
          </Row>
        </Grid>
      </VStack>
    </>
  );
}
