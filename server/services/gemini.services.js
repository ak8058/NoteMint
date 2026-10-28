const Gemini_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

export const generateGeminiResponse = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
    const response = await fetch(
      `${Gemini_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: { responseMimeType: "application/json" },
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const providerError = new Error("Gemini request failed");
      providerError.status = response.status;
      providerError.providerMessage = (await response.json().catch(() => ({}))).error?.message;
      throw providerError;
    }

    const data = await response.json();

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const cleanText = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini request failed:", error?.status || error?.name || "UnknownError", error?.providerMessage || "");
    const safeError = new Error("Gemini API request failed");
    safeError.status = error?.status;
    safeError.name = error?.name || "GeminiRequestError";
    throw safeError;
  }
};

export const generateGeminiResponseFromImages = async (prompt, images) => {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
    const parts = [{ text: prompt }];
    images.forEach((image, index) => {
      // Keep scan order explicit for multi-page notes.
      parts.push({ text: `Page ${index + 1}` });
      parts.push({
        inline_data: {
          mime_type: image.mimetype,
          data: image.buffer.toString("base64"),
        },
      });
    });
    const response = await fetch(`${Gemini_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    if (!response.ok) {
      const providerError = new Error("Gemini image request failed");
      providerError.status = response.status;
      throw providerError;
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) throw new Error("No text returned from Gemini");
    return JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
  } catch (error) {
    console.error("Gemini image request failed:", error?.status || error?.name || "UnknownError");
    throw new Error("Gemini image processing failed");
  }
};
