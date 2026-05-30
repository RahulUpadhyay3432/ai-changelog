import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/HomeFeed";

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#525252",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      }
    >
      <HomeFeed />
    </Suspense>
  );
}
