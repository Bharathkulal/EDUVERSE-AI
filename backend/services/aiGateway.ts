export interface AIResponse {
  text: string;
  providerUsed: string;
  modelUsed: string;
}

export interface QuizQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string; // 'a', 'b', 'c', or 'd'
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

export interface AIGateway {
  generateResponse(prompt: string, options?: { enableSearch?: boolean; systemInstruction?: string }): Promise<AIResponse>;
  generateQuiz(topic: string, difficulty: string, count: number): Promise<QuizResult>;
  generateMockTest(subject: string, count: number): Promise<QuizResult>;
  generateCodingSolution(problemDesc: string, language: string): Promise<string>;
  generateRoadmap(topic: string): Promise<string>;
  generateExplanation(concept: string): Promise<string>;
  generateStudyPlan(profile: any): Promise<string>;
  generateInterviewQuestion(role: string, difficulty: string): Promise<string>;
  generateRecommendation(studentContext: string): Promise<string[]>;
  generateAnalyticsInsight(metrics: any): Promise<string>;
  voiceAssistant(audioBuffer: Buffer): Promise<any>;
  speechToText(audioBuffer: Buffer): Promise<string>;
  textToSpeech(text: string): Promise<Buffer>;
  futureAIRequest(params: any): Promise<any>;
}
