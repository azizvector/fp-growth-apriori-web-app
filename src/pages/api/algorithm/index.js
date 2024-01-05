import { pool } from "@/config/mysql-conn";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
        return await saveAlgorithm(req, res);
    default:
      return res.status(400).send("Method not allowed");
  }
}

const saveAlgorithm = async (req, res) => {
  try {
    const { summary_id, name, processing_frequent_itemsets, processing_association_rules, processing_time } = req.body;
    const result = await pool.query("INSERT INTO algorithm SET ?", {
      summary_id,
      name,
      processing_frequent_itemsets,
      processing_association_rules,
      processing_time,
    });
    return res.status(200).json({ algorithm_id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
