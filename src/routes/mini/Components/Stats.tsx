import { formatDuration } from "@/lib/formatting";
import { pb } from "@/main";
import { ChartNoAxesColumnIcon, ClockIcon, HashIcon, RabbitIcon, TurtleIcon } from "lucide-react";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { HStack, Loader, Modal, ProgressCircle, Stat, StatGroup, useBreakpointValue, VStack } from "rsuite";

interface StatsRecord extends RecordModel {
  id: string;
  lowest_time: number;
  lowest_time_id: number;
  highest_time: number;
  highest_time_id: number;
  num_completed: number;
  average_time: number;
  num_cheated: number;
  num_desktop: number;
}

const emptyStats: StatsRecord = {
  id: "",
  lowest_time: 0,
  lowest_time_id: 0,
  highest_time: 0,
  highest_time_id: 0,
  num_completed: 0,
  average_time: 0,
  num_cheated: 0,
  num_desktop: 0,
  collectionId: "",
  collectionName: ""
};

export function Stats({ open, setOpen, type }: { open: boolean; setOpen: (open: boolean) => void; type: "mini" | "crossword" }) {
  const [data, setData] = useState<StatsRecord>(emptyStats);
  const [loaded, setLoaded] = useState(false);
  const [fastestTimeDate, setFastestTimeDate] = useState<string | null>(null);
  const [slowestTimeDate, setSlowestTimeDate] = useState<string | null>(null);

  const columns = useBreakpointValue({
    xs: 1,
    sm: 2
  });

  data.lowest_time ??= 0;

  const totalDesktop = data.num_desktop;
  const totalMobile = data.num_completed - data.num_desktop;

  let platformPercent = 0;
  if (totalDesktop > totalMobile) {
    platformPercent = Math.floor((data.num_desktop / Math.max(data.num_completed, 1)) * 100);
  } else {
    platformPercent = Math.floor((totalMobile / Math.max(data.num_completed, 1)) * 100);
  }

  const cheatedPercent = Math.floor((data.num_cheated / Math.max(data.num_completed, 1)) * 100);

  useEffect(() => {
    if (!loaded && open) {
      async function fetchData() {
        if (!pb.authStore?.record) {
          setData(emptyStats);
          setOpen(false);
          return;
        }
        const response = (await pb
          .collection(`user_${type === "mini" ? "mini" : "daily"}_stats`)
          .getOne(pb.authStore.record.id)) as StatsRecord;
        const slowestTimeDoc = await pb
          .collection("archive")
          .getFirstListItem(`mini_id=${response.highest_time_id}`, { fields: "publication_date" });
        const fastestTimeDoc = await pb
          .collection("archive")
          .getFirstListItem(`mini_id=${response.lowest_time_id}`, { fields: "publication_date" });
        setFastestTimeDate(new Date(fastestTimeDoc.publication_date).toLocaleDateString());
        setSlowestTimeDate(new Date(slowestTimeDoc.publication_date).toLocaleDateString());
        setData(response);
        setLoaded(true);
      }
      fetchData();
    }
  }, [open, loaded]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} centered size={"sm"}>
      <Modal.Header closeButton>
        <Modal.Title>
          <ChartNoAxesColumnIcon /> Stats
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px" }}>
        <StatGroup columns={columns}>
          <Stat bordered>
            <Stat.Label>
              <HashIcon /> Completed
            </Stat.Label>
            <Stat.Value>{data.num_completed}</Stat.Value>
          </Stat>
          <Stat bordered>
            <Stat.Label>
              <ClockIcon /> Average Time
            </Stat.Label>
            <Stat.Value>{formatDuration(Math.round(data.average_time))}</Stat.Value>
          </Stat>
          <Stat bordered>
            <Stat.Label>
              <RabbitIcon /> Fastest Time
            </Stat.Label>
            <Stat.Value>{formatDuration(Math.round(data.lowest_time))}</Stat.Value>
            {fastestTimeDate && <Stat.HelpText>{fastestTimeDate}</Stat.HelpText>}
          </Stat>
          <Stat bordered>
            <Stat.Label>
              <TurtleIcon /> Slowest Time
            </Stat.Label>
            <Stat.Value>{formatDuration(Math.round(data.highest_time))}</Stat.Value>
            {slowestTimeDate && <Stat.HelpText>{slowestTimeDate}</Stat.HelpText>}
          </Stat>
          <Stat bordered>
            <HStack spacing={16}>
              <ProgressCircle percent={cheatedPercent} w={50} strokeWidth={10} trailWidth={10} />
              <VStack>
                <Stat.Label>Cheated Puzzles</Stat.Label>
                <Stat.Value>{data.num_cheated}</Stat.Value>
              </VStack>
            </HStack>
          </Stat>
          <Stat bordered>
            <HStack spacing={16}>
              <ProgressCircle percent={platformPercent} w={50} strokeWidth={10} trailWidth={10} />
              <VStack>
                <Stat.Label>Most Used Platform</Stat.Label>
                <Stat.Value>{totalDesktop == totalMobile ? "Equal" : totalDesktop > totalMobile ? `Desktop` : `Mobile`}</Stat.Value>
              </VStack>
            </HStack>
          </Stat>
        </StatGroup>
      </Modal.Body>
      {!loaded && <Loader center backdrop />}
    </Modal>
  );
}
