
import {useEffect} from 'react';
import { fetchFromGetAPI } from '../libs/api-interactions';
interface HomeProps {
    title: string;
    description: string;
    sections: string[];
}
export async function getServerSideProps(
  
) {
    const prop: HomeProps = {
        title: 'My Next.js App',
        description: 'This is a sample application built with Next.js.',
        sections: []
      };
    const PATH = 'sections';
    const options = {};
    const sections = await fetchFromGetAPI(PATH,  options);
    prop.sections = sections;
    return {
        props: prop,
    };
};

export default function Home(props: HomeProps) {
  const { title, description, sections } = props;
  useEffect(() => {
    document.title = title;
    console.log(sections);
  }, []);
    return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        <p>This is a sample application built with Next.js.</p>
        <p>Explore the features and enjoy the experience!</p>
    </div>
  );
}