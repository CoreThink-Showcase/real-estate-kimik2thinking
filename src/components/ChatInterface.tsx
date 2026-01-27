import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Property, PropertyComparison } from '../types/property';
import { PropertyCard } from './PropertyCard';
import { ComparisonView } from './ComparisonView';
import { mockProperties } from '../data/mockProperties';
import './ChatInterface.css';

// Generate unique IDs without using Date during render
let messageIdCounter = 0;
const generateId = () => `msg-${++messageIdCounter}`;

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI real estate assistant. I can help you find the perfect home by comparing properties and explaining the tradeoffs. What are you looking for? Try asking about:\n\n• Properties in a specific price range\n• Homes with certain features\n• Comparing specific listings\n• Understanding pros and cons',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [activeComparison, setActiveComparison] = useState<PropertyComparison | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(input);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (query: string): ChatMessage => {
    const lowerQuery = query.toLowerCase();

    // Handle comparison requests
    if (lowerQuery.includes('compare') && selectedProperties.length >= 2) {
      const comparison = generateComparison(selectedProperties);
      return {
        id: generateId(),
        role: 'assistant',
        content: `I've analyzed ${selectedProperties.length} properties for you. Here's what I found:\n\n${comparison.tradeoffs.map(t => `**${t.category}:** ${t.winner} - ${t.explanation}`).join('\n\n')}\n\n💡 ${comparison.recommendation}`,
        timestamp: new Date(),
        comparison,
      };
    }

    // Handle price range queries
    if (lowerQuery.includes('price') || lowerQuery.includes('under') || lowerQuery.includes('budget')) {
      const maxPrice = extractPrice(lowerQuery) || 600000;
      const filtered = mockProperties.filter((p) => p.price <= maxPrice);
      return {
        id: generateId(),
        role: 'assistant',
        content: `I found ${filtered.length} properties under ${formatPrice(maxPrice)}. Here are some options that might work for your budget:`,
        timestamp: new Date(),
        properties: filtered,
      };
    }

    // Handle bedroom queries
    if (lowerQuery.includes('bedroom') || lowerQuery.includes('bed')) {
      const bedrooms = extractNumber(lowerQuery) || 3;
      const filtered = mockProperties.filter((p) => p.bedrooms >= bedrooms);
      return {
        id: generateId(),
        role: 'assistant',
        content: `Here are ${filtered.length} properties with ${bedrooms}+ bedrooms:`,
        timestamp: new Date(),
        properties: filtered,
      };
    }

    // Handle location queries
    if (lowerQuery.includes('austin') || lowerQuery.includes('location') || lowerQuery.includes('area')) {
      return {
        id: generateId(),
        role: 'assistant',
        content: 'Here are all available properties in Austin. The market has options ranging from downtown condos to suburban family homes. What area interests you most?',
        timestamp: new Date(),
        properties: mockProperties,
      };
    }

    // Handle family/home queries
    if (lowerQuery.includes('family') || lowerQuery.includes('kids') || lowerQuery.includes('school')) {
      const familyFriendly = mockProperties.filter(
        (p) => p.schoolRating >= 8 && p.bedrooms >= 3 && p.neighborhoodScore >= 8
      );
      return {
        id: generateId(),
        role: 'assistant',
        content: 'For families, I recommend focusing on properties with good schools and safe neighborhoods. Here are the best family-friendly options:',
        timestamp: new Date(),
        properties: familyFriendly,
      };
    }

    // Handle commute queries
    if (lowerQuery.includes('commute') || lowerQuery.includes('downtown') || lowerQuery.includes('work')) {
      const closeToDowntown = mockProperties.filter((p) => p.commuteTime <= 20);
      return {
        id: generateId(),
        role: 'assistant',
        content: 'Here are properties with shorter commute times (under 20 minutes to downtown):',
        timestamp: new Date(),
        properties: closeToDowntown,
      };
    }

    // Handle investment queries
    if (lowerQuery.includes('investment') || lowerQuery.includes('rental') || lowerQuery.includes('appreciation')) {
      const investmentProps = mockProperties.filter(
        (p) => p.price / p.squareFeet < 300 && p.neighborhoodScore >= 7
      );
      return {
        id: generateId(),
        role: 'assistant',
        content: 'For investment properties, look for good price per square foot in up-and-coming neighborhoods. Here are some promising options:',
        timestamp: new Date(),
        properties: investmentProps,
      };
    }

    // Default response
    return {
      id: generateId(),
      role: 'assistant',
      content: 'I can help you find the right property! Try asking me about:\n\n• Properties under a specific price\n• Homes with 3+ bedrooms\n• Family-friendly neighborhoods\n• Short commute options\n• Investment opportunities\n\nOr select properties and ask me to compare them!',
      timestamp: new Date(),
      properties: mockProperties.slice(0, 3),
    };
  };

  const generateComparison = (properties: Property[]): PropertyComparison => {
    const tradeoffs = [];

    // Price comparison
    const cheapest = properties.reduce((min, p) => (p.price < min.price ? p : min));
    const expensive = properties.reduce((max, p) => (p.price > max.price ? p : max));
    tradeoffs.push({
      category: 'Affordability',
      winner: cheapest.address,
      explanation: `${formatPrice(cheapest.price)} vs ${formatPrice(expensive.price)} - saves you ${formatPrice(expensive.price - cheapest.price)} upfront`,
    });

    // Space comparison
    const largest = properties.reduce((max, p) => (p.squareFeet > max.squareFeet ? p : max));
    tradeoffs.push({
      category: 'Space',
      winner: largest.address,
      explanation: `${largest.squareFeet.toLocaleString()} sq ft at $${Math.round(largest.price / largest.squareFeet)}/sq ft - best value for space`,
    });

    // Location comparison
    const bestLocation = properties.reduce((best, p) => (p.neighborhoodScore > best.neighborhoodScore ? p : best));
    tradeoffs.push({
      category: 'Location',
      winner: bestLocation.address,
      explanation: `Neighborhood score of ${bestLocation.neighborhoodScore}/10 with ${bestLocation.commuteTime}min commute`,
    });

    // Schools comparison
    const bestSchools = properties.reduce((best, p) => (p.schoolRating > best.schoolRating ? p : best));
    tradeoffs.push({
      category: 'Schools',
      winner: bestSchools.address,
      explanation: `School rating of ${bestSchools.schoolRating}/10 - excellent for families`,
    });

    // Generate recommendation
    const familyFriendly = properties.filter((p) => p.schoolRating >= 8 && p.bedrooms >= 4);
    const bestValue = properties.reduce((best, p) => 
      (p.price / p.squareFeet < best.price / best.squareFeet ? p : best)
    );

    let recommendation = '';
    if (familyFriendly.length > 0) {
      recommendation = `For families, I recommend ${familyFriendly[0].address} with its excellent schools and spacious layout. `;
    }
    recommendation += `For best overall value, consider ${bestValue.address} at $${Math.round(bestValue.price / bestValue.squareFeet)}/sq ft.`;

    return {
      properties,
      tradeoffs,
      recommendation,
    };
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperties((prev) => {
      const exists = prev.find((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), property];
      }
      return [...prev, property];
    });
  };

  const handleShowComparison = (comparison: PropertyComparison) => {
    setActiveComparison(comparison);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const extractPrice = (text: string): number | null => {
    const match = text.match(/(\d+)[kK]?/);
    if (match) {
      const num = parseInt(match[1]);
      return num < 1000 ? num * 1000 : num;
    }
    return null;
  };

  const extractNumber = (text: string): number | null => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>🏠 AI Real Estate Assistant</h1>
        <p>Find your perfect home with intelligent comparisons</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              
              {message.properties && (
                <div className="message-properties">
                  {message.properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={handlePropertySelect}
                      isSelected={selectedProperties.some((p) => p.id === property.id)}
                    />
                  ))}
                </div>
              )}

              {message.comparison && (
                <button
                  className="view-comparison-btn"
                  onClick={() => handleShowComparison(message.comparison!)}
                >
                  📊 View Detailed Comparison
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {selectedProperties.length > 0 && (
        <div className="selected-properties-bar">
          <span>{selectedProperties.length} selected</span>
          <button
            onClick={() => {
              const comparison = generateComparison(selectedProperties);
              setActiveComparison(comparison);
            }}
            disabled={selectedProperties.length < 2}
          >
            Compare Now
          </button>
          <button className="clear-btn" onClick={() => setSelectedProperties([])}>
            Clear
          </button>
        </div>
      )}

      <div className="chat-input-area">
        <div className="quick-suggestions">
          <button onClick={() => setInput('Show me houses under $500k')}>Under $500k</button>
          <button onClick={() => setInput('Family homes with good schools')}>Family homes</button>
          <button onClick={() => setInput('Short commute to downtown')}>Short commute</button>
          <button onClick={() => setInput('Best investment properties')}>Investment</button>
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about properties, prices, locations, or compare listings..."
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}>
            Send
          </button>
        </div>
      </div>

      {activeComparison && (
        <ComparisonView
          comparison={activeComparison}
          onClose={() => setActiveComparison(null)}
        />
      )}
    </div>
  );
}