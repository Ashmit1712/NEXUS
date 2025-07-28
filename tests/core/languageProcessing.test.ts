import { LanguageProcessing } from '../../src/core/languageProcessing';
import { ConfigManager } from '../../src/config/configManager';

describe('LanguageProcessing', () => {
  let languageProcessor: LanguageProcessing;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager();
    languageProcessor = new LanguageProcessing(config);
  });

  describe('command processing', () => {
    it('should process device control commands', async () => {
      const result = await languageProcessor.processCommand('turn on the living room lights');
      
      expect(result.intent).toBe('device_control');
      expect(result.action).toBe('turn_on');
      expect(result.entities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'device',
            value: expect.stringContaining('light')
          }),
          expect.objectContaining({
            type: 'room',
            value: expect.stringContaining('living_room')
          })
        ])
      );
    });

    it('should process information requests', async () => {
      const result = await languageProcessor.processCommand('what time is it');
      
      expect(result.intent).toBe('information_request');
      expect(result.action).toBe('get_information');
    });

    it('should process system control commands', async () => {
      const result = await languageProcessor.processCommand('stop');
      
      expect(result.intent).toBe('system_control');
      expect(result.action).toBe('stop');
    });

    it('should handle greetings', async () => {
      const result = await languageProcessor.processCommand('hello');
      
      expect(result.intent).toBe('greeting');
      expect(result.action).toBe('greet');
    });

    it('should handle unknown commands', async () => {
      const result = await languageProcessor.processCommand('xyz random command');
      
      expect(result.intent).toBe('unknown');
      expect(result.action).toBe('unknown');
    });
  });

  describe('entity extraction', () => {
    it('should extract device entities', async () => {
      const result = await languageProcessor.processCommand('turn on the thermostat');
      
      const deviceEntity = result.entities.find(e => e.type === 'device');
      expect(deviceEntity).toBeDefined();
      expect(deviceEntity?.value).toBe('thermostat');
    });

    it('should extract room entities', async () => {
      const result = await languageProcessor.processCommand('dim the bedroom lights');
      
      const roomEntity = result.entities.find(e => e.type === 'room');
      expect(roomEntity).toBeDefined();
      expect(roomEntity?.value).toBe('bedroom');
    });

    it('should extract number entities', async () => {
      const result = await languageProcessor.processCommand('set temperature to 72 degrees');
      
      const numberEntity = result.entities.find(e => e.type === 'number');
      expect(numberEntity).toBeDefined();
      expect(numberEntity?.value).toBe('72');
    });
  });

  describe('confidence scoring', () => {
    it('should return higher confidence for exact matches', async () => {
      const result1 = await languageProcessor.processCommand('turn on lights');
      const result2 = await languageProcessor.processCommand('maybe turn on lights please');
      
      expect(result1.confidence).toBeGreaterThan(result2.confidence);
    });
  });

  describe('custom patterns', () => {
    it('should allow adding custom intent patterns', () => {
      languageProcessor.addCustomPattern('custom_intent', /custom pattern/i);
      // Test would verify the pattern was added
    });

    it('should allow adding custom entity patterns', () => {
      languageProcessor.addCustomEntity('custom_entity', /custom entity/gi);
      // Test would verify the entity pattern was added
    });
  });

  describe('translation', () => {
    it('should provide translation placeholder', () => {
      const result = languageProcessor.translate('hello', 'es');
      expect(result).toContain('hello');
      expect(result).toContain('es');
    });
  });

  describe('supported languages', () => {
    it('should return list of supported languages', () => {
      const languages = languageProcessor.getSupportedLanguages();
      expect(languages).toBeInstanceOf(Array);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('en-US');
    });
  });
});