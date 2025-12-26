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
      result = { ...result, ...parsed };
    }
  } catch (e) {
    console.error(`Failed to parse ${agentName} agent response, using raw text`, e);
  }
  
  // If reasoning is empty or too short, use the full response as analysis
  if (!result.reasoning || result.reasoning === 'Analysis incomplete' || result.reasoning.length < 100) {
    // Clean up the raw response by removing JSON blocks
    const cleanedText = responseText
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?"reasoning"[\s\S]*?\}/g, '')
      .trim();
    
    if (cleanedText && cleanedText.length > 50) {
      result.reasoning = cleanedText;
    } else {
      // Last resort - use raw response
      result.reasoning = responseText;
    }
  }
  
  // Extract signal/confidence from text if JSON parsing failed
  if (result.confidence === 50 && result.reasoning !== '') {
    // Try to find signal mentions in text
    if (result.reasoning.toLowerCase().includes('bullish')) {
      result.signal = 'Bullish';
      result.confidence = 65;
    } else if (result.reasoning.toLowerCase().includes('bearish')) {
      result.signal = 'Bearish';
      result.confidence = 65;
    }
  }
  
  return result;
}
