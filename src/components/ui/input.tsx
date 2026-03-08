import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" {...props} />;
}
