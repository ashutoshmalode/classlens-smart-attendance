import React, { useState } from 'react';
import { User } from 'lucide-react';

export const StudentAvatar = ({ src, name, className = "h-10 w-10 rounded-xl" }) => {
  const [hasError, setHasError] = useState(false);

  // If no source is provided or the image load failed, show custom fallback avatar
  if (!src || hasError) {
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '';

    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 text-white font-bold select-none`}
        style={{ fontSize: className.includes('w-10') ? '12px' : 'inherit' }}
        title={name}
      >
        {initials || <User size={className.includes('w-10') ? 16 : 24} className="text-gray-400" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`${className} object-cover border border-white/10 bg-white/5`}
    />
  );
};

export default StudentAvatar;
