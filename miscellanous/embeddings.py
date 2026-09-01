from ollama import embed

response = embed(
    model="nomic-embed-text",
    input="Bayes Theorem is part of Probability and Statistics."
)

embedding = response["embeddings"][0]

print("Embedding generated!")
print("Number of dimensions:", len(embedding))
print("First 10 values:", embedding[:10])