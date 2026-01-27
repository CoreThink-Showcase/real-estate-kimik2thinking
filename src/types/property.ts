export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  propertyType: 'house' | 'condo' | 'townhouse' | 'apartment';
  imageUrl: string;
  description: string;
  features: string[];
  pros: string[];
  cons: string[];
  neighborhoodScore: number;
  schoolRating: number;
  commuteTime: number; // in minutes
  propertyTax: number;
  hoaFees?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: Property[];
  comparison?: PropertyComparison;
}

export interface PropertyComparison {
  properties: Property[];
  tradeoffs: TradeoffAnalysis[];
  recommendation: string;
}

export interface TradeoffAnalysis {
  category: string;
  winner: string;
  explanation: string;
}