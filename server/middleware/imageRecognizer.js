const { ComputerVisionClient } = require("@azure/cognitiveservices-computervision");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

const key = "f5d0a36abc0c4c18a8e1909341f47bdf";
const endpoint = "https://image-recognizer-stylify.cognitiveservices.azure.com/";

const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const client = new ComputerVisionClient(credentials, endpoint);

const detectLabels = async (base64Image) => {
    try {
    const cleanedBase64Image = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(cleanedBase64Image, 'base64');

    const result = await client.analyzeImageInStream(imageBuffer, {
      visualFeatures: ['Tags', 'Color'] 
    });

    return {
      tags: result.tags,
      dominantColors: result.color.dominantColors,
      accentColor: result.color.accentColor,
    };
    } catch (error) {
      console.error('Error detecting labels:', error);
      return null;
    }
  };
  
  module.exports = { detectLabels };