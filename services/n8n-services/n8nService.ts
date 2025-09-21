const N8N_BASE_URL =
  "https://blazeaiautomations.com/webhook-test/bd8582cd-2b2b-4c86-a5cc-748457f0f573";

export const n8nService = {
  sendMessage: async (message: string) => {
    const response = await fetch(`${N8N_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, timestamp: Date.now() }),
    });
    return response.json();
  },

  sendAudio: async (audioFile: Blob | File) => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("timestamp", Date.now().toString());

    const response = await fetch(
      `https://blazeaiautomations.com/webhook-test/d519805f-de83-4b30-8ae3-34419da464c8`,
      {
        method: "POST",
        body: formData,
      }
    );
    return response.json();
  },
};
