'use client';

export default function SponsorBanner({ banner }) {
  if (!banner || !banner.image_url) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between text-[11px] font-semibold text-sponsor uppercase tracking-wider mb-1 px-1">
        <span>Sponsored</span>
        <span className="text-muted font-normal lowercase">{banner.title}</span>
      </div>
      <a
        href={banner.link_url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block rounded-xl overflow-hidden border border-line shadow-sm hover:opacity-95 transition-opacity focus:ring-2 focus:ring-focus outline-none"
      >
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-auto max-h-32 object-cover"
        />
      </a>
    </div>
  );
}
