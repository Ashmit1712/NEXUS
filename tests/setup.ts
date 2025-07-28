// Test setup file
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock browser APIs that might not be available in Node.js test environment
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: true,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
  onerror: null,
  onstart: null,
  onend: null,
}));

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text: text || '',
  lang: 'en-US',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null,
}));

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  pending: false,
  speaking: false,
  paused: false,
  onvoiceschanged: null,
};

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

// Mock window object for browser-specific tests
Object.defineProperty(global, 'window', {
  value: {
    SpeechRecognition: global.SpeechRecognition,
    webkitSpeechRecognition: global.SpeechRecognition,
    speechSynthesis: global.speechSynthesis,
    SpeechSynthesisUtterance: global.SpeechSynthesisUtterance,
  },
  writable: true,
});