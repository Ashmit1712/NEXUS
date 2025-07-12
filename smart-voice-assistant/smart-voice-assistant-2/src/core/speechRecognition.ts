class SpeechRecognition {
    private recognition: SpeechRecognitionAPI; // Assuming a SpeechRecognitionAPI type exists
    private isRecognizing: boolean;

    constructor() {
        this.recognition = new SpeechRecognitionAPI(); // Initialize the speech recognition API
        this.isRecognizing = false;

        this.recognition.onresult = this.onResult.bind(this);
        this.recognition.onerror = this.onError.bind(this);
    }

    startRecognition() {
        if (!this.isRecognizing) {
            this.recognition.start();
            this.isRecognizing = true;
        }
    }

    stopRecognition() {
        if (this.isRecognizing) {
            this.recognition.stop();
            this.isRecognizing = false;
        }
    }

    onResult(event: SpeechRecognitionEvent) {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized speech:', transcript);
        // Further processing of the recognized speech can be done here
    }

    private onError(event: SpeechRecognitionError) {
        console.error('Speech recognition error:', event.error);
        // Handle errors accordingly
    }
}

export default SpeechRecognition;