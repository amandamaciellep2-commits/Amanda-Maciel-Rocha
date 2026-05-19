import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for generating insights
  app.post("/api/generate-insights", async (req, res) => {
    try {
      const { tasks, notes, pendencias } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
      }

      // Simple auth header check - if you want to be stricter, verify with Supabase
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized. Please log in to generate insights." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const activeTasksStr = tasks.map((t: any) => `- [${t.checked ? 'X' : ' '}] ${t.title} (${t.metadata})`).join('\n');
      const pendenciasStr = pendencias.map((p: any) => `- [${p.checked ? 'X' : ' '}] ${p.label}`).join('\n');

      const prompt = `Você é um Analista de IA Especialista em CME (Central de Material e Esterilização).
Análise de forma rigorosa os detalhes do plantão de hoje descritos abaixo e prepare um relatório executivo de alta densidade técnica em português brasileiro. Use um tom clínico, focado em governança, biossegurança, otimização de ciclos e conformidade regulatória (Anvisa RDC 15).

DADOS DO PLANTÃO CME DE HOJE:
- Notas / Ocorrências registradas: "${notes || "Nenhuma ocorrência registrada no sistema até o momento."}"
- Checklists de Atividades do Dia:
${activeTasksStr}
- Pendências Administrativas Registradas:
${pendenciasStr || "Nenhuma pendência cadastrada."}
- Capacidade Básica de Operações:
  - Kits de OPME recebidos/processados: 4
  - Ópticas e endoscópios cirúrgicos conferidos: 10
  - Alertas críticos pendentes: 1

INSTRUÇÕES DO RELATÓRIO (ESCREVA EM MARKDOWN LIMPO E COMPACTO):
1. Use as seguintes divisões exatas em seu texto:
   - ### 📊 Resumo Executivo e Status Geral
   - ### ⚠️ Gestão de Riscos e Gargalos
   - ### 💡 Recomendações e Boas Práticas (RDC 15)
   - ### 📋 Plano de Intervenção de 3 Passos
      
Seja prático e cirúrgico na sua linguagem. Evite explicações redundantes. Forneça valor real para enfermeiros chefes e supervisores cirúrgicos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text;

      if (text) {
        res.json({ text });
      } else {
        throw new Error("Gemini returned empty response.");
      }
    } catch (err: any) {
      console.error("Server API Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI insights." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
