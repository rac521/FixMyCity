const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const ai = new GoogleGenAI({ apiKey: 'AIzaSyCTJf7CsdO1lgUXZiB3x_wN-I8VqPH2Y_8' });
        console.log("SDK Initialized");

        // Create a dummy 1x1 pixel image
        const imgBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
        const imgPath = path.join(__dirname, 'test_img.png');
        fs.writeFileSync(imgPath, imgBuffer);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                "What is this?",
                {
                    inlineData: {
                        data: imgBuffer.toString("base64"),
                        mimeType: 'image/png'
                    }
                }
            ]
        });

        console.log("Response:", response.text);
        fs.unlinkSync(imgPath);
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
