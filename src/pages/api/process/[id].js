import { pool } from "@/config/mysql-conn";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return await getSummary(req, res);
    case "DELETE":
      return await deleteSummary(req, res);
    default:
      return res.status(400).json({ message: "bad request" });
  }
}

const getSummary = async (req, res) => {
  try {
    const summary = await pool.query("SELECT * FROM summary WHERE summary_id = ?", [
      req.query.id,
    ]);
    const algorithm = await pool.query("SELECT * FROM algorithm WHERE summary_id = ?", [
      req.query.id,
    ]);

    const result = {};

    if (algorithm[0].name) {
      const supports = await pool.query("SELECT * FROM support WHERE algorithm_id = ? ORDER BY itemset DESC, support DESC", [
        algorithm[0].algorithm_id,
      ]);
      const rules = await pool.query("SELECT * FROM rule WHERE algorithm_id = ? ORDER BY confidence DESC", [
        algorithm[0].algorithm_id,
      ]);

      result[algorithm[0].name === "Apriori" ? "apriori" : "fp_growth"] = {
        summary: summary[0],
        algorithm: algorithm[0],
        supports,
        rules
      };
    }

    if (algorithm[1]) {
      const supports = await pool.query("SELECT * FROM support WHERE algorithm_id = ? ORDER BY itemset DESC, support DESC", [
        algorithm[1].algorithm_id,
      ]);
      const rules = await pool.query("SELECT * FROM rule WHERE algorithm_id = ? ORDER BY confidence DESC", [
        algorithm[1].algorithm_id,
      ]);

      result[algorithm[1].name === "Apriori" ? "apriori" : "fp_growth"] = {
        summary: summary[0],
        algorithm: algorithm[1],
        supports,
        rules
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSummary = async (req, res) => {
  try {
    await pool.query("DELETE FROM support WHERE summary_id = ?", [req.query.id]);
    await pool.query("DELETE FROM rule WHERE summary_id = ?", [req.query.id]);
    await pool.query("DELETE FROM summary WHERE summary_id = ?", [req.query.id]);
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};