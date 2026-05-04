---
title: "Construyendo una base de conocimiento local con Obsidian y modelos de lenguaje"
date: 2026-04-20
categories: ["ia"]
tags: ["obsidian", "llm", "conocimiento", "automatizacion"]
summary: "Cómo integro LLMs locales en mi flujo de documentación personal para generar conexiones entre notas y consultas sin dependencia de la nube."
related: ["index-match-vs-vlookup"]
---

El problema con los sistemas de gestión del conocimiento personal (PKM) es que la cantidad de información rápidamente supera la capacidad de organizarla manualmente. Para evitar enviar mis notas privadas a servicios en la nube, desarrollé un sistema usando LLMs locales.

## El stack

- **Obsidian**: Interfaz gráfica y repositorio Markdown local. Todo vive en archivos de texto plano en mi máquina.
- **Ollama**: Servidor de inferencia ligero para ejecutar LLMs (Llama 3 8B, Mistral 7B) en hardware propio.
- **Python + ChromaDB**: Generación de embeddings e indexación vectorial local para búsqueda semántica.
- **Bash scripts**: Automatización del pipeline completo como hooks de Obsidian.

## Flujo de trabajo

Cuando creo o edito una nota en Obsidian, un script en background la procesa:

```bash
#!/bin/bash
NOTE_PATH="$1"
NOTE_CONTENT=$(cat "$NOTE_PATH")

# Extraer metadata con LLM local
curl -s http://localhost:11434/api/generate \
  -d "{
    \"model\": \"llama3\",
    \"prompt\": \"Extrae los 5 conceptos clave de este texto en formato JSON array: $NOTE_CONTENT\",
    \"stream\": false
  }" | jq -r '.response'
```

{{< nota >}}
Ollama expone una API REST compatible con OpenAI en `localhost:11434`. Podés usar el cliente oficial de OpenAI apuntando a esa URL para aprovechar librerías existentes.
{{< /nota >}}

## Búsqueda semántica local

El componente más valioso es la búsqueda semántica: en lugar de buscar por palabras exactas, buscás por **significado**.

```python
import chromadb
from chromadb.utils import embedding_functions

client  = chromadb.PersistentClient(path="./knowledge_db")
ef      = embedding_functions.OllamaEmbeddingFunction(
            model_name="nomic-embed-text",
            url="http://localhost:11434/api/embeddings"
          )
collection = client.get_or_create_collection("notas", embedding_function=ef)

# Buscar notas semánticamente relacionadas
results = collection.query(
    query_texts=["configuración de firewall con nftables"],
    n_results=5
)
```

{{< tip >}}
`nomic-embed-text` de Ollama es excelente para embeddings en español e inglés. Es rápido y corre bien en hardware modesto (8GB RAM).
{{< /tip >}}

## Resultado

Un sistema que actúa como segundo cerebro: consultable en lenguaje natural, completamente privado, que mejora con cada nota nueva que agregás. Las conexiones entre ideas emergen solas a medida que el grafo de conocimiento crece.

{{< advertencia >}}
El pipeline completo consume unos 4-6GB de RAM mientras está activo. En sistemas con poca memoria, configurá Ollama para descargar el modelo cuando no esté en uso con `OLLAMA_KEEP_ALIVE=0`.
{{< /advertencia >}}
