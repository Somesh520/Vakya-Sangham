import axios from 'axios';
import ConversationHistory from '../models/ConversationHistoryModel.js';

const PYTHON_AI_SERVER_URL = "http://localhost:8000/chat/stream"; 
// The real ObjectId for our special "General Chat" lesson
const GENERAL_CHAT_LESSON_ID = '000000000000000000000000';

export const handleChatStream = async (req, res) => {
    const { query, lesson_to_teach, lessonId } = req.body;
    const userId = req.user.id;

    // --- FIX: Use a real ObjectId for general chat ---
    const contextId = lessonId || GENERAL_CHAT_LESSON_ID;

    try {
        const history = await ConversationHistory.findOne({ user: userId, lesson: contextId });
        
        let lastUserQuery = null;
        let lastAiResponse = null;

        if (history && history.messages.length >= 2) {
            lastUserQuery = history.messages[history.messages.length - 2].content;
            lastAiResponse = history.messages[history.messages.length - 1].content;
        }

        const pythonRequestBody = {
            query: query,
            previous_query: lastUserQuery,
            previous_response: lastAiResponse,
            lesson_to_teach: lesson_to_teach || null
        };
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        const pythonServerResponse = await axios.post(
            PYTHON_AI_SERVER_URL,
            pythonRequestBody,
            { responseType: 'stream' }
        );

        let fullAiResponse = '';
        pythonServerResponse.data.on('data', (chunk) => {
            fullAiResponse += chunk.toString();
            res.write(chunk);
        });

        pythonServerResponse.data.on('end', async () => {
            await ConversationHistory.findOneAndUpdate(
                { user: userId, lesson: contextId },
                { 
                    $push: { 
                        messages: { $each: [
                            { role: 'user', content: query },
                            { role: 'assistant', content: fullAiResponse }
                        ]}
                    }
                },
                { upsert: true }
            );
            res.end();
        });

    } catch (error) {
        console.error("Streaming Error:", error.response ? error.response.data : error.message);
        res.status(500).end("Error during streaming.");
    }
};