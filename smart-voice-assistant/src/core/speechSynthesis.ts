export class SpeechSynthesis {
    private utterance: SpeechSynthesisUtterance;

    constructor() {
        this.utterance = new SpeechSynthesisUtterance();
    }

    speak(text: string, language: string = 'en-US'): void {
        this.utterance.text = text;
        this.utterance.lang = language;
        speechSynthesis.speak(this.utterance);
    }

    stopSpeaking(): void {
        speechSynthesis.cancel();
    }
}