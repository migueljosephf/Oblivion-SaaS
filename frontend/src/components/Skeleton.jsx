import React from 'react';

const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4',
    text: 'h-4 w-3/4',
    title: 'h-8 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-48 w-full',
    card: 'h-32',
  };

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

export default Skeleton;
