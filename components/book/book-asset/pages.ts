import { atom } from "jotai";
interface pageType  {
  number: number;
}
export const pageAtom = atom(0);
export const pages: pageType[] = [
 
];
const PAGE_NUMBER = 30;
for (let i = 0; i < PAGE_NUMBER; i++) {
  pages.push({
    number: i,
  });
}