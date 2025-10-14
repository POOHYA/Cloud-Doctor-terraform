import { ReactNode } from 'react';
import GuidelineList from './GuidelineList';

interface GuideLayoutProps {
  title: string;
  children: ReactNode;
}

export default function GuideLayout({ title, children }: GuideLayoutProps) {
  return (
    <div className="p-6">
      <GuidelineList />
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}