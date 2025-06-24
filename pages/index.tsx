import { getStaticProps } from 'next/dist/build/templates/pages';
import {useEffect} from 'react';

getStaticProps({
  props: {
    title: 'My Next.js App',
    description: 'This is a sample Next.js application.',
  },
});

export default function Home() {
  useEffect(() => {
    document.title = 'My Next.js App';
    
  }, []);
    return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        <p>This is a sample application built with Next.js.</p>
        <p>Explore the features and enjoy the experience!</p>
    </div>
  );
}