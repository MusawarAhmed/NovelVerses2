import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | NovelVerse`;

    // Update Description Meta Tag
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Read premium web novels online.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || 'Read premium web novels online.';
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
};