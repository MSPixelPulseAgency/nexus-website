import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";

export default function LazyVideoCard({ video, featured = false }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <article className="lazy-video-card">
      <div className="lazy-video-media">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${video.title}`}>
            <img src={thumbnail} alt={video.thumbnail ? "Official OUAC undergraduate application video thumbnail" : ""} width={video.thumbnail ? 1280 : 480} height={video.thumbnail ? 720 : 360} loading="lazy" decoding="async" />
            <span className="video-play"><Play size={25} fill="currentColor" aria-hidden="true" /></span>
            <span className="video-duration">{featured ? "Watch official video" : "Load video"}</span>
          </button>
        )}
      </div>
      <div className="lazy-video-copy">
        <span className="mini-label">{video.category}</span>
        <h3>{video.title}</h3>
        <strong>{video.organization}</strong>
        <p>{video.description}</p>
        <a className="text-link" href={video.source} target="_blank" rel="noreferrer">View official source <ExternalLink size={15} /></a>
        {featured && <a className="text-link video-youtube-link" href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer">Watch on YouTube <ExternalLink size={15} /></a>}
      </div>
    </article>
  );
}
