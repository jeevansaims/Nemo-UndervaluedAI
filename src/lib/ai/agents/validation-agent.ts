/**
 * Validation Agent
 * Inspired by Dexter's validation approach
 * Checks AI analysis for completeness, quality, and confidence
 */

interface AnalysisSection {
  [key: string]: any;
}

interface ValidationResult {
  isComplete: boolean;
  confidence: number; // 0-100
  issues: string[];
  suggestions: string[];
  qualityScore: number; // 0-100
}

export class ValidationAgent {
  /**
   * Validate AI analysis completeness and quality
   */
  async validate(analysis: any): Promise<ValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 100;
    let qualityScore = 100;

    // Check 1: Completeness - all required sections present
    const requiredSections = [
      'fundamental',
      'technical',
      'valuation',
      'sentiment',
      'risk',
    ];

    const missingSections = requiredSections.filter(
      section => !analysis[section] || Object.keys(analysis[section]).length === 0
    );

    if (missingSections.length > 0) {
      issues.push(`Missing analysis sections: ${missingSections.join(', ')}`);
      confidence -= missingSections.length * 15;
      qualityScore -= missingSections.length * 10;
    }

    // Check 2: Data quality - ensure numerical values are reasonable
    if (analysis.valuation) {
      const { pe, pb, ps } = analysis.valuation;
      
      if (pe && (pe < 0 || pe > 1000)) {
        issues.push('P/E ratio seems unrealistic');
        confidence -= 10;
      }
      
      if (pb && (pb < 0 || pb > 100)) {
        issues.push('P/B ratio seems unrealistic');
        confidence -= 10;
      }

      if (ps && (ps < 0 || ps > 100)) {
        issues.push('P/S ratio seems unrealistic');
        confidence -= 10;
      }
    }

    // Check 3: Sentiment analysis - ensure it has meaningful content
    if (analysis.sentiment) {
      const { score, summary } = analysis.sentiment;
      
      if (!summary || summary.length < 50) {
        suggestions.push('Sentiment summary could be more detailed');
        qualityScore -= 5;
      }

      if (score === undefined || score < -1 || score > 1) {
        issues.push('Invalid sentiment score');
        confidence -= 10;
      }
    }

    // Check 4: Risk assessment
    if (analysis.risk) {
      const { riskLevel, factors } = analysis.risk;
      
      if (!riskLevel) {
        issues.push('Missing risk level assessment');
        confidence -= 15;
      }

      if (!factors || factors.length === 0) {
        suggestions.push('Risk analysis could include more factors');
        qualityScore -= 10;
      }
    }

    // Check 5: Logical consistency
    if (analysis.recommendation) {
      const { action, confidence: recConfidence } = analysis.recommendation;
      
      // If recommendation is BUY but risk is HIGH, flag it
      if (action === 'BUY' && analysis.risk?.riskLevel === 'HIGH') {
        suggestions.push('High risk paired with buy recommendation - consider reviewing');
        qualityScore -= 5;
      }

      // If recommendation is SELL but valuation shows undervalued, flag it
      if (action === 'SELL' && analysis.valuation?.conclusion?.includes('undervalued')) {
        suggestions.push('Sell recommendation conflicts with undervaluation - consider reviewing');
        qualityScore -= 5;
      }
    }

    // Check 6: Technical analysis validity
    if (analysis.technical) {
      const { rsi, macdSignal } = analysis.technical;
      
      if (rsi && (rsi < 0 || rsi > 100)) {
        issues.push('Invalid RSI value (must be 0-100)');
        confidence -= 10;
      }
    }

    // Ensure confidence doesn't go negative
    confidence = Math.max(0, Math.min(100, confidence));
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    const isComplete = missingSections.length === 0 && issues.length === 0;

    return {
      isComplete,
      confidence,
      issues,
      suggestions,
      qualityScore,
    };
  }

  /**
   * Check if analysis needs re-run based on validation
   */
  shouldRerun(validation: ValidationResult): boolean {
    return validation.confidence < 70 || !validation.isComplete;
  }

  /**
   * Get specific sections that need improvement
   */
  getSectionsToImprove(validation: ValidationResult): string[] {
    const sectionsToImprove: string[] = [];

    validation.issues.forEach(issue => {
      if (issue.includes('Missing')) {
        const match = issue.match(/Missing analysis sections: (.+)/);
        if (match) {
          sectionsToImprove.push(...match[1].split(', '));
        }
      }
    });

    return sectionsToImprove;
  }
}

// Export singleton instance
export const validationAgent = new ValidationAgent();
