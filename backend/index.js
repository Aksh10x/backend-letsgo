import express from 'express';

const app = express();

const port = process.env.PORT || 3000;

app.get("/api/jokes",(req,res) => {
    const jokes = [
        { id: 1, joke: "Why don't scientists trust atoms? Because they make up everything!" },
        { id: 2, joke: "Why did the scarecrow win an award? Because he was outstanding in his field!" },
        { id: 3, joke: "Why don’t skeletons fight each other? They don’t have the guts." },
        { id: 4, joke: "What do you call fake spaghetti? An impasta!" },
        { id: 5, joke: "Why couldn’t the bicycle stand up by itself? It was two tired." }
      ];
    res.send(jokes)
});

app.listen(port,() => {
    console.log(`running on ${port}`)
});