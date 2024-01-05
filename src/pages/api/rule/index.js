import { pool } from "@/config/mysql-conn";
import { isEmpty } from "lodash";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return await saveRules(req, res);
    default:
      return res.status(400).send("Method not allowed");
  }
}

const saveRules = async (req, res) => {
  try {
    const { rules } = req.body;
    if (isEmpty(rules)) return res.status(400).send("Tidak ada items yang memenuhi minimal support");
    const sql = "INSERT INTO rule (algorithm_id, rule, confidence, lift, description) VALUES ?";
    const rulesArray = rules.map(o => [o.algorithm_id, o.rule, o.confidence, o.liftRatio, o.description])
    const result = await pool.query(sql, [rulesArray]);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
