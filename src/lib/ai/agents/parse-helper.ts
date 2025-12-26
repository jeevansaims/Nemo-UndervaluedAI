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
    // Try to extract JSON from the response - be more precise to avoid partial matches
    const jsonMatch = responseText.match(/\{[\s\S]*?"signal"[\s\S]*?"confidence"[\s\S]*?"reasoning"[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result.signal = parsed.signal || result.signal;
      result.confidence = parsed.confidence || result.confidence;
      result.reasoning = parsed.reasoning || '';

      console.log(`[${agentName}] Parsed JSON - Signal: ${result.signal}, Confidence: ${result.confidence}, Reasoning length: ${result.reasoning?.length || 0}`);
    }
  } catch (e) {
    console.error(`Failed to parse ${agentName} agent response JSON, trying fallback parsing`, e);
  }

  // If reasoning is still empty, try to extract it from the response
  if (!result.reasoning || result.reasoning.length < 100) {
    console.log(`[${agentName}] Reasoning too short (${result.reasoning?.length || 0} chars), trying fallback`);

    // Clean up the raw response by removing JSON blocks and code fences
    const cleanedText = responseText
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\{[\s\S]*?"signal"[\s\S]*?"confidence"[\s\S]*?"reasoning"[\s\S]*?\}/g, '')
      .trim();

    if (cleanedText && cleanedText.length > 50) {
      result.reasoning = cleanedText;
      console.log(`[${agentName}] Using cleaned text (${result.reasoning.length} chars)`);
    } else {
      // Last resort - use raw response but remove obvious JSON
      result.reasoning = responseText.replace(/^\{[\s\S]*?\}\s*/, '').trim();
      console.log(`[${agentName}] Using raw response fallback (${result.reasoning.length} chars)`);
    }
  }

  // Extract signal/confidence from text ONLY if JSON parsing completely failed
  if (result.confidence === 50 && !responseText.includes('"confidence"')) {
    // Try to extract confidence percentage from text
    const confMatch = result.reasoning.match(/(\d+)%?\s*confidence/i);
    if (confMatch) {
      result.confidence = parseInt(confMatch[1]);
    }

    // Try to find signal mentions in text
    if (result.reasoning.toLowerCase().includes('bullish')) {
      result.signal = 'Bullish';
    } else if (result.reasoning.toLowerCase().includes('bearish')) {
      result.signal = 'Bearish';
    }
  }

  console.log(`[${agentName}] Final result - Signal: ${result.signal}, Confidence: ${result.confidence}, Reasoning: ${result.reasoning.substring(0, 100)}...`);

  return result;
}
