import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PersonaAgent {
  agentName?: string;
  analysis: string;
  signal: string;
  confidence: number;
  moatScore?: number;
  intrinsicValue?: number;
  marginOfSafety?: number;
}

interface AnalysisData {
  ticker: string;
  recommendation?: string;
  confidenceScore?: number;
  targetPrice?: number;
  currentPrice?: number;
  marketCap?: number;
  createdAt?: string | Date;
  finalReport?: string;
  valuationResult?: string;
  sentimentResult?: string;
  fundamentalResult?: string;
  riskResult?: string;
  technicalResult?: string;
  macroResult?: string;
  // Persona Agents
  warrenBuffett?: PersonaAgent;
  benGraham?: PersonaAgent;
  charlieMunger?: PersonaAgent;
  peterLynch?: PersonaAgent;
  cathieWood?: PersonaAgent;
  michaelBurry?: PersonaAgent;
  billAckman?: PersonaAgent;
  philFisher?: PersonaAgent;
  stanleyDruckenmiller?: PersonaAgent;
  aswathDamodaran?: PersonaAgent;
  mohnishPabrai?: PersonaAgent;
  rakeshJhunjhunwala?: PersonaAgent;
  personaAgents?: Record<string, PersonaAgent>;
}

// Dark theme colors
const COLORS = {
  background: [18, 18, 18] as [number, number, number],      // #121212
  surface: [30, 30, 30] as [number, number, number],         // #1e1e1e
  surfaceLight: [45, 45, 45] as [number, number, number],    // #2d2d2d
  primary: [99, 102, 241] as [number, number, number],       // Indigo
  success: [34, 197, 94] as [number, number, number],        // Green
  danger: [239, 68, 68] as [number, number, number],         // Red
  warning: [234, 179, 8] as [number, number, number],        // Yellow
  textPrimary: [255, 255, 255] as [number, number, number],  // White
  textSecondary: [156, 163, 175] as [number, number, number], // Gray
  textMuted: [107, 114, 128] as [number, number, number],    // Darker gray
  accent: [139, 92, 246] as [number, number, number],        // Purple
};

export const generateAnalysisPDF = (data: AnalysisData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Set dark background for entire page
  const setDarkBackground = () => {
    doc.setFillColor(...COLORS.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };
  
  setDarkBackground();

  // --- Header ---
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Gradient-like effect
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 5, 45, 'F');
  
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(data.ticker.toUpperCase(), 14, 22);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('AI Investment Analysis Report', 14, 33);
  
  const dateStr = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString() 
    : new Date().toLocaleDateString();
  
  doc.setTextColor(...COLORS.textMuted);
  doc.text(dateStr, pageWidth - 14, 22, { align: 'right' });
  doc.text('Powered by Claude AI', pageWidth - 14, 33, { align: 'right' });

  // --- Summary Metrics Card ---
  const yStart = 55;
  
  // Card background
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(10, yStart, pageWidth - 20, 35, 3, 3, 'F');
  
  // Recommendation Box
  const recColor: [number, number, number] = 
    data.recommendation === 'BUY' ? COLORS.success :
    data.recommendation === 'SELL' ? COLORS.danger :
    COLORS.warning;

  doc.setFillColor(...recColor);
  doc.roundedRect(15, yStart + 5, 45, 25, 3, 3, 'F');
  
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.text('RECOMMENDATION', 37.5, yStart + 12, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.recommendation || 'N/A', 37.5, yStart + 24, { align: 'center' });

  // Metrics display
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const formatCurrency = (val?: number) => val ? `$${val.toFixed(2)}` : 'N/A';
  
  // Column 2: Prices
  doc.text('Current Price', 75, yStart + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textPrimary);
  doc.text(formatCurrency(data.currentPrice), 75, yStart + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('Target Price', 75, yStart + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.success);
  doc.text(formatCurrency(data.targetPrice), 95, yStart + 28);

  // Column 3: Confidence & Upside
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Confidence', 130, yStart + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text(data.confidenceScore ? `${data.confidenceScore}%` : 'N/A', 130, yStart + 20);
  
  const upside = (data.targetPrice && data.currentPrice) 
    ? ((data.targetPrice - data.currentPrice) / data.currentPrice) * 100 
    : null;
  
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Upside Potential', 165, yStart + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(upside && upside > 0 ? COLORS.success[0] : COLORS.danger[0], 
                   upside && upside > 0 ? COLORS.success[1] : COLORS.danger[1],
                   upside && upside > 0 ? COLORS.success[2] : COLORS.danger[2]);
  doc.text(upside ? `${upside > 0 ? '+' : ''}${upside.toFixed(1)}%` : 'N/A', 165, yStart + 20);

  // --- Executive Summary ---
  let finalY = yStart + 45;
  
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(10, finalY, pageWidth - 20, 8, 2, 2, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(10, finalY, 3, 8, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('Executive Summary', 18, finalY + 6);
  
  finalY += 14;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textSecondary);
  
  const splitSummary = doc.splitTextToSize(data.finalReport || 'No summary available.', pageWidth - 28);
  doc.text(splitSummary, 14, finalY);
  
  finalY += (splitSummary.length * 4.5) + 10;

  // --- Helper function for sections ---
  const addSection = (title: string, content: string, accentColor: [number, number, number] = COLORS.primary) => {
    if (!content) return;

    // Check if we need a new page
    const estimatedHeight = doc.splitTextToSize(content, pageWidth - 28).length * 4.5 + 20;
    if (finalY + estimatedHeight > pageHeight - 30) {
      doc.addPage();
      setDarkBackground();
      finalY = 20;
    }

    // Section header
    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(10, finalY, pageWidth - 20, 8, 2, 2, 'F');
    doc.setFillColor(...accentColor);
    doc.rect(10, finalY, 3, 8, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(title, 18, finalY + 6);
    
    finalY += 12;
    
    // Content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textSecondary);
    const splitContent = doc.splitTextToSize(content, pageWidth - 28);
    doc.text(splitContent, 14, finalY);
    
    finalY += (splitContent.length * 4.5) + 8;
  };

  // --- Core Analysis Sections ---
  addSection('📊 Valuation Analysis', data.valuationResult || '', COLORS.primary);
  addSection('📈 Technical Analysis', data.technicalResult || '', COLORS.accent);
  addSection('📋 Fundamental Analysis', data.fundamentalResult || '', COLORS.success);
  addSection('💬 Sentiment Analysis', data.sentimentResult || '', COLORS.warning);
  addSection('⚠️ Risk Assessment', data.riskResult || '', COLORS.danger);
  addSection('🌍 Macro Analysis', data.macroResult || '', COLORS.primary);

  // --- Persona Agent Analyses ---
  // Add a new page for persona agents
  doc.addPage();
  setDarkBackground();
  finalY = 20;
  
  // Header for persona section
  doc.setFillColor(...COLORS.surface);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 5, 30, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textPrimary);
  doc.text('🎯 Investor Analyst Perspectives', 14, 18);
  
  finalY = 40;
  
  // Process persona agents - can come from individual fields OR personaAgents object
  const personaNames: Record<string, string> = {
    warrenBuffett: '🏛️ Warren Buffett',
    benGraham: '📚 Ben Graham',
    charlieMunger: '🧠 Charlie Munger',
    peterLynch: '📈 Peter Lynch',
    cathieWood: '🚀 Cathie Wood',
    michaelBurry: '🔍 Michael Burry',
    billAckman: '🎯 Bill Ackman',
    philFisher: '🔬 Phil Fisher',
    stanleyDruckenmiller: '🌐 Stanley Druckenmiller',
    aswathDamodaran: '📊 Aswath Damodaran',
    mohnishPabrai: '💎 Mohnish Pabrai',
    rakeshJhunjhunwala: '🐂 Rakesh Jhunjhunwala',
  };

  // Get all persona agents from both sources
  const allPersonas: Record<string, PersonaAgent> = { ...data.personaAgents };
  
  // Add individual fields if they exist
  Object.keys(personaNames).forEach(key => {
    const agentData = (data as any)[key];
    if (agentData && !allPersonas[key]) {
      allPersonas[key] = agentData;
    }
  });

  // Render each persona agent
  Object.entries(allPersonas).forEach(([key, agent]) => {
    if (!agent || !agent.analysis) return;

    const displayName = personaNames[key] || key;
    const signalColor: [number, number, number] = 
      agent.signal === 'Bullish' ? COLORS.success :
      agent.signal === 'Bearish' ? COLORS.danger :
      COLORS.warning;

    // Extract just the detailed reasoning text, removing markdown headers and duplicate info
    // The agent.analysis contains: "### Agent Name Analysis\n**Signal: X** (Y%)\n\nDetailed reasoning..."
    let reasoningText = agent.analysis;
    
    // Remove markdown headers (lines starting with ###)
    reasoningText = reasoningText.replace(/^###\s+.*$/gm, '');
    
    // Remove signal/confidence lines (e.g., "**Signal: Bearish** (80%)")
    reasoningText = reasoningText.replace(/\*\*Signal:\s*(Bullish|Bearish|Neutral)\*\*\s*\(\d+%\)/gi, '');
    
    // Remove metrics display lines (e.g., "**Metrics:** P/E: 5.76, P/B: 3.90")
    reasoningText = reasoningText.replace(/\*\*Metrics:\*\*[^\n]*/gi, '');
    reasoningText = reasoningText.replace(/\*\*.*?\*\*:\s*[^\n]*/g, ''); // Remove other bold label patterns
    
    // Remove extra whitespace and trim
    reasoningText = reasoningText.replace(/\n\n+/g, '\n\n').trim();
    
    // If after cleaning we have no text, skip this agent
    if (!reasoningText || reasoningText.length < 50) return;

    // Better height estimation for page breaks (use cleaned text)
    const splitTextLines = doc.splitTextToSize(reasoningText, pageWidth - 28);
    const estimatedHeight = splitTextLines.length * 4.2 + 35; // More accurate line height
    
    if (finalY + estimatedHeight > pageHeight - 35) {
      doc.addPage();
      setDarkBackground();
      finalY = 20;
    }

    // Persona card header
    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(10, finalY, pageWidth - 20, 12, 2, 2, 'F');
    doc.setFillColor(...signalColor);
    doc.rect(10, finalY, 3, 12, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(displayName, 18, finalY + 8);
    
    // Signal badge
    doc.setFillColor(...signalColor);
    doc.roundedRect(pageWidth - 55, finalY + 2, 40, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textPrimary);
    doc.text(`${agent.signal || 'N/A'} (${agent.confidence}%)`, pageWidth - 35, finalY + 8, { align: 'center' });
    
    finalY += 16;
    
    // Analysis content - use cleaned reasoning text
    doc.setFontSize(8.5); // Slightly smaller font for better fit
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textSecondary);
    
    // Re-split with the correct font size
    const finalSplitAnalysis = doc.splitTextToSize(reasoningText, pageWidth - 28);
    
    // Check again if content fits, if not add page
    if (finalY + (finalSplitAnalysis.length * 4.2) > pageHeight - 25) {
      doc.addPage();
      setDarkBackground();
      finalY = 20;
      
      // Re-render header on new page
      doc.setFillColor(...COLORS.surface);
      doc.roundedRect(10, finalY, pageWidth - 20, 12, 2, 2, 'F');
      doc.setFillColor(...signalColor);
      doc.rect(10, finalY, 3, 12, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.textPrimary);
      doc.text(displayName, 18, finalY + 8);
      doc.setFillColor(...signalColor);
      doc.roundedRect(pageWidth - 55, finalY + 2, 40, 8, 2, 2, 'F');
      doc.setFontSize(8);
      doc.text(`${agent.signal || 'N/A'} (${agent.confidence}%)`, pageWidth - 35, finalY + 8, { align: 'center' });
      finalY += 16;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.textSecondary);
    }
    
    doc.text(finalSplitAnalysis, 14, finalY);
    
    finalY += (finalSplitAnalysis.length * 4.2) + 12; // Extra spacing between agents
  });

  // --- Footer on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 15;
    doc.setFillColor(...COLORS.surface);
    doc.rect(0, footerY - 5, pageWidth, 20, 'F');
    
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(
      'Disclaimer: This report is AI-generated for informational purposes only. Not financial advice. Conduct your own due diligence.',
      pageWidth / 2, footerY, { align: 'center' }
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, footerY + 6, { align: 'right' });
  }

  doc.save(`${data.ticker.toUpperCase()} - Report.pdf`);
};
