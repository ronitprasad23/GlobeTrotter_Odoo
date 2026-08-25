import React, { useState, useEffect } from 'react';

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getGradientClass(name) {
  if (!name) return 'from-orange-500 to-amber-500';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'from-orange-500 to-amber-500',    // primary/orange
    'from-teal-500 to-emerald-500',    // teal / emerald
    'from-indigo-500 to-purple-500',   // indigo / purple
    'from-rose-500 to-pink-500',       // rose / pink
    'from-blue-500 to-cyan-500',       // blue / cyan
    'from-violet-500 to-fuchsia-500',  // violet / fuchsia
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  
  // Unsplash detail page URL matcher
  // Matches e.g., https://unsplash.com/photos/person-holding-black-camera-pointing-to-the-front-rDEOVtE7vHs
  // or https://unsplash.com/photos/rDEOVtE7vHs
  const unsplashRegex = /https?:\/\/(?:www\.)?unsplash\.com\/photos\/(?:[^\/]+-)?([a-zA-Z0-9_-]{8,15})(?:\/|\?|$)/i;
  const unsplashMatch = trimmed.match(unsplashRegex);
  if (unsplashMatch && unsplashMatch[1]) {
    const photoId = unsplashMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?w=300&auto=format&fit=crop&q=80`;
  }
  
  // Imgur page match
  // Matches e.g., https://imgur.com/gallery/abcde or https://imgur.com/a/abcde or https://imgur.com/abcde
  const imgurRegex = /https?:\/\/(?:www\.)?imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)(?:\/|\?|$)/i;
  const imgurMatch = trimmed.match(imgurRegex);
  if (imgurMatch && imgurMatch[1]) {
    const imgurId = imgurMatch[1];
    return `https://i.imgur.com/${imgurId}.jpg`;
  }

  return trimmed;
}

export default function Avatar({ src, name, className = '', textClassName = '' }) {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(name);
  const gradient = getGradientClass(name);

  if (!normalizedSrc || hasError) {
    return (
      <div 
        className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black select-none ${className}`}
        title={name}
      >
        <span className={textClassName}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={name}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
