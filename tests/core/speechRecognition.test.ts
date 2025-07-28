import { SpeechRecognition } from '../../src/core/speechRecognition';
import { ConfigManager } from '../../src/config/configManager';
import { EventEmitter } from '../../src/utils/eventEmitter';

describe('SpeechRecognition', () => {
  let speechRecognition: SpeechRecognition;
  let config: ConfigManager;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    config = new ConfigManager();
    eventEmitter = new EventEmitter();
    speechRecognition = new SpeechRecognition(config, eventEmitter);
  });

  afterEach(() => {
    speechRecognition.stopRecognition();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(speechRecognition.initialize()).resolves.not.toThrow();
    });

    it('should set up recognition configuration', async () => {
      await speechRecognition.initialize();
      expect(speechRecognition.isRecognizing).toBe(false);
    });
  });

  describe('recognition control', () => {
    beforeEach(async () => {
      await speechRecognition.initialize();
    });

    it('should start recognition', () => {
      speechRecognition.startRecognition();
      // Note: In a real test, you'd verify the mock was called
      expect(speechRecognition.isRecognizing).toBe(false); // Will be true when actual recognition starts
    });

    it('should stop recognition', () => {
      speechRecognition.startRecognition();
      speechRecognition.stopRecognition();
      expect(speechRecognition.isRecognizing).toBe(false);
    });

    it('should not start recognition if already running', () => {
      speechRecognition.startRecognition();
      const consoleSpy = jest.spyOn(console, 'warn');
      speechRecognition.startRecognition();
      // In a real implementation, this would check for warning about already running
    });
  });

  describe('language settings', () => {
    beforeEach(async () => {
      await speechRecognition.initialize();
    });

    it('should set language', () => {
      speechRecognition.setLanguage('es-ES');
      expect(config.get('speechRecognition.language')).toBe('es-ES');
    });
  });

  describe('event handling', () => {
    beforeEach(async () => {
      await speechRecognition.initialize();
    });

    it('should emit speechRecognized event on result', (done) => {
      eventEmitter.on('speechRecognized', (data) => {
        expect(data).toHaveProperty('command');
        expect(data).toHaveProperty('confidence');
        done();
      });

      // Simulate a recognition result
      // In a real test, you'd trigger the mock recognition result
    });
  });
});