import {useEffect} from 'react';
import { fetchFromGetAPI } from '../libs/api-interactions';
import { Section } from '../types/db';
import JumpSection from '../components/jump-section/jump-section';
import Book from '../components/book/Book';
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
    const PATH: string = 'sections';
    const options: any = {};
    //const sections = await fetchFromGetAPI(PATH,  options);
    const sections: Section[] = [];
    prop.sections = sections.reduce((acc: string[], section: Section) => {
        if (section.title) {
            acc.push(section.title)
        }
        return acc
    }, []);
    return {
        props: prop,
    };
};

export default function Home(props: HomeProps) {
  const { title, description, sections } = props;
  useEffect(() => {
    document.title = title;
  }, []);
    return (
    <div>
        <h1>Welcome to My Next.js App</h1>
        <p>This is a sample application built with Next.js.</p>
        <p>Explore the features and enjoy the experience!</p>
        <JumpSection sections={sections} />
        <Book />
    </div>
  );
}