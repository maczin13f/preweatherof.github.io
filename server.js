const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


const uri = "mongodb+srv://felipe17:felipe2503@preweather1.79wpd4y.mongodb.net/?retryWrites=true&w=majority&appName=PreWeather1";
const client = new MongoClient(uri);

let collection;

async function connectMongo() {
    try {
        await client.connect();
        const db = client.db("PreWeatherDB"); // ex: "climaDB"
        collection = db.collection("searchesfromsite"); // É AQUI que define o nome da sua coleção
        console.log("✅ Conectado ao MongoDB!");
    } catch (err) {
        console.error("❌ Erro ao conectar ao MongoDB:", err);
    }
}
connectMongo();

// Rota para salvar busca
app.post("/save-search", async (req, res) => {
    try {
        const dados = req.body;
        await collection.insertOne(dados);
        res.status(201).json({ message: "Busca salva com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao salvar busca:", error);
        res.status(500).json({ error: "Erro ao salvar busca" });
    }
});

// Rota para listar o histórico
app.get("/search-history", async (req, res) => {
    try {
        const userId = req.query.user_id; // pega da URL
        if (!userId) return res.status(400).json({ error: "ID de usuário ausente." });

        const buscas = await collection.find({ user_id: userId })
            .sort({ _id: -1 })
            .limit(10)
            .toArray();
        res.json(buscas);
    } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
});


// Rota para limpar o histórico
app.delete("/clear-history", async (req, res) => {
    try {
        await collection.deleteMany({});
        res.json({ message: "Histórico apagado com sucesso!" });
    } catch (error) {
        console.error("❌ Erro ao apagar histórico:", error);
        res.status(500).json({ error: "Erro ao apagar histórico" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
