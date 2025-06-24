
import {useEffect} from 'react';
interface HomeProps {
    title: string;
    description: string;
}
export async function getStaticProps(
  
) {
    const prop: HomeProps = {
        title: 'My Next.js App',
        description: 'This is a sample application built with Next.js.',
    };
    return {
        props: prop,
    };
};

export default function Home() {
  useEffect(() => {
    document.title = 'Chu Quang';
    
  }, []);
    return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        <p>This is a sample application built with Next.js.</p>
        <p>Explore the features and enjoy the experience!</p>
    </div>
  );
}