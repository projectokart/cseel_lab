import React from "react";
import { C, MediaData } from "./constants";
import { ScrollSection } from "./atoms";

interface Props {
  media: MediaData;
}

const MediaSection: React.FC<Props> = ({ media }) => {
  return (
    <ScrollSection id="media" number="05" title="Video, Images & Sound" icon="🎬">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14, marginBottom: 10 }}>📹 Demo Video</div>
          {media.video_url ? (
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, height: 200 }}>
              <iframe src={media.video_url} title="Demo Video" width="100%" height="100%" style={{ border: "none" }} allowFullScreen />
            </div>
          ) : (
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.navy, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${C.teal}20`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: C.teal }}>Video coming soon</div>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: "bold", color: C.navy, fontSize: 14, marginBottom: 10 }}>🖼 Image Gallery</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {media.images.map((img, i) => (
              <div key={i} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}`, background: C.offWhite, padding: "18px 8px", textAlign: "center" }}>
                {img.url ? (
                  <img src={img.url} alt={img.caption} style={{ width: "100%", borderRadius: 6, marginBottom: 5 }} />
                ) : (
                  <div style={{ fontSize: 24, marginBottom: 5 }}>{img.icon || "📸"}</div>
                )}
                <div style={{ fontSize: 10.5, color: C.textLight }}>{img.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  );
};

export default MediaSection;
