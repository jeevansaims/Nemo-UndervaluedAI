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
  let result: AgentParseResult = { 
    signal: 'Neutral', 
    confidence: 50, 
    reasoning: '' 
  };
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Extract fields from parsed JSON
      if (parsed.signal) result.signal = parsed.signal;
      if (parsed.confidence) result.confidence = parsed.confidence;
      if (parsed.reasoning) result.reasoning = parsed.reasoning;
    }
  } catch (e) {
    console.error(`Failed to parse ${agentName} agent JSON response`, e);
  }
  
  // If we successfully parsed JSON but reasoning is empty or incomplete, use full response
  if (!result.reasoning || result.reasoning === 'Analysis incomplete' || result.reasoning.length < 100) {
    // Remove any JSON blocks from the responseText to get clean text
    let cleanedText = responseText;
    
    // Remove JSON objects (try multiple patterns)
    cleanedText = cleanedText.replace(/```json[\s\S]*?```/g, '');
    cleanedText = cleanedText.replace(/```[\s\S]*?```/g, '');
    cleanedText = cleanedText.replace(/\{[\s\S]*?\}/g, ''); // Remove all JSON objects
    cleanedText = cleanedText.trim();
    
    if (cleanedText && cleanedText.length > 50) {
      result.reasoning = cleanedText;
    } else {
      // Last resort - if parsed JSON had some reasoning, keep it; otherwise use raw
      if (!result.reasoning || result.reasoning.length < 20) {
        result.reasoning = responseText;
      }
    }
  }
  
  // Extract signal/confidence from text if JSON parsing completely failed
  if (result.signal === 'Neutral' && result.confidence === 50 && result.reasoning !== '') {
    // Try to find signal mentions in text
    const lowerReasoning = result.reasoning.toLowerCase();
    if (lowerReasoning.includes('bullish') && !lowerReasoning.includes('not bullish') && !lowerReasoning.includes('bearish')) {
      result.signal = 'Bullish';
      result.confidence = 65;
    } else if (lowerReasoning.includes('bearish') && !lowerReasoning.includes('not bearish')) {
      result.signal = 'Bearish';
      result.confidence = 65;
    }
  }
  
  return result;
}
