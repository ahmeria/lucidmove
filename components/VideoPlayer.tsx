import { youtubeEmbedUrl, isYoutubeUrl } from "@/lib/video";

export default function VideoPlayer({ url, poster }: { url: string; poster?: string | null }) {
  if (isYoutubeUrl(url)) {
    const embedUrl = youtubeEmbedUrl(url);
    return (
      <iframe
        src={embedUrl ?? undefined}
        title="Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return <video controls className="w-full h-full" src={url} poster={poster || undefined} />;
}
