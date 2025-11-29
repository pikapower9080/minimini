import { useEffect, useState } from "react";
import { Loader, Rate, Text } from "rsuite";
import { pb } from "../main";
import localforage from "localforage";
import posthog from "posthog-js";

export default function Rating({ id }: { id: number }) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(0);

  const descriptors = ["Rate this puzzle's difficulty", "Very Easy", "Easy", "Medium", "Hard", "Very Hard"];

  async function fetchRating() {
    const averageRatings = pb.collection("average_ratings");
    const ratingData = await averageRatings.getFirstListItem(`puzzle_id='${id}'`);
    if (ratingData && ratingData.rating && ratingData.count) {
      setAverage(ratingData.rating);
      setCount(ratingData.count);
    }
  }

  function rate(e: number) {
    setLoading(true);
    const formData = new FormData();
    formData.set("puzzle_id", id.toString());
    formData.set("rating", e.toString());
    pb.collection("ratings")
      .create(formData)
      .finally(() => {
        setLoading(false);
        setVoted(true);
        localforage.setItem(`rating-${id}`, e);
        fetchRating();
      });
    posthog.capture("difficulty_rating", { puzzle_id: id, rating: e });
  }

  useEffect(() => {
    localforage.getItem(`rating-${id}`).then((value) => {
      if (value) {
        setVoted(true);
        fetchRating();
      }
    });
  }, []);

  if (voted) {
    return (
      <div className="rating-container">
        <Text>
          Today's Difficulty: <strong>{average.toFixed(1)}/5</strong> ({count} {count === 1 ? "vote" : "votes"})
        </Text>
        <Rate value={average} readOnly color="#FF9800" size="sm" />
      </div>
    );
  } else {
    return (
      <div className="rating-container">
        <Rate
          color="#FF9800"
          size="sm"
          onChange={rate}
          onChangeActive={setHovered}
          onTouchEndCapture={() => {
            rate(hovered);
          }}
        />
        <Text>{descriptors[hovered]}</Text>
        {loading && <Loader backdrop />}
      </div>
    );
  }
}
