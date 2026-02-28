import { Box, Card, HStack, Text, VStack } from "rsuite";
import type { ReactElement } from "rsuite/esm/internals/types";

interface NudgeProps {
  title: string;
  body: string;
  color: string;
  icon?: ReactElement;
  cta?: ReactElement;
  className?: string;
  width?: string | number;
}

export default function Nudge({ title, body, color, icon, cta, className, width }: NudgeProps) {
  return (
    <Card
      className={`nudge${className ? ` ${className}` : ""}`}
      bordered
      style={{ backgroundColor: `color-mix(in srgb, ${color} 30%, var(--rs-card-bg) 70%)`, width }}
    >
      <Card.Body>
        <VStack spacing={5}>
          <Text weight="bold">
            {icon && icon} {title}
          </Text>
          <Text>{body}</Text>
          {cta && <Box className="nudge-cta">{cta}</Box>}
        </VStack>
      </Card.Body>
    </Card>
  );
}
