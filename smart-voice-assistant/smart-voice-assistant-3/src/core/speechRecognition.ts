class SpeechRecognition {
    private recognition: SpeechRecognitionAPI;

    constructor() {
        this.recognition = new (window as any).SpeechRecognition();
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // Default language
    }

    startRecognition(callback: (transcript: string) => void) {
        this.recognition.start();
        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            callback(transcript);
        };
    }

    stopRecognition() {
        this.recognition.stop();
    }
}

export default SpeechRecognition;