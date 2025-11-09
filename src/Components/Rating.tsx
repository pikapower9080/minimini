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

  function fetchRating() {
    fetch(`${import.meta.env.VITE_POCKETBASE_URL}/ratings/${id}`).then((res) => {
      res.json().then((ratingData) => {
        if (ratingData && ratingData.average && ratingData.count) {
          setAverage(ratingData.average);
          setCount(ratingData.count);
        }
      });
    });
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
        <Rate value={Math.round(average * 2) / 2} readOnly allowHalf color="yellow" size="sm" />
      </div>
    );
  } else {
    return (
      <div className="rating-container">
        <Rate
          color="yellow"
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
