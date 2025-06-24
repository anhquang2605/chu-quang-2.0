import { useEffect } from "react";

interface WorkProps {

}
export async function getStaticProps() {
    return {
        props: {}, // No props needed for this page
    };
}
export default function Work(props: WorkProps) {
    useEffect(() => {
        document.title = "Chu Quang | Work";
    }, []);
    return (
        <div>
            <h1>Work</h1>
        </div>
    );
}