export class SpeechSynthesis {
    private speech: SpeechSynthesisUtterance;

    constructor() {
        this.speech = new SpeechSynthesisUtterance();
    }

    speak(text: string, language: string = 'en-US'): void {
        this.speech.text = text;
        this.speech.lang = language;
        speechSynthesis.speak(this.speech);
    }

    stopSpeaking(): void {
        speechSynthesis.cancel();
    }
}