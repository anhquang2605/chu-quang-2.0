import clientPromise from "../../libs/mongodb";

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "porfolio");
        const sections = await db.collection("sections").find({}).toArray();
        res.status(200).json(sections);
    } catch (error) {
        console.error("Error in API handler:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}