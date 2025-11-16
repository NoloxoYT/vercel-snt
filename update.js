// update.js (root)
import { google } from "googleapis";
import 'dotenv/config';

export async function updateSheet(season, choice) {
  if (!season || !choice) throw new Error("Paramètres manquants");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const seasonToCell = {
    "s01": "B2", "s02": "C2", "s03": "D2",
    "s04": "E2", "s05": "F2", "s06": "G2",
    "s07": "H2", "s08": "I2", "s09": "J2",
    "s10": "K2", "s11": "L2"
  };

  const cell = seasonToCell[season];
  if (!cell) throw new Error("Saison inconnue");

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'Feuille 1'!${cell}`,
    valueInputOption: "RAW",
    requestBody: { values: [[choice]] },
  });

  return `Cellule ${cell} mise à jour avec ${choice}`;
}

// Handler Vercel
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Méthode non autorisée" });

  const { season, choice } = req.body;

  try {
    const result = await updateSheet(season, choice);
    res.status(200).json({ message: result });
  } catch (err) {
    console.error("❌ Erreur Sheets", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
}
