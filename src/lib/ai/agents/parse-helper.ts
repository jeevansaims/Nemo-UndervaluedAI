/**
 * Utility function to parse AI agent responses
 * Handles JSON extraction with fallback to raw text
 */

export interface AgentParseResult {
  signal: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  reasoning: string;
}

export function parseAgentResponse(responseText: string, agentName: string): AgentParseResult {
  // DEBUG: Log the raw response
  console.log(`[${agentName}] RAW RESPONSE (first 500 chars):`, responseText.substring(0, 500));
  console.log(`[${agentName}] RAW RESPONSE FULL LENGTH:`, responseText.length);
  
  let result: AgentParseResult = {
    signal: 'Neutral',
    confidence: 50,
    reasoning: ''
  };

  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*?"signal"[\s\S]*?"confidence"[\s\S]*?"reasoning"[\s\S]*?\}/);
    if (jsonMatch) {
      console.log(`[${agentName}] FOUND JSON MATCH (first 500 chars):`, jsonMatch[0].substring(0, 500));
      
      // APPROACH: Try JSON.parse first (works if Claude returns valid JSON)
      // If that fails, escape newlines within the "reasoning" value only
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        result.signal = parsed.signal || result.signal;
        result.confidence = parsed.confidence || result.confidence;
        result.reasoning = parsed.reasoning || '';
        console.log(`[${agentName}] PARSED SUCCESSFULLY (no sanitization needed) - Signal: ${result.signal}, Confidence: ${result.confidence}, Reasoning length: ${result.reasoning.length}`);
      } catch (parseError) {
        console.log(`[${agentName}] Direct parse failed, trying sanitization:`, parseError);
        
        // CRITICAL FIX: Escape newlines ONLY within string values, not structural JSON whitespace
        // Use a more targeted replacement that preserves JSON formatting but fixes string content
        const sanitizedJson = jsonMatch[0]
          // First, let's try to extract and fix the reasoning field specifically
          .replace(/"reasoning":\s*"([\s\S]*?)(?="(?:\s*,|\s*\}))/g, (match, reasoningText) => {
            // Escape control characters within the reasoning text
            const escapedReasoning = reasoningText
              .replace(/\\/g, '\\\\')  // Escape backslashes first
              .replace(/"/g, '\\"')    // Escape quotes
              .replace(/\n/g, '\\n')   // Escape newlines
              .replace(/\r/g, '\\r')   // Escape carriage returns
              .replace(/\t/g, '\\t');  // Escape tabs
            return `"reasoning": "${escapedReasoning}"`;
          });
        
        console.log(`[${agentName}] SANITIZED JSON (first 300 chars):`, sanitizedJson.substring(0, 300));
        
        const parsed = JSON.parse(sanitizedJson);
        result.signal = parsed.signal || result.signal;
        result.confidence = parsed.confidence || result.confidence;
        result.reasoning = parsed.reasoning || '';
        console.log(`[${agentName}] PARSED SUCCESSFULLY after sanitization - Signal: ${result.signal}, Confidence: ${result.confidence}, Reasoning length: ${result.reasoning.length}`);
      }
    } else {
      console.log(`[${agentName}] NO JSON MATCH FOUND - trying fallback`);
    }
  } catch (e) {
    console.error(`[${agentName}] JSON PARSE ERROR (all attempts failed):`, e);
    console.error(`[${agentName}] Trying fallback text extraction`);
  }

  // If reasoning is still empty, try to extract it from the response
  if (!result.reasoning || result.reasoning.length < 100) {
    console.log(`[${agentName}] Reasoning too short (${result.reasoning.length} chars), trying fallback extraction`);
    // Clean up the raw response by removing JSON blocks and code fences
    const cleanedText = responseText
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?"signal"[\s\S]*?"confidence"[\s\S]*?"reasoning"[\s\S]*?\}/g, '')
      .trim();

    console.log(`[${agentName}] CLEANED TEXT LENGTH:`, cleanedText.length);
    if (cleanedText && cleanedText.length > 50) {
      result.reasoning = cleanedText;
      console.log(`[${agentName}] Using cleaned text as reasoning (${result.reasoning.length} chars)`);
    } else {
      // Last resort - use raw response but remove obvious JSON
      result.reasoning = responseText.replace(/^\{[\s\S]*?\}\s*/, '').trim();
      console.log(`[${agentName}] FALLBACK: Using raw response minus JSON (${result.reasoning.length} chars)`);
    }
  }

  // Extract signal/confidence from text ONLY if JSON parsing completely failed
  if (result.confidence === 50 && !responseText.includes('"confidence"')) {
    console.log(`[${agentName}] Extracting signal/confidence from text...`);
    // Try to extract confidence percentage from text
    const confMatch = result.reasoning.match(/(\d+)%?\s*confidence/i);
    if (confMatch) {
      result.confidence = parseInt(confMatch[1]);
      console.log(`[${agentName}] Extracted confidence from text: ${result.confidence}%`);
    }

    // Try to find signal mentions in text
    if (result.reasoning.toLowerCase().includes('bullish')) {
      result.signal = 'Bullish';
      console.log(`[${agentName}] Extracted signal from text: Bullish`);
    } else if (result.reasoning.toLowerCase().includes('bearish')) {
      result.signal = 'Bearish';
      console.log(`[${agentName}] Extracted signal from text: Bearish`);
    }
  }

  console.log(`[${agentName}] FINAL RESULT - Signal: ${result.signal}, Confidence: ${result.confidence}%, Reasoning: ${result.reasoning.substring(0, 100)}...`);
  return result;
}
